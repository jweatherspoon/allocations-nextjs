export default function Loading() {
  return (
    <main
      className='animate-pulse px-[18px] pt-14 pb-[150px]'
      aria-busy='true'
    >
      <div className='mb-3 flex items-center justify-between'>
        <div className='size-11 rounded-full border border-line bg-surface' />
        <div className='h-9 w-20 rounded-full bg-chip' />
      </div>
      <div className='px-1'>
        <div className='h-3.5 w-24 rounded bg-chip' />
        <div className='mt-3 h-10 w-56 rounded-lg bg-chip' />
        <div className='mt-3 h-4 w-64 rounded bg-chip' />
        <div className='mt-5 h-14 w-48 rounded-lg bg-chip' />
      </div>
      <div className='mt-[18px] h-[250px] rounded-[22px] border border-line bg-surface' />
      <div className='mt-2 grid grid-cols-2 gap-2'>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-[74px] rounded-[18px] border border-line bg-surface'
          />
        ))}
      </div>
      <div className='mt-6 h-48 rounded-[20px] border border-line bg-surface' />
    </main>
  );
}
