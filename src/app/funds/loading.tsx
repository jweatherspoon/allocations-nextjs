import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import { ListViewSkeleton } from '@/components/shared/skeletons/list-view-skeleton';

export default function FundsListLoadingPage() {
  return (
    <TitledPageContainer title='Funds'>
      <ListViewSkeleton cardCount={6} />
    </TitledPageContainer>
  );
}
