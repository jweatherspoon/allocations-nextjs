export type TransactionStatus = 'pending' | 'completed' | 'deleted';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';

export interface TransactionDetails {
  id: string;
  value: number;
  status: TransactionStatus;
  type: TransactionType;
  createdAt: string;
  modifiedAt: string;
  notes?: string;
}
