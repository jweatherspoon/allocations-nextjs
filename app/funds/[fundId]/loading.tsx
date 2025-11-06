import TitledPageContainer from '@/components/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/containers/sections/details-section-container';
import { CardSkeleton } from '@/components/skeletons/card-skeleton';
import { ChipSkeleton } from '@/components/skeletons/chip-skeleton';
import { ProgressBarSkeleton } from '@/components/skeletons/progress-bar-skeleton';
import { TextSkeleton } from '@/components/skeletons/text-skeleton';

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
