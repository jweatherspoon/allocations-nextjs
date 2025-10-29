import { TransactionDetails } from '@/app/lib/models/funds/transaction';

export type FundStatus = 'active' | 'archived' | 'pending';

export interface FundDetails {
  id: string;
  name: string;
  status: FundStatus;
  description: string;
  currentAmount: number;
  transactions: TransactionDetails[];

  createdAt: string;
  modifiedAt: string;

  rank?: number;
  groupId?: string;
  targetAmount?: number;
}
