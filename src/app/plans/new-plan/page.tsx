'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/shared/button/button';
import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import { ControlledDatePickerInput } from '@/components/shared/form/inputs/controlled-date-picker-input';
import { ControlledNumericInput } from '@/components/shared/form/inputs/controlled-numeric-input';
import { ControlledTextInput } from '@/components/shared/form/inputs/controlled-text-input';
import { getActiveFunds } from '@/lib/funds/funds';
import { createPlan } from '@/lib/plans/plans';
import { FundDetails } from '@/models/funds/fund.model';
import { PlanDetails } from '@/models/funds/plan.model';

export default function NewPlanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [funds, setFunds] = useState<FundDetails[]>([]);
  const [isLoadingFunds, setIsLoadingFunds] = useState(true);

  const { control, handleSubmit, formState } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      amount: '',
      expectedDate: '',
      notes: '',
    },
  });

  useEffect(() => {
    const loadFunds = async () => {
      try {
        const activeFunds = await getActiveFunds();
        setFunds(activeFunds);
      } catch (error) {
        console.error('Error loading funds:', error);
      } finally {
        setIsLoadingFunds(false);
      }
    };

    loadFunds();
  }, []);

  const onSubmit = async (data: {
    name: string;
    amount: string;
    expectedDate: string;
    notes: string;
  }) => {
    setIsSubmitting(true);

    try {
      const newPlan: Partial<PlanDetails> = {
        name: data.name,
        amount: parseFloat(data.amount),
        expectedDate: data.expectedDate,
        status: 'pending',
        allocations: [],
        notes: data.notes || undefined,
      };

      await createPlan(newPlan);

      router.back();
    } catch (error) {
      console.error('Error creating plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TitledPageContainer title='Create New Plan'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Plan Name */}
        <ControlledTextInput
          id='plan-name'
          name='name'
          control={control}
          label='Name'
          placeholder='Plan Name'
          validations={{
            required: true,
            minLength: 3,
            maxLength: 20,
          }}
        />

        {/* Total Amount */}
        <ControlledNumericInput
          id='amount'
          name='amount'
          control={control}
          label='Total Amount'
          step='0.01'
          placeholder='0.00'
          validations={{
            required: true,
            min: 0,
          }}
        />

        {/* Expected Date */}
        <ControlledDatePickerInput
          id='expectedDate'
          name='expectedDate'
          control={control}
          label='Expected Date'
          validations={{
            required: true,
          }}
        />

        {/* Notes */}
        <ControlledTextInput
          id='notes'
          name='notes'
          control={control}
          label='Notes (Optional)'
          placeholder='Enter any notes about this plan'
          rows={3}
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
          <Button
            type='submit'
            disabled={
              !formState.isValid ||
              isSubmitting ||
              isLoadingFunds ||
              funds.length === 0
            }
          >
            {isSubmitting ? 'Creating...' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </TitledPageContainer>
  );
}
