import { FundDetails } from '@/models/funds/fund.model';
import { PlanDetails } from '@/models/funds/plan.model';

export interface UserData {
  id: string;
  funds?: FundDetails[];
  plans?: PlanDetails[];
}
