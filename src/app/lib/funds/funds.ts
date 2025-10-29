'use server';

import { fetchTestData } from '@/app/lib/_test-data/test-data';
import { verifySession } from '@/app/lib/auth/session';
import { FundDetails } from '@/app/lib/models/funds/fund.model';
import { TransactionDetails } from '@/app/lib/models/funds/transaction.model';

export async function getActiveFunds(): Promise<FundDetails[]> {
  const session = await verifySession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Fetch active funds from the database or any other source
  const activeFunds: FundDetails[] = await getTestFunds(); // Replace with actual data fetching logic

  return activeFunds.sort((a, b) => (b.rank || 0) - (a.rank || 0));
}

export async function getFundDetailsV2(
  fundIds: string[]
): Promise<FundDetails[] | null> {
  const session = await verifySession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Fetch fund details from the database or any other source
  const allFunds = await getTestFunds(); // Replace with actual data fetching logic
  const fundDetails = allFunds.filter((fund) => fundIds.includes(fund.id));

  return fundDetails;
}

export async function getFundDetails(
  fundId: string
): Promise<FundDetails | null> {
  const session = await verifySession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Fetch fund details from the database or any other source
  const allFunds = await getTestFunds(); // Replace with actual data fetching logic
  const fundDetails = allFunds.find((fund) => fund.id === fundId) || null;

  return fundDetails;
}

async function getTestFunds(): Promise<FundDetails[]> {
  const testData = await fetchTestData();

  const transactionByFundId = new Map<string, TransactionDetails[]>();
  for (const tx of testData.data.events) {
    if (!transactionByFundId.has(tx.goalId)) {
      transactionByFundId.set(tx.goalId, []);
    }

    transactionByFundId.get(tx.goalId)!.push(convertTransactionDetails(tx));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const funds: FundDetails[] = testData.data.goals.map((fund: any) =>
    convertFundDetails(fund, transactionByFundId)
  );

  return funds;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertTransactionDetails(tx: any) {
  const txType = tx.type === 'adjustment' ? 'transfer' : tx.type;
  return {
    id: tx.id,
    value: tx.amount,
    status: 'completed' as const,
    type: txType,
    createdAt: tx.createdAt,
    modifiedAt: tx.createdAt,
    notes: tx.notes,
  };
}

function convertFundDetails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fund: any,
  transactionMap: Map<string, TransactionDetails[]>
): FundDetails {
  return {
    id: fund.id,
    name: fund.name,
    description: fund.description,
    targetAmount: fund.targetAmount,
    currentAmount: fund.currentAmount,
    status: fund.completed ? 'archived' : 'active',
    transactions: transactionMap.get(fund.id) || [],
    createdAt: fund.createdAt,
    modifiedAt: fund.updatedAt,
    groupId: fund.groupId,
    rank: fund.sortOrder,
  };
}
