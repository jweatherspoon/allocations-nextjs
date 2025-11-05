'use client';

import { useState } from 'react';
import { TransactionDetails } from '@/lib/models/funds/transaction.model';
import Button from '@/components/button/button';
import NumericInput from '@/components/form/inputs/numeric-input';
import SelectInput from '@/components/form/inputs/select-input';
import TextInput from '@/components/form/inputs/text-input';
import ModalContainer from '@/components/modal/modal-container';

export default function AddTransactionForm({
  onSave,
}: {
  onSave: (data: TransactionDetails) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'deposit',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({
    amount: 'x',
  });

  const hasErrors = Object.keys(errors).some((key) => errors[key]);

  const handleChange = (field: string, value: string, error?: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }

      console.log(prevErrors, newErrors, field, error);
      return newErrors;
    });
  };

  return (
    <div className='mt-2'>
      <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
        <NumericInput
          id='transaction-amount'
          label='Transaction Amount'
          placeholder='Enter amount'
          value={formData.amount}
          onChange={(e, err) => handleChange('amount', e, err)}
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
          onChange={(e, err) => handleChange('type', e, err)}
          validations={{
            required: true,
          }}
        />

        <TextInput
          id='transaction-notes'
          label='Notes (Optional)'
          value={formData.notes}
          onChange={(e, err) => handleChange('notes', e, err)}
          placeholder='Additional details about the transaction'
          validations={{
            maxLength: 120,
          }}
          rows={3}
        />

        <Button
          disabled={hasErrors}
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
          }}
        >
          Save Transaction
        </Button>
      </form>
    </div>
  );
}
