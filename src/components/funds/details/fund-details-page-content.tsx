'use client';

import { editFundDetails } from '@/api/funds/funds.api';
import FundTransactionDetailsSection from '@/components/funds/details/fund-transaction-details-section';
import StatusChip from '@/components/shared/chip/status-chip';
import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/shared/containers/sections/details-section-container';
import EditableChip from '@/components/shared/editable/editable-chip';
import EditableText from '@/components/shared/editable/editable-text';
import { ProgressBar } from '@/components/shared/progress/progress-bar';
import { FundDetails } from '@/models/funds/fund.model';
import { ChipStatus } from '@/models/status/chip-status.enum';
import { formatDate } from '@/utils/format.utils';

export default function FundDetailsPageContent({
  fundDetails,
}: {
  fundDetails: FundDetails;
}) {
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

  const updateTextField = (field: keyof FundDetails) => {
    return async (newValue: string) => {
      const updatedFund = { ...fundDetails, [field]: newValue };
      await editFundDetails(updatedFund);
    };
  };

  return (
    <TitledPageContainer
      title={
        <EditableText
          text={fundDetails.name}
          onCommitChangeAction={updateTextField('name')}
          className='text-3xl font-bold text-midnight mb-2 border-flame'
        />
      }
      subtitle={
        <EditableText
          text={fundDetails.description}
          onCommitChangeAction={updateTextField('description')}
          className='text-dusk mb-4 text-sm'
        />
      }
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
                {formatDate(fundDetails.targetDate)}
              </span>
            </h3>
            {/* <StatusChip
              status={overdueStatus}
              text={isOverdue ? 'overdue' : 'on track'}
            /> */}
            <EditableChip
              currentStatus={{
                status: ChipStatus.INFO,
                label: 'active',
              }}
              statuses={[
                { status: ChipStatus.INFO, label: 'active' },
                { status: ChipStatus.SUCCESS, label: 'completed' },
                { status: ChipStatus.ERROR, label: 'overdue' },
              ]}
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
