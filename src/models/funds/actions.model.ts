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

/**
 * Editable fund properties. `null` removes a target or deadline.
 * A fund is a goal only when it has both; otherwise it is a pot.
 */
export type UpdateFundInput = {
  name: string;
  description: string;
  targetAmount: number | null;
  /** `YYYY-MM-DD` */
  targetDate: string | null;
};
