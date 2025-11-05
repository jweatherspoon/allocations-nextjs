export default function DetailsSectionContainer({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-cream rounded-lg shadow-sm border border-gray-200">
      {children}
    </div>
  );
}