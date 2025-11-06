import { notFound } from 'next/navigation';

import PlannedAllocationsSection from '@/components/plans/details/planned-allocations-section';
import StatusChip from '@/components/shared/chip/status-chip';
import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/shared/containers/sections/details-section-container';
import { getActiveFunds } from '@/lib/funds/funds';
import { getPlanDetails } from '@/lib/plans/plans';
import { ChipStatus } from '@/models/status/chip-status.enum';
import { formatCurrency } from '@/utils/format.utils';

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
          <StatusChip status={status} text={statusText} />
        </div>
      </DetailsSectionContainer>

      <PlannedAllocationsSection
        planDetails={plan}
        activeFunds={fundDetails || []}
      />
    </TitledPageContainer>
  );
}
