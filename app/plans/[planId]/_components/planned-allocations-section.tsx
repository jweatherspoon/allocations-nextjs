'use client';

import FundTransactionCard from '@/app/funds/_components/fund-transaction-card';
import { FundDetails } from '@/app/lib/models/funds/fund.model';
import { PlanDetails } from '@/app/lib/models/funds/plan.model';
import { addAllocationToPlan } from '@/app/lib/plans/plans';
import AddAllocationModal from '@/app/plans/[planId]/_components/add-allocation-modal';
import AllocationDetailsCard from '@/app/plans/[planId]/_components/allocation-details-card';
import DetailsSectionContainer from '@/components/containers/sections/details-section-container';
import { ProgressBar } from '@/components/progress/progress-bar';
import { useState } from 'react';

export default function PlannedAllocationsSection({
  planDetails,
  activeFunds,
}: {
  planDetails: PlanDetails;
  activeFunds: FundDetails[];
}) {
  const [newAllocations, setNewAllocations] = useState(
    planDetails.allocations || []
  );

  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  const totalAllocatedAmount = newAllocations.reduce(
    (sum, allocation) => sum + allocation.value,
    0
  );

  const remainingAllocatableAmount = planDetails.amount - totalAllocatedAmount;

  const progressPercentage = Math.min(
    (totalAllocatedAmount / planDetails.amount) * 100,
    100
  );

  return (
    <div>
      {/* Planned Allocations Section */}
      <DetailsSectionContainer>
        <div className='flex justify-between items-end mb-2'>
          <h3 className='text-lg text-midnight'>Planned Allocations</h3>
          {planDetails.status === 'pending' && (
            <button
              className='p-1.5 rounded-full bg-flame text-cream hover:bg-opacity-90 transition-colors'
              aria-label='Add new allocation'
              onClick={() => setIsAllocationModalOpen(true)}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          )}
        </div>
        <ProgressBar progress={progressPercentage} />
        <div className='flex justify-between items-center mt-2 mb-2'>
          <span className='text-xs text-midnight'>
            Allocated: ${totalAllocatedAmount.toLocaleString()}
          </span>
          <span className='text-xs text-midnight'>
            Remaining: ${remainingAllocatableAmount.toLocaleString()}
          </span>
        </div>
        <hr className='border-t border-flame mb-2' />
        <div className='space-y-3 overflow-y'>
          {newAllocations.length > 0 ? (
            newAllocations
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 10)
              .map((allocation) => (
                <AllocationDetailsCard
                  key={allocation.id}
                  fundName={
                    activeFunds.find(
                      (fund) => fund.id === allocation.targetFundId
                    )?.name || allocation.targetFundId
                  }
                  amount={`$${allocation.value.toLocaleString()}`}
                  notes={allocation.notes}
                />
              ))
          ) : (
            <p className='text-dusk'>No recent allocations found.</p>
          )}
        </div>
      </DetailsSectionContainer>
      <AddAllocationModal
        activeFunds={activeFunds}
        remainingAllocatableAmount={remainingAllocatableAmount}
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        onSave={async (data) => {
          // Here you would typically send the new allocation to your backend or update state
          const success = await addAllocationToPlan(planDetails.id, data);
          if (!success) {
            console.error('Failed to add allocation.');
            return;
          }

          setNewAllocations((prev) => [...prev, data]);
        }}
      />
    </div>
  );
}
