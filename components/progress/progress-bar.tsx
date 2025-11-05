export function ProgressBar({
  progress,
}: {
  progress: number;
}) {
  return (
    <div className="relative pt-1">
      <div className="flex h-2 bg-gray-200 rounded">
        <div
          className={`bg-flame h-full rounded `}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
