import StatusChip from '@/components/shared/chip/status-chip';
import { ProgressBar } from '@/components/shared/progress/progress-bar';
import { ChipStatus } from '@/models/status/chip-status.enum';
import { formatCurrency, formatDate } from '@/utils/format.utils';

import { FundStatus } from '../../../lib/models/funds/fund.model';

export interface FundCardProps {
  id: string;
  name: string;
  description: string;
  currentAmount: number;
  targetAmount?: number;
  targetDate?: string;
  status: FundStatus;
}

export default function FundCard(props: FundCardProps) {
  const { name, description, targetAmount, currentAmount, status, targetDate } =
    props;
  const progressPercentage = targetAmount
    ? Math.min((currentAmount / targetAmount) * 100, 100)
    : 0;

  const getStatus = (status: FundStatus) => {
    const isOverdue = targetDate ? new Date(targetDate) < new Date() : false;

    let statusText: string;
    let chipStatus: ChipStatus;
    switch (status) {
      case 'active':
        if (isOverdue) {
          statusText = 'overdue';
          chipStatus = ChipStatus.ERROR;
        } else {
          statusText = 'active';
          chipStatus = ChipStatus.INFO;
        }
        break;

      case 'archived':
        statusText = 'archived';
        chipStatus = ChipStatus.SUCCESS;
        break;

      default:
        statusText = 'unknown';
        chipStatus = ChipStatus.ERROR;
        break;
    }

    return { statusText, chipStatus };
  };

  const { statusText, chipStatus } = getStatus(status);

  const amountToDisplay = targetAmount
    ? `${formatCurrency(currentAmount)} of ${formatCurrency(targetAmount)}`
    : formatCurrency(currentAmount);

  return (
    <div className='bg-cream rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold text-midnight'>{name}</h3>
        <StatusChip status={chipStatus} text={statusText} />
      </div>

      <div className='text-sm text-dusk line-clamp-3'>{description}</div>

      <div className='space-y-2'>
        {targetAmount && <ProgressBar progress={progressPercentage} />}
        <div className='flex justify-between items-center'>
          <span className='text-sm text-midnight'>
            {targetDate ? formatDate(targetDate) : 'No target date'}
          </span>
          <span className='text-sm text-midnight font-semibold'>
            {amountToDisplay}
          </span>
        </div>
      </div>
    </div>
  );
}
