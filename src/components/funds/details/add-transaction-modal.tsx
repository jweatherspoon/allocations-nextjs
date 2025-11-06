'use client';

import AddTransactionForm from '@/components/funds/details/add-transaction-form';
import ModalContainer from '@/components/shared/modal/modal-container';
import { TransactionDetails } from '@/lib/models/funds/transaction.model';

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TransactionDetails) => Promise<void>;
}) {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h2 className='text-lg font-semibold text-midnight mb-2'>
        Add New Transaction
      </h2>
      <hr className='border-t border-flame' />
      <AddTransactionForm
        onSave={async (data) => {
          await onSave(data);
          onClose();
        }}
      />
    </ModalContainer>
  );
}
