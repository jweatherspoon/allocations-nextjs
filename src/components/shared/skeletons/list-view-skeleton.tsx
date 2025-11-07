import { CardSkeleton } from '@/components/shared/skeletons/card-skeleton';

export function ListViewSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <div className='space-y-4'>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(cardCount)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
