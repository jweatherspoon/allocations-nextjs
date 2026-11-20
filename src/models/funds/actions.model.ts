/**
 * Shared argument/result types for fund and plan server actions.
 * Lives outside the `'use server'` modules, which may only export async functions.
 */

export type LogEntry = {
  fundId: string;
  type: 'deposit' | 'withdrawal';
  value: number;
  notes?: string;
};

/** Points at one transaction of one fund (used for Undo). */
export type TxRef = { fundId: string; transactionId: string };

export type CreateFundInput = {
  name: string;
  description?: string;
  targetAmount?: number;
  /** `YYYY-MM-DD` */
  targetDate?: string;
};
