'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlanDetails } from '../../lib/models/funds/plan.model';
import { createPlan } from '../../lib/plans/plans';
import { getActiveFunds } from '../../lib/funds/funds';
import { FundDetails } from '../../lib/models/funds/fund.model';
import TextInput from '@/components/form/inputs/text-input';
import NumericInput from '@/components/form/inputs/numeric-input';
import DatePickerInput from '@/components/form/inputs/date-picker-input';
import TitledPageContainer from '@/components/containers/pages/titled-page-container';

export default function NewPlanPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [funds, setFunds] = useState<FundDetails[]>([]);
  const [isLoadingFunds, setIsLoadingFunds] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    expectedDate: '',
    notes: '',
  });

  useEffect(() => {
    const loadFunds = async () => {
      try {
        const activeFunds = await getActiveFunds();
        setFunds(activeFunds);
      } catch (error) {
        console.error('Error loading funds:', error);
        setErrors({ funds: 'Failed to load funds' });
      } finally {
        setIsLoadingFunds(false);
      }
    };

    loadFunds();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.expectedDate) {
      newErrors.expectedDate = 'Expected date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newPlan: Partial<PlanDetails> = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        expectedDate: formData.expectedDate,
        status: 'pending',
        allocations: [],
        notes: formData.notes || undefined,
      };

      await createPlan(newPlan);

      router.back();
    } catch (error) {
      console.error('Error creating plan:', error);
      setErrors({ submit: 'Failed to create plan. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TitledPageContainer title='Create New Plan'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Plan Name */}
        <TextInput
          id='plan-name'
          label='Name'
          value={formData.name}
          placeholder='Plan Name'
          onChange={(newText) =>
            setFormData((prev) => ({ ...prev, name: newText }))
          }
          validations={{
            required: true,
            minLength: 3,
            maxLength: 20,
          }}
        />

        {/* Total Amount */}
        <NumericInput
          id='amount'
          label='Total Amount'
          step='0.01'
          placeholder='0.00'
          value={formData.amount}
          onChange={(newValue) =>
            setFormData((prev) => ({ ...prev, amount: newValue }))
          }
          validations={{
            required: true,
            min: 0,
          }}
        />

        {/* Expected Date */}
        <DatePickerInput
          id='expectedDate'
          label='Expected Date'
          value={formData.expectedDate}
          onChange={(newDate) =>
            setFormData((prev) => ({ ...prev, expectedDate: newDate }))
          }
          validations={{
            required: true,
          }}
        />

        {/* Notes */}
        <TextInput
          id='notes'
          label='Notes (Optional)'
          value={formData.notes}
          placeholder='Enter any notes about this plan'
          onChange={(newText) =>
            setFormData((prev) => ({ ...prev, notes: newText }))
          }
          rows={3}
        />

        {/* Submit Error */}
        {errors.submit && (
          <div className='rounded-md bg-red-50 p-4'>
            <p className='text-sm text-red-800'>{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
          <button
            type='button'
            onClick={() => router.back()}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSubmitting || isLoadingFunds || funds.length === 0}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </form>
    </TitledPageContainer>
  );
}
