'use server';

import { getUserId } from '@/api/auth/auth0.api';
import { getUserData, upsertUserData } from '@/api/auth/user.api';
import { getDbContainer } from '@/api/db/db-context.api';
import { FundDetails } from '@/models/funds/fund.model';
import { TransactionDetails } from '@/models/funds/transaction.model';

export async function getUserFunds(): Promise<FundDetails[]> {
  const userData = await getUserData();
  return userData?.funds ?? [];
}

export async function getFundDetails(
  fundIds: string[]
): Promise<FundDetails[] | null> {
  const userId = await getUserId();
  const container = await getDbContainer();
  const query = {
    query:
      'SELECT VALUE f FROM c JOIN f IN c.funds WHERE c.id = @userId AND ARRAY_CONTAINS(@fundIds, f.id)',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@fundIds', value: fundIds },
    ],
  };

  const { resources } = await container.items
    .query<FundDetails>(query)
    .fetchAll();
  return resources;
}

export async function upsertFunds(
  funds: Partial<FundDetails>[]
): Promise<boolean> {
  const filledOutFunds: FundDetails[] = funds.map((fund) => ({
    ...fund,
    id: fund.id || crypto.randomUUID(),
    name: fund.name || 'New Fund',
    createdAt: fund.createdAt || new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    currentAmount: fund.currentAmount || 0,
    transactions: fund.transactions || [],
    status: fund.status || 'active',
    description: fund.description || '',
    targetAmount: fund.targetAmount,
    targetDate: fund.targetDate,
    groupId: fund.groupId,
    rank: fund.rank,
  }));

  return upsertUserData({ funds: filledOutFunds });
}

export async function addTransactionToFund(
  fundId: string,
  transaction: TransactionDetails
): Promise<boolean> {
  const fund = await getFundDetails([fundId]).then((f) => f?.[0]);
  if (!fund) return false;

  fund.transactions.push(transaction);
  return upsertFunds([fund]);
}
