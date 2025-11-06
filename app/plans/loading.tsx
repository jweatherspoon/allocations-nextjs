import TitledPageContainer from '@/components/containers/pages/titled-page-container';
import { ListViewSkeleton } from '@/components/skeletons/list-view-skeleton';

export default function PlansListLoadingPage() {
  return (
    <TitledPageContainer title='Plans'>
      <div className='mb-4 flex gap-2 items-center'>
        <h2 className='text-lg font-semibold text-midnight mb-2'>
          Pending Plans
        </h2>
        <hr className='flex-grow border-t border-flame' />
      </div>
      <ListViewSkeleton cardCount={1} />

      <div className='mb-4 flex gap-2 items-center'>
        <h2 className='text-lg font-semibold text-midnight mb-2'>
          Completed Plans
        </h2>
        <hr className='flex-grow border-t border-flame' />
      </div>
      <ListViewSkeleton cardCount={3} />
    </TitledPageContainer>
  );
}
