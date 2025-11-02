'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlanDetails, PlannedAllocation } from '../../lib/models/funds/plan.model';
import { createPlan } from '../../lib/plans/plans';
import { getActiveFunds } from '../../lib/funds/funds';
import { FundDetails } from '../../lib/models/funds/fund.model';

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

  const [allocations, setAllocations] = useState<
    Array<{ fundId: string; amount: string; notes: string }>
  >([]);

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

    // Validate allocations
    if (allocations.length === 0) {
      newErrors.allocations = 'At least one allocation is required';
    } else {
      let totalAllocated = 0;
      const planAmount = parseFloat(formData.amount) || 0;

      for (let i = 0; i < allocations.length; i++) {
        const allocation = allocations[i];
        if (!allocation.fundId) {
          newErrors[`allocation_${i}_fund`] = 'Fund selection is required';
        }
        if (!allocation.amount || parseFloat(allocation.amount) <= 0) {
          newErrors[`allocation_${i}_amount`] = 'Amount must be greater than 0';
        } else {
          totalAllocated += parseFloat(allocation.amount);
        }
      }

      if (Math.abs(totalAllocated - planAmount) > 0.01) {
        newErrors.allocations = `Total allocated (${totalAllocated.toFixed(2)}) must equal plan amount (${planAmount.toFixed(2)})`;
      }
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
      const plannedAllocations: PlannedAllocation[] = allocations.map((allocation) => ({
        id: crypto.randomUUID(),
        type: 'deposit' as const,
        status: 'pending' as const,
        targetFundId: allocation.fundId,
        value: parseFloat(allocation.amount),
        notes: allocation.notes || undefined,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      }));

      const newPlan: Partial<PlanDetails> = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        expectedDate: formData.expectedDate,
        status: 'pending',
        allocations: plannedAllocations,
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

  const addAllocation = () => {
    setAllocations([...allocations, { fundId: '', amount: '', notes: '' }]);
    // Clear allocations error when adding new allocation
    if (errors.allocations) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.allocations;
        return newErrors;
      });
    }
  };

  const removeAllocation = (index: number) => {
    const newAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(newAllocations);
    
    // Clear errors related to this allocation
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`allocation_${index}_fund`];
      delete newErrors[`allocation_${index}_amount`];
      return newErrors;
    });
  };

  const updateAllocation = (
    index: number,
    field: 'fundId' | 'amount' | 'notes',
    value: string
  ) => {
    const newAllocations = [...allocations];
    newAllocations[index][field] = value;
    setAllocations(newAllocations);

    // Clear error for this field
    const errorKey = `allocation_${index}_${field === 'fundId' ? 'fund' : field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-midnight">Create New Plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        {/* Plan Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-dusk">
            Plan Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.name ? 'border-red-500' : 'border-platinum'
            } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
            placeholder="Enter plan name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Total Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-dusk">
            Total Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`mt-1 block w-full rounded-md border ${
              errors.amount ? 'border-red-500' : 'border-platinum'
            } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        {/* Expected Date */}
        <div>
          <label htmlFor="expectedDate" className="block text-sm font-medium text-dusk">
            Expected Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="expectedDate"
            name="expectedDate"
            value={formData.expectedDate}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.expectedDate ? 'border-red-500' : 'border-platinum'
            } px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame`}
          />
          {errors.expectedDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedDate}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-dusk">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-platinum px-3 py-2 shadow-sm focus:border-flame focus:outline-none focus:ring-1 focus:ring-flame"
            placeholder="Enter any notes about this plan"
          />
        </div>

        {/* Allocations Section */}
        <div className="border-t border-flame pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-midnight">
              Allocations <span className="text-red-500">*</span>
            </h2>
            <button
              type="button"
              onClick={addAllocation}
              disabled={isLoadingFunds}
              className="px-3 py-1 text-sm font-medium text-cream bg-flame border border-cream rounded-md hover:bg-flame-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flame-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Allocation
            </button>
          </div>

          {isLoadingFunds ? (
            <p className="text-sm text-dusk">Loading funds...</p>
          ) : funds.length === 0 ? (
            <div className="rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                No active funds available. Please create a fund first.
              </p>
            </div>
          ) : (
            <>
              {allocations.length === 0 ? (
                <p className="text-sm text-dusk">
                  No allocations added yet. Click &quot;Add Allocation&quot; to start.
                </p>
              ) : (
                <div className="space-y-4">
                  {allocations.map((allocation, index) => (
                    <div
                      key={index}
                      className="p-4 border border-platinum rounded-md bg-cream"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-medium text-midnight">
                          Allocation {index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeAllocation(index)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Fund Selection */}
                        <div>
                          <label
                            htmlFor={`allocation_${index}_fund`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Fund <span className="text-red-500">*</span>
                          </label>
                          <select
                            id={`allocation_${index}_fund`}
                            value={allocation.fundId}
                            onChange={(e) =>
                              updateAllocation(index, 'fundId', e.target.value)
                            }
                            className={`mt-1 block w-full rounded-md border ${
                              errors[`allocation_${index}_fund`]
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          >
                            <option value="">Select a fund</option>
                            {funds.map((fund) => (
                              <option key={fund.id} value={fund.id}>
                                {fund.name}
                              </option>
                            ))}
                          </select>
                          {errors[`allocation_${index}_fund`] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[`allocation_${index}_fund`]}
                            </p>
                          )}
                        </div>

                        {/* Amount */}
                        <div>
                          <label
                            htmlFor={`allocation_${index}_amount`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Amount <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            id={`allocation_${index}_amount`}
                            value={allocation.amount}
                            onChange={(e) =>
                              updateAllocation(index, 'amount', e.target.value)
                            }
                            step="0.01"
                            min="0"
                            className={`mt-1 block w-full rounded-md border ${
                              errors[`allocation_${index}_amount`]
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            placeholder="0.00"
                          />
                          {errors[`allocation_${index}_amount`] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[`allocation_${index}_amount`]}
                            </p>
                          )}
                        </div>

                        {/* Notes */}
                        <div>
                          <label
                            htmlFor={`allocation_${index}_notes`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Notes (Optional)
                          </label>
                          <textarea
                            id={`allocation_${index}_notes`}
                            value={allocation.notes}
                            onChange={(e) =>
                              updateAllocation(index, 'notes', e.target.value)
                            }
                            rows={2}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Optional notes for this allocation"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.allocations && (
                <p className="mt-2 text-sm text-red-600">{errors.allocations}</p>
              )}
            </>
          )}

          {errors.funds && (
            <div className="rounded-md bg-red-50 p-4 mt-4">
              <p className="text-sm text-red-800">{errors.funds}</p>
            </div>
          )}
        </div>

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
            disabled={isSubmitting || isLoadingFunds || funds.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
