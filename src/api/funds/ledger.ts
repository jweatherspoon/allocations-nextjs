/**
 * Pure ledger helpers used by the server actions. Not a `'use server'` module:
 * these mutate the in-memory fund objects they are given and never touch storage.
 */
import type { LogEntry, TxRef } from '@/models/funds/actions.model';
import type { FundDetails } from '@/models/funds/fund.model';
import type { TransactionDetails } from '@/models/funds/transaction.model';

const round2 = (n: number) => Math.round(n * 100) / 100;

const signed = (t: Pick<TransactionDetails, 'type' | 'value'>) =>
  t.type === 'withdrawal' ? -t.value : t.value;

/** Appends the entry as a completed transaction and updates the balance. */
export function applyLogEntry(
  fund: FundDetails,
  entry: LogEntry,
  now: string,
  transactionId: string = crypto.randomUUID()
): TxRef {
  const tx: TransactionDetails = {
    id: transactionId,
    type: entry.type,
    value: entry.value,
    status: 'completed',
    createdAt: now,
    modifiedAt: now,
    ...(entry.notes?.trim() ? { notes: entry.notes.trim() } : {}),
  };
  fund.transactions = [...(fund.transactions ?? []), tx];
  fund.currentAmount = round2((fund.currentAmount ?? 0) + signed(tx));
  fund.modifiedAt = now;
  return { fundId: fund.id, transactionId };
}

/**
 * Marks the referenced transactions `deleted` and reverses their effect on the balance.
 * Already-deleted or missing transactions are skipped. Returns the funds that changed.
 */
export function applyVoid(
  funds: FundDetails[],
  refs: TxRef[],
  now: string
): FundDetails[] {
  const changed = new Set<FundDetails>();
  for (const ref of refs) {
    const fund = funds.find((f) => f.id === ref.fundId);
    const tx = fund?.transactions?.find((t) => t.id === ref.transactionId);
    if (!fund || !tx || tx.status === 'deleted') continue;
    if (tx.status === 'completed') {
      fund.currentAmount = round2((fund.currentAmount ?? 0) - signed(tx));
    }
    tx.status = 'deleted';
    tx.modifiedAt = now;
    fund.modifiedAt = now;
    changed.add(fund);
  }
  return Array.from(changed);
}
