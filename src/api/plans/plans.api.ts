'use server';

import { revalidatePath } from 'next/cache';

import { getUserData, upsertUserData } from '@/api/auth/user.api';
import { applyLogEntry, applyVoid } from '@/api/funds/ledger';
import type { TxRef } from '@/models/funds/actions.model';
import { FundDetails } from '@/models/funds/fund.model';
import { PlanDetails, PlannedAllocation } from '@/models/funds/plan.model';

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
