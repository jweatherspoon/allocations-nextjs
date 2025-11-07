import { TransactionDetails } from '@/models/funds/transaction.model';

export type PlanStatus = 'pending' | 'completed' | 'canceled';

export interface PlannedAllocation extends TransactionDetails {
  type: 'deposit';
  targetFundId: string;
}

export interface PlanDetails {
  id: string;
  name: string;
  amount: number;
  expectedDate: string;
  status: PlanStatus;
  allocations: PlannedAllocation[];

  notes?: string;

  createdAt: string;
  modifiedAt: string;
}
