export interface FundGroup {
  id: string;
  name: string;
  description: string;

  createdAt: string;
  modifiedAt: string;

  rank?: number;
  parentGroupId?: string;
}
