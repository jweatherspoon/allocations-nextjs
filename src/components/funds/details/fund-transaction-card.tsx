import StatusChip from '@/components/shared/chip/status-chip';
import {
  TransactionDetails,
  TransactionType,
} from '@/models/funds/transaction.model';
import { ChipStatus } from '@/models/status/chip-status.enum';

export interface FundTransactionCardProps {
  transaction: TransactionDetails;
}

function getTransactionColor(type: TransactionType) {
  switch (type) {
    case 'deposit':
      return {
        dot: 'bg-green-500',
        text: 'text-green-600',
        sign: '+',
      };
    case 'withdrawal':
      return {
        dot: 'bg-red-500',
        text: 'text-red-600',
        sign: '-',
      };
    case 'transfer':
      return {
        dot: 'bg-blue-500',
        text: 'text-gray-900',
        sign: '',
      };
  }
}

export default function FundTransactionCard({
  transaction,
}: FundTransactionCardProps) {
  const colors = getTransactionColor(transaction.type);

  return (
    <div className='flex items-center justify-between p-3 bg-gray-50 border border-gray rounded-lg hover:bg-gray-100 transition-colors'>
      <div className='flex items-center space-x-3'>
        {/* Transaction type indicator */}
        <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>

        {/* Transaction details */}
        <div>
          <p className='text-sm font-medium text-gray-900 capitalize'>
            {transaction.type}
          </p>
          <p className='text-xs text-gray-500'>
            {new Date(transaction.modifiedAt).toISOString().split('T')[0]}
          </p>
          {transaction.notes && (
            <p className='text-xs text-gray-600 mt-1 line-clamp-1'>
              {transaction.notes}
            </p>
          )}
        </div>
      </div>

      {/* Amount and status */}
      <div className='text-right'>
        <StatusChip status={ChipStatus.SUCCESS} text={transaction.status} />
        <p className={`text-sm font-medium ${colors.text} mr-3 mt-1`}>
          {colors.sign}${Math.abs(transaction.value).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
