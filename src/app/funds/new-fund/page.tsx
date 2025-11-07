'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { upsertFunds } from '@/api/funds/funds.api';
import Button from '@/components/shared/button/button';
import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import { ControlledDatePickerInput } from '@/components/shared/form/inputs/controlled-date-picker-input';
import { ControlledNumericInput } from '@/components/shared/form/inputs/controlled-numeric-input';
import { ControlledTextInput } from '@/components/shared/form/inputs/controlled-text-input';
import { FundDetails, FundStatus } from '@/models/funds/fund.model';

export default function NewFundPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      targetAmount: '',
      targetDate: '',
    },
  });

  const onSubmit = async (data: {
    name: string;
    description: string;
    targetAmount: string;
    targetDate: string;
  }) => {
    setIsSubmitting(true);

    try {
      const newFund: Partial<FundDetails> = {
        name: data.name,
        description: data.description,
        status: 'active' as FundStatus,
        currentAmount: 0,
        targetAmount: data.targetAmount
          ? parseFloat(data.targetAmount)
          : undefined,
        targetDate: data.targetDate || undefined,
        transactions: [],
      };

      await upsertFunds([newFund]);

      router.back();
    } catch (error) {
      console.error('Error creating fund:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TitledPageContainer
      title='Create Fund'
      subtitle='Set up a new fund to start tracking your savings goals.'
    >
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Fund Name */}
        <ControlledTextInput
          id='name'
          name='name'
          control={control}
          label='Fund Name'
          placeholder='Enter fund name'
          validations={{
            required: true,
            minLength: 3,
            maxLength: 20,
          }}
        />

        {/* Description */}
        <ControlledTextInput
          id='description'
          name='description'
          control={control}
          label='Description'
          placeholder='Enter fund description'
          rows={3}
          validations={{
            required: true,
            minLength: 3,
            maxLength: 120,
          }}
        />

        {/* Target Amount (Optional) */}
        <ControlledNumericInput
          id='targetAmount'
          name='targetAmount'
          label='Target Amount (Optional)'
          control={control}
          placeholder='0.00'
          validations={{
            min: 0.01,
          }}
        />

        {/* Target Date (Optional) */}
        <ControlledDatePickerInput
          id='targetDate'
          name='targetDate'
          control={control}
          label='Target Date (Optional)'
        />

        {/* Form Actions */}
        <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
          <Button
            type='button'
            onClick={() => router.back()}
            className='bg-midnight'
          >
            Cancel
          </Button>
          <Button type='submit' disabled={!formState.isValid || isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Fund'}
          </Button>
        </div>
      </form>
    </TitledPageContainer>
  );
}
