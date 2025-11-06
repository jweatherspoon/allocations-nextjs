import TitledPageContainer from '@/components/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/containers/sections/details-section-container';
import { CardSkeleton } from '@/components/skeletons/card-skeleton';
import { ChipSkeleton } from '@/components/skeletons/chip-skeleton';
import { TextSkeleton } from '@/components/skeletons/text-skeleton';

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
