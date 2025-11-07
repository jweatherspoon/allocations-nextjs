'use client';

import { useForm } from 'react-hook-form';

import Button from '@/components/shared/button/button';
import { ControlledDatePickerInput } from '@/components/shared/form/inputs/controlled-date-picker-input';
import { ControlledNumericInput } from '@/components/shared/form/inputs/controlled-numeric-input';
import { ControlledSelectInput } from '@/components/shared/form/inputs/controlled-select-input';
import { ControlledTextInput } from '@/components/shared/form/inputs/controlled-text-input';
import { TransactionDetails } from '@/models/funds/transaction.model';

interface TransactionFormData {
  amount: string;
  type: string;
  notes: string;
  createdAt: string;
}

export default function AddTransactionForm({
  onSaveAction,
}: {
  onSaveAction: (data: TransactionDetails) => Promise<void>;
}) {
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<TransactionFormData>({
    mode: 'onChange',
    defaultValues: {
      amount: '',
      type: 'deposit',
      notes: '',
      createdAt: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    const transaction: TransactionDetails = {
      id: window.crypto.randomUUID(),
      type: data.type as 'deposit' | 'withdrawal' | 'transfer',
      value: parseFloat(data.amount),
      status: 'completed',
      createdAt: data.createdAt || new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      notes: data.notes,
    };

    await onSaveAction(transaction);
  };

  return (
    <div className='mt-2'>
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <ControlledNumericInput
          name='amount'
          control={control}
          id='transaction-amount'
          label='Transaction Amount'
          placeholder='Enter amount'
          validations={{
            required: true,
            min: 0.01,
          }}
        />

        <ControlledSelectInput
          name='type'
          control={control}
          id='transaction-type'
          label='Transaction Type'
          options={[
            { value: 'deposit', label: 'Deposit' },
            { value: 'withdrawal', label: 'Withdrawal' },
            { value: 'transfer', label: 'Transfer' },
          ]}
          validations={{
            required: true,
          }}
        />

        <ControlledDatePickerInput
          name='createdAt'
          control={control}
          id='transaction-date'
          label='Transaction Date'
          validations={{
            required: true,
          }}
        />

        <ControlledTextInput
          name='notes'
          control={control}
          id='transaction-notes'
          label='Notes (Optional)'
          placeholder='Additional details about the transaction'
          validations={{
            maxLength: 120,
          }}
          rows={3}
        />

        <Button
          type='submit'
          disabled={!isValid || isSubmitting}
          className='w-full mt-4'
        >
          Save Transaction
        </Button>
      </form>
    </div>
  );
}
