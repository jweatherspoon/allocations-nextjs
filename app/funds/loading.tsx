import TitledPageContainer from '@/components/containers/pages/titled-page-container';
import { ListViewSkeleton } from '@/components/skeletons/list-view-skeleton';

export default function FundsListLoadingPage() {
  return (
    <TitledPageContainer title='Funds'>
      <ListViewSkeleton cardCount={6} />
    </TitledPageContainer>
  );
}
