import { notFound } from 'next/navigation';

import { getFundDetails } from '@/api/funds/funds.api';
import FundTransactionDetailsSection from '@/components/funds/details/fund-transaction-details-section';
import StatusChip from '@/components/shared/chip/status-chip';
import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/shared/containers/sections/details-section-container';
import { ProgressBar } from '@/components/shared/progress/progress-bar';
import { ChipStatus } from '@/models/status/chip-status.enum';

export default async function FundDetailsPage({
  params,
}: {
  params: Promise<{ fundId: string }>;
}) {
  const { fundId } = await params;
  const fundDetails = await getFundDetails([fundId]).then(
    (funds) => funds?.[0]
  );

  if (!fundDetails) {
    notFound();
  }

  const amountText = fundDetails.targetAmount
    ? `$${fundDetails.currentAmount.toLocaleString()} / $${fundDetails.targetAmount.toLocaleString()}`
    : `$${fundDetails.currentAmount.toLocaleString()}`;

  const progressPercentage = fundDetails.targetAmount
    ? Math.min(
        (fundDetails.currentAmount / fundDetails.targetAmount) * 100,
        100
      )
    : null;

  const isOverdue = fundDetails.targetDate
    ? new Date(fundDetails.targetDate) < new Date()
    : false;
  const overdueStatus = isOverdue ? ChipStatus.ERROR : ChipStatus.SUCCESS;

  return (
    <TitledPageContainer
      title={fundDetails.name}
      subtitle={fundDetails.description}
    >
      {/* Current Amount / Progress Section */}
      <DetailsSectionContainer>
        <div className='flex justify-between items-start mb-1'>
          <h3 className='text-lg text-midnight'>Current Amount:</h3>
          <span className='text-lg font-semibold text-midnight'>
            {amountText}
          </span>
        </div>
        {progressPercentage !== null && (
          <ProgressBar progress={progressPercentage} />
        )}
      </DetailsSectionContainer>

      {/* Target Date Section */}
      {fundDetails.targetDate && (
        <DetailsSectionContainer>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg text-midnight'>
              Target Date:
              <span className='ml-2 text-lg font-semibold text-dusk'>
                {new Date(fundDetails.targetDate).toISOString().split('T')[0]}
              </span>
            </h3>
            <StatusChip
              status={overdueStatus}
              text={isOverdue ? 'overdue' : 'on track'}
            />
          </div>
        </DetailsSectionContainer>
      )}

      {/* Trend Section */}
      <DetailsSectionContainer>
        <p className='text-dusk'>
          {/* Placeholder for trend chart or data */}
          Trend data and charts will be displayed here.
        </p>
      </DetailsSectionContainer>

      <FundTransactionDetailsSection fundDetails={fundDetails} />
    </TitledPageContainer>
  );
}
