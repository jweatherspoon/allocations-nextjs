'use client';

import AddTransactionForm from '@/components/funds/details/add-transaction-form';
import ModalContainer from '@/components/shared/modal/modal-container';
import { TransactionDetails } from '@/models/funds/transaction.model';

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSaveAction,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveAction: (data: TransactionDetails) => Promise<void>;
}) {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h2 className='text-lg font-semibold text-midnight mb-2'>
        Add New Transaction
      </h2>
      <hr className='border-t border-flame' />
      <AddTransactionForm
        onSaveAction={async (data) => {
          await onSaveAction(data);
          onClose();
        }}
      />
    </ModalContainer>
  );
}
