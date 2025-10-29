import { verifySession } from '@/app/lib/auth/session';
import { getAllPlans } from '@/app/lib/plans/plans';
import { PlanDetailsCard } from '@/app/plans/_components/plan-details-card';

export default async function PlansPage() {
  await verifySession();

  const plans = await getAllPlans();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Plans</h1>
          <p className="text-gray-600">
            Create and manage your financial planning strategies.
          </p>
        </div>

        {/* TODO: Replace with actual plans data fetch */}
        {plans && plans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanDetailsCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Plans Yet</h2>
              <p className="text-gray-600 mb-6">
          Start creating financial plans to organize your savings goals and track your progress.
              </p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create Your First Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
