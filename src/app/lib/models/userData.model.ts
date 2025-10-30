import { FundDetails } from '@/app/lib/models/funds/fund.model';
import { PlanDetails } from '@/app/lib/models/funds/plan.model';

export interface UserData {
  id: string;
  funds?: FundDetails[];
  plans?: PlanDetails[];
}
