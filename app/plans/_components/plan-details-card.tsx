import StatusChip from '@/components/chip/status-chip';
import { PlanDetails } from '../../lib/models/funds/plan.model';
import { ChipStatus } from '@/models/status/chip-status.enum';

interface PlanDetailsCardProps {
  plan: PlanDetails;
}

export function PlanDetailsCard({ plan }: PlanDetailsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const planStatuses = {
    pending: ChipStatus.WARNING,
    completed: ChipStatus.SUCCESS,
    canceled: ChipStatus.ERROR,
  }

  return (
    <div className="bg-cream rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-midnight mb-2">
            {plan.name}
          </h3>
        </div>
        <StatusChip status={planStatuses[plan.status]} text={plan.status} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-dusk">Amount:</span>
          <span className="text-lg font-semibold text-midnight">
            {formatCurrency(plan.amount)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-dusk">Expected Date:</span>
          <span className="text-sm text-midnight">
            {formatDate(plan.expectedDate)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-dusk">Allocations:</span>
          <span className="text-sm text-midnight">
            {plan.allocations.length}
          </span>
        </div>
      </div>
      
      {plan.notes && (
        <div className="mt-4 pt-4 border-t border-flame">
          <p className="text-sm text-dusk line-clamp-2">
            {plan.notes}
          </p>
        </div>
      )}
    </div>
  );
}