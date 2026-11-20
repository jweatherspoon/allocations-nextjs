export default function Loading() {
  return (
    <main className='px-[18px] pt-[62px] pb-32' aria-busy='true'>
      <div className='flex items-center justify-between px-1'>
        <div>
          <div className='h-9 w-40 animate-pulse rounded-lg bg-chip' />
          <div className='mt-2 h-3 w-32 animate-pulse rounded bg-chip' />
        </div>
        <div className='size-10 animate-pulse rounded-full bg-chip' />
      </div>
      <div className='mt-[18px] h-[420px] animate-pulse rounded-[30px] border border-line bg-hero' />
      <div className='mt-6 flex flex-col gap-2'>
        <div className='h-[118px] animate-pulse rounded-[20px] bg-surface' />
        <div className='h-[118px] animate-pulse rounded-[20px] bg-surface' />
      </div>
    </main>
  );
}
