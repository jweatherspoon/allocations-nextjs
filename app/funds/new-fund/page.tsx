'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FundDetails, FundStatus } from '../../lib/models/funds/fund.model';
import { createFund } from '../../lib/funds/funds';
import TitledPageContainer from '@/components/containers/pages/titled-page-container';
import TextInput from '@/components/form/inputs/text-input';
import NumericInput from '@/components/form/inputs/numeric-input';

export default function NewFundPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: ''
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Fund name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.targetAmount && parseFloat(formData.targetAmount) < 0) {
      newErrors.targetAmount = 'Target amount cannot be negative';
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
      // TODO: Replace with actual API call
      const newFund: Partial<FundDetails> = {
        name: formData.name,
        description: formData.description,
        status: 'active' as FundStatus,
        currentAmount: 0,
        targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
        transactions: [],
      };

      await createFund(newFund);
      
      router.back();
    } catch (error) {
      console.error('Error creating fund:', error);
      setErrors({ submit: 'Failed to create fund. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <TitledPageContainer title="Create New Fund" subtitle="Set up a new fund to start tracking your savings goals.">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fund Name */}
        <TextInput
          id='name'
          label='Fund Name'
          value={formData.name}
          onChange={(newValue) => setFormData((prev) => ({ ...prev, name: newValue }))}
          placeholder='Enter fund name'
          validations={{
            required: true,
            minLength: 3,
            maxLength: 20,
          }}
        />

        {/* Description */}
        <TextInput
          id='description'
          label='Description'
          value={formData.description}
          onChange={(newValue) => setFormData((prev) => ({ ...prev, description: newValue }))}
          placeholder='Enter fund description'
          rows={3}
          validations={{
            required: true,
            minLength: 10,
            maxLength: 200,
          }}
        />

        {/* Target Amount (Optional) */}
        <NumericInput
          id='targetAmount'
          label='Target Amount (Optional)'
          value={formData.targetAmount}
          onChange={(newValue) => setFormData((prev) => ({ ...prev, targetAmount: newValue }))}
          placeholder='0.00'
        />

        {/* Submit Error */}
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Fund'}
          </button>
        </div>
      </form>
    </TitledPageContainer>
  );
}