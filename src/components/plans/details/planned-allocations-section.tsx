'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import AddAllocationModal from '@/components/plans/details/add-allocation-modal';
import AllocationDetailsCard from '@/components/plans/details/allocation-details-card';
import Button from '@/components/shared/button/button';
import DetailsSectionContainer from '@/components/shared/containers/sections/details-section-container';
import { ProgressBar } from '@/components/shared/progress/progress-bar';
import { addAllocationToPlan, executePlan } from '@/lib/plans/plans';
import { FundDetails } from '@/models/funds/fund.model';
import { PlanDetails } from '@/models/funds/plan.model';

export default function PlannedAllocationsSection({
  planDetails,
  activeFunds,
}: {
  planDetails: PlanDetails;
  activeFunds: FundDetails[];
}) {
  const router = useRouter();
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

  const canExecute = remainingAllocatableAmount === 0;
  const execute = async (planId: string) => {
    const success = await executePlan(planId);
    if (success) {
      // Handle successful execution (e.g., show a success message)
      router.refresh();
    } else {
      // Handle failed execution (e.g., show an error message)
    }
  };

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
            <p className='text-dusk text-center mt-4'>
              No recent allocations found.
            </p>
          )}
        </div>
      </DetailsSectionContainer>

      {planDetails.status === 'pending' && (
        <Button
          disabled={!canExecute}
          onClick={async () => await execute(planDetails.id)}
          className='mt-4 w-full'
        >
          {canExecute
            ? 'Execute Plan'
            : 'Cannot Execute: Incomplete Allocations'}
        </Button>
      )}

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
