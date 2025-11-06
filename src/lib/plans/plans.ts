'use server';

import { getUserId } from '@/lib/auth/auth0';
import { getUserData, getAllocationsDbContext } from '@/lib/db/db-context';
import { FundDetails } from '@/models/funds/fund.model';
import { PlanDetails, PlannedAllocation } from '@/models/funds/plan.model';
import { TransactionDetails } from '@/models/funds/transaction.model';

export async function getAllPlans(): Promise<PlanDetails[]> {
  const userData = await getUserData();
  return userData?.plans ?? [];
}

export async function getPlanDetails(
  planIds: string[]
): Promise<PlanDetails[] | null> {
  const userId = await getUserId();
  const container = await getAllocationsDbContext();

  const querySpec = {
    query:
      'SELECT VALUE p FROM c JOIN p IN c.plans WHERE c.id = @userId AND ARRAY_CONTAINS(@planIds, p.id)',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@planIds', value: planIds },
    ],
  };

  const { resources } = await container.items
    .query<PlanDetails>(querySpec)
    .fetchAll();

  return resources.length > 0 ? resources : null;
}

export async function createPlan(
  planDetails: Partial<PlanDetails>
): Promise<boolean> {
  const userId = await getUserId();
  const container = await getAllocationsDbContext();

  // add metadata to the planDetails
  const planToCreate: PlanDetails = {
    ...planDetails,
    id: crypto.randomUUID(),
    name: planDetails.name || 'New Plan',
    amount: planDetails.amount || 0,
    expectedDate: planDetails.expectedDate || new Date().toISOString(),
    status: planDetails.status || 'pending',
    allocations: planDetails.allocations || [],
    notes: planDetails.notes,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };

  try {
    // Check if user document exists
    const { resource: existingUser } = await container
      .item(userId, userId)
      .read();

    if (existingUser) {
      // User exists, add plan to plans array
      const updatedPlans = existingUser.plans
        ? [...existingUser.plans, planToCreate]
        : [planToCreate];
      await container.item(userId, userId).replace({
        ...existingUser,
        plans: updatedPlans,
      });
    } else {
      // User doesn't exist, create new document with plans array
      await container.items.create({
        id: userId,
        userId,
        plans: [planToCreate],
      });
    }
    return true;
  } catch (error) {
    console.error('Error adding plan:', error);
    return false;
  }
}

export async function addAllocationToPlan(
  planId: string,
  allocation: PlannedAllocation
): Promise<boolean> {
  const userId = await getUserId();
  const container = await getAllocationsDbContext();

  try {
    // Check if user document exists
    const { resource: existingUser } = await container
      .item(userId, userId)
      .read();

    if (existingUser) {
      // User exists, add allocation to plan
      let planFound = false;
      const updatedPlans = existingUser.plans.map((plan: PlanDetails) => {
        if (plan.id === planId) {
          planFound = true;

          return {
            ...plan,
            allocations: [...(plan.allocations || []), allocation],
          };
        }

        return plan;
      });

      if (!planFound) {
        console.error('Plan not found when adding allocation');
        return false;
      }

      await container.item(userId, userId).replace({
        ...existingUser,
        plans: updatedPlans,
      });
    } else {
      // User doesn't exist, create new document
      console.error('User not found when adding allocation');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding allocation:', error);
    return false;
  }
}

export async function executePlan(planId: string): Promise<boolean> {
  const userData = await getUserData();
  if (!userData) {
    console.error('Failed to execute plan: User data not found');
    return false;
  }

  const plan = userData?.plans?.find((p) => p.id === planId);

  if (!plan) {
    console.error('Failed to execute plan: Plan not found');
    return false;
  }

  const newFunds = structuredClone(userData.funds) as FundDetails[];
  const allocationToFundsMap = new Map<string, FundDetails>();
  for (const alloc of plan.allocations) {
    const fund = newFunds?.find((f) => f.id === alloc.targetFundId);
    if (fund) {
      allocationToFundsMap.set(alloc.targetFundId, fund);
    }
  }

  for (const alloc of plan.allocations) {
    const fund = allocationToFundsMap.get(alloc.targetFundId);
    if (fund) {
      const transaction: TransactionDetails = {
        id: alloc.id,
        createdAt: alloc.createdAt,
        modifiedAt: new Date().toISOString(),
        value: alloc.value,
        type: 'deposit',
        status: 'completed',
        notes: `Allocation from "${plan.name}"`,
      };

      fund.transactions.push(transaction);
      fund.currentAmount += alloc.value;
    }
  }

  const newPlans = userData.plans!.map((p: PlanDetails) => {
    if (p.id === planId) {
      return {
        ...p,
        status: 'completed',
        allocations: p.allocations.map((alloc) => ({
          ...alloc,
          status: 'completed',
        })),
      };
    }

    return p;
  });

  const userId = userData.id;
  try {
    const container = await getAllocationsDbContext();
    await container.item(userId, userId).replace({
      ...userData,
      funds: newFunds,
      plans: newPlans,
    });

    return true;
  } catch (error) {
    console.error(`Error executing plan ${plan.name} [${planId}]:`, error);
    return false;
  }
}
