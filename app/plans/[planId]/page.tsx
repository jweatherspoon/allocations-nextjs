import { notFound } from 'next/navigation';
import { executePlan, getPlanDetails } from '../../lib/plans/plans';
import { getActiveFunds } from '../../lib/funds/funds';
import TitledPageContainer from '@/components/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/containers/sections/details-section-container';
import StatusChip from '@/components/chip/status-chip';
import { ChipStatus } from '@/models/status/chip-status.enum';
import PlannedAllocationsSection from '@/app/plans/[planId]/_components/planned-allocations-section';
import Button from '@/components/button/button';

export default async function PlanDetailsPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const plan = await getPlanDetails([planId]).then((plans) =>
    plans ? plans[0] : null
  );

  if (!plan) {
    notFound();
  }

  const fundDetails = await getActiveFunds();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const hasStatus = plan.status !== 'pending';
  const isOverdue = new Date(plan.expectedDate) < new Date();
  const status =
    plan.status === 'completed'
      ? ChipStatus.SUCCESS
      : isOverdue
      ? ChipStatus.ERROR
      : ChipStatus.WARNING;
  const statusText =
    plan.status === 'completed'
      ? 'completed'
      : isOverdue
      ? 'overdue'
      : 'pending';

  return (
    <TitledPageContainer title={plan.name} subtitle={plan.notes}>
      {/* amount section */}
      <DetailsSectionContainer>
        <div className='flex justify-between items-start mb-4'>
          <h3 className='text-lg text-midnight'>Total Amount:</h3>
          <span className='text-lg font-semibold text-midnight'>
            {formatCurrency(plan.amount)}
          </span>
        </div>
        <div className='flex justify-between items-start'>
          <h3 className='text-lg text-midnight'>
            Expected By:
            <span className='ml-2 text-lg font-semibold text-dusk'>
              {new Date(plan.expectedDate).toISOString().split('T')[0]}
            </span>
          </h3>
          {hasStatus && <StatusChip status={status} text={statusText} />}
        </div>
      </DetailsSectionContainer>

      <PlannedAllocationsSection
        planDetails={plan}
        activeFunds={fundDetails || []}
      />
    </TitledPageContainer>
  );
}
