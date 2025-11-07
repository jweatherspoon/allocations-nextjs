'use client';

import AddAllocationForm from '@/components/plans/details/add-allocation-form';
import ModalContainer from '@/components/shared/modal/modal-container';
import { FundDetails } from '@/models/funds/fund.model';
import { PlannedAllocation } from '@/models/funds/plan.model';

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
