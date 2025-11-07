import { SqlQuerySpec } from '@azure/cosmos';

import { auth0 } from '@/api/auth/auth0.api';
import { getDbContainer } from '@/api/db/db-context.api';
import { FundDetails } from '@/models/funds/fund.model';
import { PlanDetails } from '@/models/funds/plan.model';
import { UserData } from '@/models/user/userData.model';

export async function getUserData(): Promise<UserData | null> {
  const session = await auth0.getSession();
  if (!session) {
    return null;
  }

  const { user } = session;
  if (!user?.sub) {
    return null;
  }

  const container = await getDbContainer();
  const querySpec: SqlQuerySpec = {
    query: 'SELECT * FROM c WHERE c.id = @id',
    parameters: [{ name: '@id', value: user.sub }],
  };

  const { resources } = await container.items
    .query<UserData>(querySpec)
    .fetchAll();

  return resources.length > 0 ? resources[0] : null;
}

export async function upsertUserData(
  data: Partial<UserData>
): Promise<boolean> {
  const currentUser = await getUserData();
  const container = await getDbContainer();

  try {
    if (currentUser) {
      // Update existing user
      const updatedUser: UserData = {
        ...currentUser,
        funds: reconcileFunds(currentUser.funds, data.funds),
        plans: reconcilePlans(currentUser.plans, data.plans),
      };
      await container.item(currentUser.id, currentUser.id).replace(updatedUser);
    } else {
      // Create new user
      if (!data.id) {
        throw new Error('User ID is required to create a new user');
      }

      const newUser: UserData = {
        id: data.id,
        funds: data.funds || [],
        plans: data.plans || [],
      };

      await container.items.create(newUser);
    }

    return true;
  } catch (error) {
    console.error('Error upserting user data:', error);
    return false;
  }
}

function reconcileFunds(
  existingFunds?: FundDetails[],
  newFunds?: FundDetails[]
) {
  const fundMap = new Map<string, FundDetails>(
    existingFunds?.map((fund) => [fund.id, fund])
  );

  newFunds?.forEach((newFund) => {
    fundMap.set(newFund.id, newFund);
  });

  return Array.from(fundMap.values());
}

function reconcilePlans(
  existingPlans?: PlanDetails[],
  newPlans?: PlanDetails[]
) {
  const planMap = new Map<string, PlanDetails>(
    existingPlans?.map((plan) => [plan.id, plan])
  );

  newPlans?.forEach((newPlan) => {
    planMap.set(newPlan.id, newPlan);
  });

  return Array.from(planMap.values());
}
