export function TextSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-6 bg-gray-200 rounded w-3/4 animate-pulse ${className}`}
    />
  );
}
