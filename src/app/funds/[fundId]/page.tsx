import { verifySession } from '@/app/lib/auth/session';
import { getFundDetails } from '@/app/lib/funds/funds';
import { notFound } from 'next/navigation';
import FundTransactionCard from '@/app/funds/_components/fund-transaction-card';

export default async function FundDetailsPage({
  params,
}: {
  params: Promise<{ fundId: string }>;
}) {
  await verifySession();
  const { fundId } = await params;
  const fundDetails = await getFundDetails(fundId);
  if (!fundDetails) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{fundDetails.name}</h1>
              <p className="text-gray-600 mt-2">{fundDetails.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                fundDetails.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : fundDetails.status === 'archived'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {fundDetails.status.charAt(0).toUpperCase() + fundDetails.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Fund Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            {fundDetails.targetAmount ? 'Fund Progress' : 'Current Amount'}
          </h3>
          
          {fundDetails.targetAmount ? (
            <>
              {/* Amount as fraction */}
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-3xl font-bold text-gray-900">
                  ${fundDetails.currentAmount.toLocaleString()}
                </p>
                <span className="text-xl text-gray-400">/</span>
                <p className="text-2xl font-semibold text-gray-600">
                  ${fundDetails.targetAmount.toLocaleString()}
                </p>
              </div>

              {/* Progress bar and percentage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="font-medium">
                    {Math.round((fundDetails.currentAmount / fundDetails.targetAmount) * 100)}% complete
                  </span>
                  <span>
                    ${(fundDetails.targetAmount - fundDetails.currentAmount).toLocaleString()} remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((fundDetails.currentAmount / fundDetails.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-3xl font-bold text-gray-900">
              ${fundDetails.currentAmount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions ({fundDetails.transactions.length})
          </h2>
          {fundDetails.transactions.length > 0 ? (
            <div className="space-y-3">
              {fundDetails.transactions.slice(0, 10).map((transaction) => (
                <FundTransactionCard key={transaction.id} transaction={transaction} />
              ))}
              {fundDetails.transactions.length > 10 && (
                <div className="text-center pt-3">
                  <p className="text-sm text-gray-500">
                    Showing 10 of {fundDetails.transactions.length} transactions
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          )}
        </div>

        {/* Fund Metadata */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fund Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(fundDetails.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Modified</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(fundDetails.modifiedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
            {fundDetails.groupId && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Group ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{fundDetails.groupId}</dd>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}