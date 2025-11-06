import Link from 'next/link';

import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';

import { PlanDetailsCard } from '../../components/plans/list/plan-details-card';
import { getAllPlans } from '../../lib/plans/plans';

export default async function PlansPage() {
  const plans = await getAllPlans();

  const pendingPlans = plans
    ?.filter((plan) => plan.status === 'pending')
    .sort(
      (a, b) =>
        new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
    );
  const completedPlans = plans
    ?.filter((plan) => plan.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.modifiedAt || '').getTime() -
        new Date(a.modifiedAt || '').getTime()
    );

  return (
    <TitledPageContainer title='Plans'>
      <div className='mb-4 flex gap-2 items-center'>
        <h2 className='text-lg font-semibold text-midnight mb-2'>
          Pending Plans
        </h2>
        <hr className='flex-grow border-t border-flame' />
      </div>
      <div className='mb-6 space-y-4'>
        {pendingPlans?.length ? (
          pendingPlans.map((plan) => (
            <div key={plan.id}>
              <Link href={`/plans/${plan.id}`}>
                <PlanDetailsCard plan={plan} />
              </Link>
            </div>
          ))
        ) : (
          <p className='text-dusk text-center'>No currently pending plans.</p>
        )}
      </div>
      <div className='mb-4 flex gap-2 items-center'>
        <h2 className='text-lg font-semibold text-midnight mb-2'>
          Completed Plans
        </h2>
        <hr className='flex-grow border-t border-flame' />
      </div>
      <div className='space-y-4'>
        {completedPlans?.length ? (
          completedPlans.map((plan) => (
            <div key={plan.id}>
              <Link href={`/plans/${plan.id}`}>
                <PlanDetailsCard plan={plan} />
              </Link>
            </div>
          ))
        ) : (
          <p className='text-dusk'>No completed plans found.</p>
        )}
      </div>

      {/* TODO: Add "Create Plan" button functionality */}
      {!plans.length && (
        <div className='bg-cream rounded-lg shadow-sm border p-12 text-center'>
          <div className='max-w-md mx-auto'>
            <div className='w-16 h-16 bg-flame rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-midnight'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-midnight mb-2'>
              No Plans Yet
            </h2>
            <p className='text-dusk mb-6'>
              Start creating financial plans to organize your savings goals and
              track your progress.
            </p>
            <button className='px-6 py-2 bg-flame text-cream rounded-lg hover:bg-flame-700 transition-colors'>
              Create Your First Plan
            </button>
          </div>
        </div>
      )}
    </TitledPageContainer>
  );
}
