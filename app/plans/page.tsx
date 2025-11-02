import ListViewPageContainer from '@/components/containers/pages/list-view-page-container';
import { getAllPlans } from '../lib/plans/plans';
import { PlanDetailsCard } from './_components/plan-details-card';
import Link from 'next/link';

export default async function PlansPage() {
  const plans = await getAllPlans();

  return (
    <ListViewPageContainer title='Plans'>
      {plans && plans.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Link key={plan.id} href={`/plans/${plan.id}`}>
                <PlanDetailsCard plan={plan} />
              </Link>
            ))}
            </div>
        ) : (
          <div className="bg-cream rounded-lg shadow-sm border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-flame rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-midnight mb-2">No Plans Yet</h2>
              <p className="text-dusk mb-6">
                Start creating financial plans to organize your savings goals and track your progress.
              </p>
              <button className="px-6 py-2 bg-flame text-cream rounded-lg hover:bg-flame-700 transition-colors">
                Create Your First Plan
              </button>
            </div>
          </div>
        )}
    </ListViewPageContainer>
  );
}
