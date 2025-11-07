'use server';

import { getUserId } from '@/api/auth/auth0.api';
import { upsertUserData } from '@/api/auth/user.api';
import { getDbContainer } from '@/api/db/db-context.api';
import { getFundDetails } from '@/api/funds/funds.api';
import { FundDetails } from '@/models/funds/fund.model';
import { PlanDetails, PlannedAllocation } from '@/models/funds/plan.model';

export async function getUserPlans(): Promise<PlanDetails[]> {
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
        notes: `Allocation from "${plan.name}"`,
      });
    }
  }

  return upsertUserData({ plans: [plan], funds: Array.from(fundMap.values()) });
}
