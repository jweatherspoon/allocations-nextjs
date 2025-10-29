'use server';

import { fetchTestData } from '@/app/lib/_test-data/test-data';
import { verifySession } from '@/app/lib/auth/session';
import { FundGroup } from '@/app/lib/models/funds/group.model';

export async function getAllGroups(): Promise<FundGroup[]> {
  await verifySession();

  const testData = await fetchTestData();
  const groups: FundGroup[] = testData.data.groups.map((group) =>
    convertFundGroupDetails(group)
  );

  return groups;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertFundGroupDetails(group: any): FundGroup {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    createdAt: group.createdAt,
    modifiedAt: group.updatedAt,
    rank: group.rank,
  };
}
