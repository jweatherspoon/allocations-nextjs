'use client';

import { FundDetails } from '@/app/lib/models/funds/fund.model';
import { PlannedAllocation } from '@/app/lib/models/funds/plan.model';
import AddAllocationForm from '@/app/plans/[planId]/_components/add-allocation-form';
import ModalContainer from '@/components/modal/modal-container';

export default function AddAllocationModal({
  isOpen,
  onClose,
  onSave,
  activeFunds,
  remainingAllocatableAmount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PlannedAllocation) => Promise<void>;
  activeFunds: FundDetails[];
  remainingAllocatableAmount: number;
}) {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h2 className='text-lg font-semibold text-midnight mb-2'>
        Add Allocation
      </h2>
      <hr className='border-t border-flame' />
      <AddAllocationForm
        activeFunds={activeFunds.filter((fund) => fund.status === 'active')}
        totalAvailableAmount={remainingAllocatableAmount}
        onSave={async (data) => {
          await onSave(data);
          onClose();
        }}
      />
    </ModalContainer>
  );
}
