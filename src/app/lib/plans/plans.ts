'use server';

import { getUserId } from '@/app/lib/auth/auth0';
import { getAllocationsDbContext, getUserData } from '@/app/lib/db/db-context';
import { PlanDetails } from '@/app/lib/models/funds/plan.model';

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
