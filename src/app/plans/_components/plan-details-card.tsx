import { PlanDetails } from '@/app/lib/models/funds/plan.model';

interface PlanDetailsCardProps {
  plan: PlanDetails;
}

export function PlanDetailsCard({ plan }: PlanDetailsCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800'
  };

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {plan.name}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[plan.status]}`}>
          {plan.status}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(plan.amount)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Expected Date:</span>
          <span className="text-sm text-gray-900">
            {formatDate(plan.expectedDate)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Allocations:</span>
          <span className="text-sm text-gray-900">
            {plan.allocations.length}
          </span>
        </div>
      </div>
      
      {plan.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {plan.notes}
          </p>
        </div>
      )}
    </div>
  );
}