'use server';

import { getUserId } from '@/lib/auth/auth0';
import {
  addFund,
  addTransaction,
  fetchFundDetails,
  getUserData,
} from '@/lib/db/db-context';
import { FundDetails } from '@/lib/models/funds/fund.model';
import { TransactionDetails } from '@/lib/models/funds/transaction.model';

export async function getActiveFunds(): Promise<FundDetails[]> {
  const userData = await getUserData();
  return userData?.funds ?? [];
}

export async function getFundDetails(
  fundIds: string[]
): Promise<FundDetails[] | null> {
  return fetchFundDetails(fundIds);
}

export async function createFund(
  fundDetails: Partial<FundDetails>
): Promise<boolean> {
  const userId = await getUserId();

  // add metadata to the fundDetails
  const fundToCreate: FundDetails = {
    ...fundDetails,
    id: crypto.randomUUID(),
    name: fundDetails.name || 'New Fund',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    transactions: fundDetails.transactions || [],
    status: fundDetails.status || 'active',
    currentAmount: fundDetails.currentAmount || 0,
    description: fundDetails.description || '',
    targetAmount: fundDetails.targetAmount,
    targetDate: fundDetails.targetDate,
    groupId: fundDetails.groupId,
    rank: fundDetails.rank,
  };

  return addFund(userId, fundToCreate);
}

export async function addTransactionToFund(
  fundId: string,
  transaction: TransactionDetails
): Promise<boolean> {
  const userId = await getUserId();

  return addTransaction(userId, fundId, transaction);
}
