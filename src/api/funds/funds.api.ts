'use server';

import { revalidatePath } from 'next/cache';

import { getUserId } from '@/api/auth/auth0.api';
import {
  getUserData,
  removeUserFund,
  upsertUserData,
} from '@/api/auth/user.api';
import { getDbContainer } from '@/api/db/db-context.api';
import { DEMO_MODE } from '@/api/demo/demo-mode';
import { applyLogEntry, applyVoid } from '@/api/funds/ledger';
import { fundHue, HUES } from '@/lib/pace/colors';
import type {
  CreateFundInput,
  LogEntry,
  TxRef,
} from '@/models/funds/actions.model';
import { FundDetails, FundStatus } from '@/models/funds/fund.model';
import { TransactionDetails } from '@/models/funds/transaction.model';

export async function getUserFunds(): Promise<FundDetails[]> {
  const userData = await getUserData();
  return userData?.funds ?? [];
}

export async function getFundDetails(
  fundIds: string[]
): Promise<FundDetails[] | null> {
  if (DEMO_MODE) {
    const funds = (await getUserData())?.funds ?? [];
    return funds.filter((f) => fundIds.includes(f.id));
  }

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
  transaction: Partial<TransactionDetails>
): Promise<boolean> {
  const fund = await getFundDetails([fundId]).then((f) => f?.[0]);
  if (!fund) return false;

  const filledOutTransaction: TransactionDetails = {
    ...transaction,
    modifiedAt: new Date().toISOString(),
    createdAt: transaction.createdAt || new Date().toISOString(),
    id: transaction.id || crypto.randomUUID(),
    status: transaction.status || 'completed',
    type: transaction.type || 'deposit',
    value: transaction.value || 0,
  };

  fund.transactions.push(filledOutTransaction);

  const value =
    filledOutTransaction.type === 'withdrawal'
      ? -filledOutTransaction.value
      : filledOutTransaction.value;

  fund.currentAmount += value;
  return upsertFunds([fund]);
}

export async function editFundDetails(
  updatedDetails: Partial<FundDetails>
): Promise<boolean> {
  return upsertFunds([updatedDetails]);
}

function revalidateApp() {
  revalidatePath('/', 'layout');
}

/** Records deposits/withdrawals across funds in a single write. `refs` enables Undo. */
export async function logTransactions(
  entries: LogEntry[]
): Promise<{ ok: boolean; refs: TxRef[] }> {
  const failure = { ok: false, refs: [] as TxRef[] };
  const valid = entries.filter(
    (e) => Number.isFinite(e.value) && e.value > 0 && e.fundId
  );
  if (!valid.length) return failure;

  const user = await getUserData();
  if (!user?.funds) return failure;

  const now = new Date().toISOString();
  const touched = new Map<string, FundDetails>();
  const refs: TxRef[] = [];
  for (const entry of valid) {
    const fund = user.funds.find((f) => f.id === entry.fundId);
    if (!fund) return failure;
    refs.push(applyLogEntry(fund, entry, now));
    touched.set(fund.id, fund);
  }

  const ok = await upsertUserData({
    id: user.id,
    funds: Array.from(touched.values()),
  });
  if (ok) revalidateApp();
  return ok ? { ok, refs } : failure;
}

/** Undo for `logTransactions`: marks the transactions deleted and reverses the balances. */
export async function voidTransactions(refs: TxRef[]): Promise<boolean> {
  const user = await getUserData();
  if (!user?.funds) return false;

  const changed = applyVoid(user.funds, refs, new Date().toISOString());
  if (!changed.length) return false;

  const ok = await upsertUserData({ id: user.id, funds: changed });
  if (ok) revalidateApp();
  return ok;
}

/** Creates a fund (goal when it has a target amount and date, otherwise a pot). */
export async function createFund(
  input: CreateFundInput
): Promise<{ ok: boolean; fundId: string }> {
  const name = input.name?.trim();
  if (!name) return { ok: false, fundId: '' };

  const user = await getUserData();
  const userId = user?.id ?? (await getUserId());
  const existing = user?.funds ?? [];

  const used = new Set(existing.map((f) => fundHue(f)));
  const hue =
    HUES.find((h) => !used.has(h)) ?? HUES[existing.length % HUES.length];

  const isGoal = !!input.targetAmount && !!input.targetDate;
  const now = new Date().toISOString();
  const fund: FundDetails = {
    id: crypto.randomUUID(),
    name,
    description: input.description?.trim() ?? '',
    status: 'active',
    currentAmount: 0,
    transactions: [],
    createdAt: now,
    modifiedAt: now,
    hue,
    ...(isGoal
      ? { targetAmount: input.targetAmount, targetDate: input.targetDate }
      : {}),
  };

  const ok = await upsertUserData({ id: userId, funds: [fund] });
  if (ok) revalidateApp();
  return { ok, fundId: ok ? fund.id : '' };
}

/** Removes a fund entirely (Undo of `createFund`). */
export async function deleteFund(fundId: string): Promise<boolean> {
  const ok = await removeUserFund(fundId);
  if (ok) revalidateApp();
  return ok;
}

export async function setFundStatus(
  fundId: string,
  status: Extract<FundStatus, 'active' | 'archived'>
): Promise<boolean> {
  const user = await getUserData();
  const fund = user?.funds?.find((f) => f.id === fundId);
  if (!user || !fund) return false;

  fund.status = status;
  fund.modifiedAt = new Date().toISOString();

  const ok = await upsertUserData({ id: user.id, funds: [fund] });
  if (ok) revalidateApp();
  return ok;
}
