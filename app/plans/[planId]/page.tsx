import { notFound } from 'next/navigation';
import { getPlanDetails } from '../../lib/plans/plans';
import { PlanDetails } from '../../lib/models/funds/plan.model';
import { getFundDetails } from '../../lib/funds/funds';
import { FundDetails } from '../../lib/models/funds/fund.model';

export default async function PlanDetailsPage({ params }: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const plan = await getPlanDetails([planId]).then(plans => plans ? plans[0] : null);

  if (!plan) {
    notFound();
  }

  const targetFunds = plan.allocations.map(x => x.targetFundId);
  const fundDetails = await getFundDetails(targetFunds);
  const fundDetailsMap = new Map<string, FundDetails>(fundDetails?.map(fund => [fund.id, fund]) || []);

  const allocatedAmount = plan.allocations.reduce((sum, alloc) => sum + alloc.value, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: PlanDetails['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {plan.name}
            </h1>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              plan.status
            )}`}
          >
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(plan.amount)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Expected Date</p>
            <p className="text-md font-bold text-gray-900">
              {formatDate(plan.expectedDate)}
            </p>
          </div>
        </div>

        {plan.notes && (
          <div className="mb-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Notes</h2>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
              {plan.notes}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Planned Allocations
        </h2>
        {plan.allocations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No allocations planned yet.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Allocated</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(allocatedAmount)} / {formatCurrency(plan.amount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((allocatedAmount / plan.amount) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {((allocatedAmount / plan.amount) * 100).toFixed(1)}% allocated
                </span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(plan.amount - allocatedAmount)} remaining
                </span>
              </div>
            </div>
            {plan.allocations.map((allocation) => (
              <div
                key={allocation.id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      {(fundDetailsMap.get(allocation.targetFundId)?.name || allocation.targetFundId)}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(allocation.value)}
                  </p>
                </div>
                {allocation.notes && (
                  <p className="text-sm text-gray-600 mt-2">
                    {allocation.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500 flex justify-between">
        <p>Created: {formatDate(plan.createdAt)}</p>
        <p>Modified: {formatDate(plan.modifiedAt)}</p>
      </div>
    </div>
  );
}