'use server';

import { fetchTestData } from '@/app/lib/_test-data/test-data';
import { verifySession } from '@/app/lib/auth/session';
import { PlanDetails, PlannedAllocation } from '@/app/lib/models/funds/plan';

export async function getAllPlans(): Promise<PlanDetails[]> {
  await verifySession();
  return getTestPlans();
}

async function getTestPlans(): Promise<PlanDetails[]> {
  const testData = await fetchTestData();
  return testData.data.plans
    .map(convertPlanDetails)
    .sort((a, b) => b.expectedDate.localeCompare(a.expectedDate));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertPlanDetails(plan: any): PlanDetails {
  return {
    id: plan.id,
    name: plan.name,
    amount: plan.totalAmount,
    expectedDate: plan.expectedDate,
    status: plan.status,
    allocations: plan.allocations.map(convertAllocation),
    notes: plan.notes,
    createdAt: plan.createdAt,
    modifiedAt: plan.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertAllocation(allocation: any): PlannedAllocation {
  return {
    id: allocation.id,
    targetFundId: allocation.goalId,
    value: allocation.amount,
    notes: allocation.notes,
    type: 'deposit',
    status: 'pending',
    createdAt: Date.now().toLocaleString(),
    modifiedAt: Date.now().toLocaleString(),
  };
}
