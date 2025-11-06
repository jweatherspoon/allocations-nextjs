export default function TitledPageContainer({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-platinum-900 py-8 overflow-hidden pb-24'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-4'>
          {title && typeof title === 'string' ? (
            <h1 className='text-3xl font-bold text-midnight mb-2'>{title}</h1>
          ) : (
            title
          )}
        </div>
        {subtitle && typeof subtitle === 'string' ? (
          <p className='text-dusk mb-4 text-sm'>{subtitle}</p>
        ) : (
          subtitle
        )}
        <hr className='border-t border-flame mb-4' />
        <div className='space-y-6 overflow-auto'>{children}</div>
      </div>
    </div>
  );
}
