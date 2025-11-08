'use client';

import AddTransactionForm from '@/components/funds/details/add-transaction-form';
import { TransactionDetails } from '@/models/funds/transaction.model';

export default function AddTransactionModalContent({
  onSaveAction,
}: {
  onSaveAction: (data: TransactionDetails) => Promise<void>;
}) {
  return (
    <div>
      <h2 className='text-lg font-semibold text-midnight mb-2'>
        Add New Transaction
      </h2>
      <hr className='border-t border-flame' />
      <AddTransactionForm onSaveAction={onSaveAction} />
    </div>
  );
}
