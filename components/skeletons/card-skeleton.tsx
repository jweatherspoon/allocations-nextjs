export function CardSkeleton() {
  return (
    <div className='bg-cream rounded-lg shadow-sm border border-platinum p-6 animate-pulse'>
      <div className='space-y-3'>
        <div className='h-6 bg-gray-200 rounded w-3/4' />
        <div className='h-4 bg-gray-200 rounded w-1/2' />
        <div className='h-6 bg-gray-200 rounded w-full' />
      </div>
    </div>
  );
}
