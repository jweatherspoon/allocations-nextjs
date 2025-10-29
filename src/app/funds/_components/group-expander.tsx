'use client';

import { useState } from 'react';
import { FundGroup } from '@/app/lib/models/funds/group.model';
import { FundDetails } from '@/app/lib/models/funds/fund.model';
import FundCard from './fund-card';

interface HierarchyNode extends FundGroup {
  subgroups: HierarchyNode[];
  funds: FundDetails[];
}

export interface GroupExpanderProps {
  group: HierarchyNode;
  level?: number;
}

export default function GroupExpander({ group, level = 0 }: GroupExpanderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasContent = group.funds.length > 0 || group.subgroups.length > 0;
  const paddingLeft = level * 1.5; // 1.5rem per level

  return (
    <div className="space-y-3" style={{ paddingLeft: level > 0 ? `${paddingLeft}rem` : undefined }}>
      {/* Group Header */}
      <div 
        className={`flex items-center gap-3 p-4 rounded-lg border ${
          level === 0 
            ? 'bg-gray-50 border-gray-300' 
            : 'bg-white border-gray-200'
        } ${hasContent ? 'cursor-pointer hover:bg-gray-100' : ''} transition-colors`}
        onClick={() => hasContent && setIsExpanded(!isExpanded)}
      >
        {/* Expand/Collapse Icon */}
        {hasContent && (
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
        
        {/* Group Info */}
        <div className="flex-1 min-w-0">
          <h2 className={`font-semibold text-gray-900 ${
            level === 0 ? 'text-xl' : 'text-lg'
          }`}>
            {group.name}
          </h2>
          {group.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        {/* Stats Badge */}
        <div className="flex gap-2 text-sm">
          {group.funds.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              {group.funds.length} {group.funds.length === 1 ? 'fund' : 'funds'}
            </span>
          )}
          {group.subgroups.length > 0 && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
              {group.subgroups.length} {group.subgroups.length === 1 ? 'subgroup' : 'subgroups'}
            </span>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && hasContent && (
        <div className="space-y-3">
          {/* Funds */}
          {group.funds.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.funds.map((fund) => (
                <FundCard
                  key={fund.id}
                  id={fund.id}
                  name={fund.name}
                  description={fund.description}
                  currentAmount={fund.currentAmount}
                  targetAmount={fund.targetAmount}
                  status={fund.status}
                />
              ))}
            </div>
          )}

          {/* Subgroups */}
          {group.subgroups.length > 0 && (
            <div className="space-y-3">
              {group.subgroups.map((subgroup) => (
                <GroupExpander
                  key={subgroup.id}
                  group={subgroup}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
