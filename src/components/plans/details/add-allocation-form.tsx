'use client';

import { useForm } from 'react-hook-form';

import Button from '@/components/shared/button/button';
import { ControlledNumericInput } from '@/components/shared/form/inputs/controlled-numeric-input';
import { ControlledSelectInput } from '@/components/shared/form/inputs/controlled-select-input';
import { ControlledTextInput } from '@/components/shared/form/inputs/controlled-text-input';
import { FundDetails } from '@/models/funds/fund.model';
import { PlannedAllocation } from '@/models/funds/plan.model';

interface AllocationFormData {
  amount: string;
  notes: string;
  targetFundId: string;
}

export default function AddAllocationForm({
  onSave,
  activeFunds,
  totalAvailableAmount,
}: {
  onSave: (data: PlannedAllocation) => Promise<void>;
  activeFunds: FundDetails[];
  totalAvailableAmount: number;
}) {
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<AllocationFormData>({
    mode: 'onChange',
    defaultValues: {
      amount: '',
      notes: '',
      targetFundId: '',
    },
  });

  const onSubmit = async (data: AllocationFormData) => {
    const allocation: PlannedAllocation = {
      id: window.crypto.randomUUID(),
      type: 'deposit',
      value: parseFloat(data.amount),
      status: 'pending',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      notes: data.notes,
      targetFundId: data.targetFundId,
    };

    await onSave(allocation);
  };

  return (
    <div className='mt-2'>
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <ControlledSelectInput
          name='targetFundId'
          control={control}
          id='target-fund'
          label='Target Fund'
          options={activeFunds.map((fund) => ({
            value: fund.id,
            label: fund.name,
          }))}
          placeholder='Select target fund'
          validations={{
            required: true,
          }}
        />

        <ControlledNumericInput
          name='amount'
          control={control}
          id='allocation-amount'
          label='Allocation Amount'
          placeholder={`Enter amount (max: ${totalAvailableAmount})`}
          validations={{
            required: true,
            min: 0.01,
            max: totalAvailableAmount,
          }}
        />

        <ControlledTextInput
          name='notes'
          control={control}
          id='allocation-notes'
          label='Notes (Optional)'
          placeholder='Additional details about the allocation'
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
          Add Allocation
        </Button>
      </form>
    </div>
  );
}
