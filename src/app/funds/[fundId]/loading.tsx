import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/shared/containers/sections/details-section-container';
import { CardSkeleton } from '@/components/shared/skeletons/card-skeleton';
import { ChipSkeleton } from '@/components/shared/skeletons/chip-skeleton';
import { ProgressBarSkeleton } from '@/components/shared/skeletons/progress-bar-skeleton';
import { TextSkeleton } from '@/components/shared/skeletons/text-skeleton';

export default function FundDetailsLoadingPage() {
  return (
    <TitledPageContainer title={<TextSkeleton />} subtitle={<TextSkeleton />}>
      {/* Current Amount / Progress Section */}
      <DetailsSectionContainer>
        <div className='flex justify-between items-start mb-1'>
          <h3 className='text-lg text-midnight'>Current Amount:</h3>
          <TextSkeleton />
        </div>
        <ProgressBarSkeleton />
      </DetailsSectionContainer>

      {/* Target Date Section */}
      <DetailsSectionContainer>
        <div className='flex justify-between items-center'>
          <TextSkeleton className='w-1/2' />
          <ChipSkeleton />
        </div>
      </DetailsSectionContainer>

      <CardSkeleton />
    </TitledPageContainer>
  );
}
