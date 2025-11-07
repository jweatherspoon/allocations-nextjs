import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/shared/containers/sections/details-section-container';
import { CardSkeleton } from '@/components/shared/skeletons/card-skeleton';
import { ChipSkeleton } from '@/components/shared/skeletons/chip-skeleton';
import { TextSkeleton } from '@/components/shared/skeletons/text-skeleton';

export default function PlanDetailsLoadingPage() {
  return (
    <TitledPageContainer title={<TextSkeleton />} subtitle={<TextSkeleton />}>
      <DetailsSectionContainer>
        <div className='flex justify-between items-start mb-4'>
          <h3 className='text-lg text-midnight'>Total Amount:</h3>
          <TextSkeleton />
        </div>
        <div className='flex justify-between items-start'>
          <TextSkeleton className='w-1/2' />
          <ChipSkeleton />
        </div>
      </DetailsSectionContainer>

      <CardSkeleton />

      <TextSkeleton className='w-full mt-2 h-10' />
    </TitledPageContainer>
  );
}
