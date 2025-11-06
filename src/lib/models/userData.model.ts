import { FundDetails } from './funds/fund.model';
import { PlanDetails } from './funds/plan.model';

export interface UserData {
  id: string;
  funds?: FundDetails[];
  plans?: PlanDetails[];
}
