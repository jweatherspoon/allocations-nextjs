import StatusChip from '@/components/shared/chip/status-chip';
import { ProgressBar } from '@/components/shared/progress/progress-bar';
import { PlanDetails } from '@/models/funds/plan.model';
import { ChipStatus } from '@/models/status/chip-status.enum';
import { formatCurrency, formatDate } from '@/utils/format.utils';

interface PlanDetailsCardProps {
  plan: PlanDetails;
}

export function PlanDetailsCard({ plan }: PlanDetailsCardProps) {
  const currentlyAllocatedAmount = plan.allocations.reduce(
    (sum, allocation) => sum + allocation.value,
    0
  );

  const progressPercentage = Math.min(
    (currentlyAllocatedAmount / plan.amount) * 100,
    100
  );

  const planStatuses = {
    pending: ChipStatus.WARNING,
    completed: ChipStatus.SUCCESS,
    canceled: ChipStatus.ERROR,
  };

  return (
    <div className='bg-cream rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h3 className='text-lg font-semibold text-midnight mb-2'>
            {plan.name}
          </h3>
        </div>
        <StatusChip status={planStatuses[plan.status]} text={plan.status} />
      </div>

      <div className='space-y-2'>
        <div className='flex justify-between items-center'>
          <span className='text-sm text-dusk'>Expected:</span>
          <span className='text-sm text-midnight'>
            {formatDate(plan.expectedDate)}
          </span>
        </div>

        <div>
          <ProgressBar progress={progressPercentage} />
          <div className='flex justify-end items-center mt-2'>
            <span className='text-sm text-midnight'>
              Remaining:{' '}
              {formatCurrency(plan.amount - currentlyAllocatedAmount)}
            </span>
          </div>
        </div>
      </div>

      {plan.notes && (
        <div className='mt-4 pt-4 border-t border-flame'>
          <p className='text-sm text-dusk line-clamp-2'>{plan.notes}</p>
        </div>
      )}
    </div>
  );
}
