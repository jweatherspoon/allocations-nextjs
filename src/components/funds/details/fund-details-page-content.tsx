'use client';

import { editFundDetails } from '@/api/funds/funds.api';
import FundTransactionDetailsSection from '@/components/funds/details/fund-transaction-details-section';
import TransactionTrendChart from '@/components/funds/details/transaction-trend-chart';
import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/shared/containers/sections/details-section-container';
import EditableChip from '@/components/shared/editable/editable-chip';
import EditableText from '@/components/shared/editable/editable-text';
import { ProgressBar } from '@/components/shared/progress/progress-bar';
import { FundDetails, FundStatus } from '@/models/funds/fund.model';
import {
  ChipStatus,
  RenderedChipStatus,
} from '@/models/status/chip-status.enum';
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

  const updateTextField = (field: keyof FundDetails) => {
    return async (newValue: string) => {
      const updatedFund = { ...fundDetails, [field]: newValue };
      await editFundDetails(updatedFund);
    };
  };

  const updateFundStatus = async (newStatus: RenderedChipStatus) => {
    const updatedFund = { ...fundDetails, status: newStatus.id as FundStatus };
    await editFundDetails(updatedFund);
  };

  const statuses: RenderedChipStatus[] = [
    {
      id: 'active',
      status: isOverdue ? ChipStatus.ERROR : ChipStatus.INFO,
      label: isOverdue ? 'overdue' : 'active',
    },
    {
      id: 'archived',
      status: ChipStatus.SUCCESS,
      label: 'archived',
    },
  ];

  const currentStatus = statuses.find(
    (status) => status.id === fundDetails.status
  )!;

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
            <EditableChip
              currentStatus={currentStatus}
              statuses={statuses}
              onCommitChangeAction={updateFundStatus}
            />
          </div>
        </DetailsSectionContainer>
      )}

      {/* Trend Section */}
      <DetailsSectionContainer>
        <TransactionTrendChart transactions={fundDetails.transactions} />
      </DetailsSectionContainer>

      <FundTransactionDetailsSection fundDetails={fundDetails} />
    </TitledPageContainer>
  );
}
