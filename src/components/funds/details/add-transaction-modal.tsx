'use client';

import AddTransactionForm from '@/components/funds/details/add-transaction-form';
import { TransactionDetails } from '@/lib/models/funds/transaction.model';
// import Button from '@/components/button/button';
// import NumericInput from '@/components/form/inputs/numeric-input';
// import SelectInput from '@/components/form/inputs/select-input';
// import TextInput from '@/components/form/inputs/text-input';
import ModalContainer from '@/components/shared/modal/modal-container';
// import { useState } from 'react';

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TransactionDetails) => Promise<void>;
}) {
  // const [formData, setFormData] = useState({
  //   amount: '',
  //   type: 'deposit',
  //   notes: '',
  // })

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
      {/* <div className='mt-2 space-y-4'>
        <NumericInput 
          id='transaction-amount'
          label='Transaction Amount'
          placeholder='Enter amount'
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e })}
          validations={{
            required: true,
            min: 0.01,
          }}
        />

        <SelectInput
          id='transaction-type'
          label='Transaction Type'
          options={[
            { value: 'deposit', label: 'Deposit' },
            { value: 'withdrawal', label: 'Withdrawal' },
            { value: 'transfer', label: 'Transfer' },
          ]}
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e })}
          validations={{
            required: true,
          }}
        />

        <TextInput
          id='transaction-notes'
          label='Notes (Optional)'
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e })}
          placeholder='Additional details about the transaction'
          validations={{
            maxLength: 500,
          }}
          rows={3}
        />

        <Button
          className='w-full mt-4'
          onClick={async () => {
            const transaction: TransactionDetails = {
              id: window.crypto.randomUUID(),
              type: formData.type as 'deposit' | 'withdrawal' | 'transfer',
              value: parseFloat(formData.amount),
              status: 'completed',
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
              notes: formData.notes,
            };

            await onSave(transaction);
            onClose();
          }}
        >
          Save Transaction
        </Button>
      </div> */}
    </ModalContainer>
  );
}
