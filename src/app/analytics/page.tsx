import BottomNav from '@/components/navigation/bottom-nav';
import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';

export default async function AnalyticsPage() {
  return (
    <TitledPageContainer title='Analytics'>
      <p className='text-dusk text-center mt-10'>
        Analytics dashboard coming soon. Here you&apos;ll be able to view
        insights about your funds, spending patterns, and financial goals.
      </p>
      <BottomNav />
    </TitledPageContainer>
  );
}
