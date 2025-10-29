import { verifySession } from '@/app/lib/auth/session';
import { getActiveFunds } from '@/app/lib/funds/funds';

import FundCard from '@/app/(funds)/_components/fund-card';
// import { getAllGroups } from '@/app/lib/funds/groups';
// import { FundGroup } from '@/app/lib/models/funds/group';
// import { FundDetails } from '@/app/lib/models/funds/fund';
// import GroupExpander from '@/app/(funds)/_components/group-expander';

export default async function Home() {
  await verifySession();

  // const fundGroups = await getAllGroups();
  const activeFunds = await getActiveFunds();

  // Build hierarchy structure
  // interface HierarchyNode extends FundGroup {
  //   subgroups: HierarchyNode[];
  //   funds: FundDetails[];
  // }

  // const buildHierarchy = (groups: FundGroup[], funds: FundDetails[]): HierarchyNode[] => {
  //   const groupMap = new Map<string, HierarchyNode>(
  //     groups.map(group => [group.id, { ...group, subgroups: [], funds: [] }])
  //   );
  //   const rootGroups: HierarchyNode[] = [];

  //   // First, establish parent-child relationships for groups
  //   for (const group of groups) {
  //     const groupNode = groupMap.get(group.id)!;
  //     if (group.parentGroupId && groupMap.has(group.parentGroupId)) {
  //       groupMap.get(group.parentGroupId)!.subgroups.push(groupNode);
  //     } else {
  //       rootGroups.push(groupNode);
  //     }
  //   }

  //   // Then, assign funds to their respective groups
  //   for (const fund of funds) {
  //     if (fund.groupId && groupMap.has(fund.groupId)) {
  //       groupMap.get(fund.groupId)!.funds.push(fund);
  //     }
  //   }

  //   return rootGroups;
  // };

  // const hierarchy = buildHierarchy(fundGroups, activeFunds);

  return (
    <div className="space-y-4">
      {/* {hierarchy.map((group) => (
        <GroupExpander key={group.id} group={group} />
      ))} */}
      {activeFunds.length === 0 ? (
        <p className="text-gray-600">No active funds available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeFunds.map((fund) => (
            <FundCard key={fund.id} {...fund} />
          ))}
        </div>
      )}
    </div>
  );
}