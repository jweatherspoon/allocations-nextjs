'use server';

import { revalidatePath } from 'next/cache';

import { getUserId } from '@/api/auth/auth0.api';
import { getUserData, upsertUserData } from '@/api/auth/user.api';
import { getDbContainer } from '@/api/db/db-context.api';
import { DEMO_MODE } from '@/api/demo/demo-mode';
import { getFundDetails } from '@/api/funds/funds.api';
import { applyLogEntry, applyVoid } from '@/api/funds/ledger';
import type { TxRef } from '@/models/funds/actions.model';
import { FundDetails } from '@/models/funds/fund.model';
import { PlanDetails, PlannedAllocation } from '@/models/funds/plan.model';

export async function getUserPlans(): Promise<PlanDetails[]> {
  if (DEMO_MODE) return (await getUserData())?.plans ?? [];

  const userId = await getUserId();
  const container = await getDbContainer();

  const query = {
    query: 'SELECT VALUE p FROM c JOIN p IN c.plans WHERE c.id = @userId',
    parameters: [{ name: '@userId', value: userId }],
  };

  const { resources } = await container.items
    .query<PlanDetails>(query)
    .fetchAll();
  return resources;
}

export async function getPlanDetails(
  planIds: string[]
): Promise<PlanDetails[] | null> {
  if (DEMO_MODE) {
    const plans = (await getUserData())?.plans ?? [];
    const found = plans.filter((p) => planIds.includes(p.id));
    return found.length > 0 ? found : null;
  }

  const userId = await getUserId();
  const container = await getDbContainer();

  const query = {
    query:
      'SELECT VALUE p FROM c JOIN p IN c.plans WHERE c.id = @userId AND ARRAY_CONTAINS(@planIds, p.id)',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@planIds', value: planIds },
    ],
  };

  const { resources } = await container.items
    .query<PlanDetails>(query)
    .fetchAll();

  return resources.length > 0 ? resources : null;
}

export async function upsertPlans(
  plans: Partial<PlanDetails>[]
): Promise<boolean> {
  const filledOutPlans: PlanDetails[] = plans.map((plan) => ({
    ...plan,
    id: plan.id || crypto.randomUUID(),
    name: plan.name || 'New Plan',
    createdAt: plan.createdAt || new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    notes: plan.notes || '',
    amount: plan.amount || 0,
    expectedDate: plan.expectedDate || new Date().toISOString(),
    status: plan.status || 'pending',
    allocations: plan.allocations || [],
  }));

  return upsertUserData({ plans: filledOutPlans });
}

export async function addAllocationToPlan(
  planId: string,
  allocation: PlannedAllocation
): Promise<boolean> {
  const plan = await getPlanDetails([planId]).then((p) => p?.[0]);
  if (!plan) return false;

  plan.allocations.push(allocation);
  return upsertPlans([plan]);
}

export async function executePlan(planId: string): Promise<boolean> {
  const plan = await getPlanDetails([planId]).then((p) => p?.[0]);
  if (!plan) {
    return false;
  }

  const modifiedAt = new Date().toISOString();

  plan.status = 'completed';
  plan.modifiedAt = modifiedAt;
  plan.allocations.forEach((allocation) => {
    allocation.status = 'completed';
    allocation.modifiedAt = modifiedAt;
  });

  const fundIds = plan.allocations.map((alloc) => alloc.targetFundId);
  const fundsToUpdate = await getFundDetails(fundIds);
  if (!fundsToUpdate) {
    return false;
  }

  const fundMap = new Map<string, FundDetails>(
    fundsToUpdate.map((f) => [f.id, f])
  );

  for (const allocation of plan.allocations) {
    const fund = fundMap.get(allocation.targetFundId);
    if (fund) {
      fund.currentAmount += allocation.value;
      fund.modifiedAt = modifiedAt;
      fund.transactions.push({
        id: allocation.id,
        createdAt: allocation.createdAt,
        modifiedAt: modifiedAt,
        value: allocation.value,
        type: 'deposit',
        status: 'completed',
        notes: allocation.notes || `Plan execution: ${plan.name}`,
      });
    }
  }

  return upsertUserData({ plans: [plan], funds: Array.from(fundMap.values()) });
}

/**
 * Stores a completed "Paycheck split" plan and deposits each allocation into its fund
 * (note "Paycheck split"), all in one write.
 */
export async function recordSplit(
  amount: number,
  allocations: Record<string, number>
): Promise<{ ok: boolean; planId: string; refs: TxRef[] }> {
  const failure = { ok: false, planId: '', refs: [] as TxRef[] };
  const user = await getUserData();
  if (!user?.funds) return failure;

  const now = new Date().toISOString();
  const planId = crypto.randomUUID();
  const refs: TxRef[] = [];
  const touched: FundDetails[] = [];
  const plannedAllocations: PlannedAllocation[] = [];

  for (const [fundId, value] of Object.entries(allocations)) {
    if (!(value > 0)) continue;
    const fund = user.funds.find((f) => f.id === fundId);
    if (!fund) return failure;

    const allocationId = crypto.randomUUID();
    refs.push(
      applyLogEntry(
        fund,
        { fundId, type: 'deposit', value, notes: 'Paycheck split' },
        now,
        allocationId
      )
    );
    touched.push(fund);
    plannedAllocations.push({
      id: allocationId,
      type: 'deposit',
      value,
      status: 'completed',
      createdAt: now,
      modifiedAt: now,
      notes: 'Paycheck split',
      targetFundId: fundId,
    });
  }
  if (!refs.length) return failure;

  const plan: PlanDetails = {
    id: planId,
    name: 'Paycheck split',
    amount,
    expectedDate: now,
    status: 'completed',
    allocations: plannedAllocations,
    createdAt: now,
    modifiedAt: now,
  };

  const ok = await upsertUserData({
    id: user.id,
    funds: touched,
    plans: [plan],
  });
  if (ok) revalidatePath('/', 'layout');
  return ok ? { ok, planId, refs } : failure;
}

/** Undo for `recordSplit`: voids the deposits and marks the plan canceled. */
export async function undoSplit(
  planId: string,
  refs: TxRef[]
): Promise<boolean> {
  const user = await getUserData();
  if (!user?.funds) return false;

  const now = new Date().toISOString();
  const changedFunds = applyVoid(user.funds, refs, now);
  const plan = user.plans?.find((p) => p.id === planId);
  if (plan) {
    plan.status = 'canceled';
    plan.modifiedAt = now;
  }
  if (!changedFunds.length && !plan) return false;

  const ok = await upsertUserData({
    id: user.id,
    funds: changedFunds,
    plans: plan ? [plan] : [],
  });
  if (ok) revalidatePath('/', 'layout');
  return ok;
}
