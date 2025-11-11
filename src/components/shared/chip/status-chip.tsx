import { ChipStatus } from '@/models/status/chip-status.enum';

export default function StatusChip({
  status,
  text,
  children,
  className,
}: {
  status: ChipStatus;
  text?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const statusColors = {
    [ChipStatus.INFO]: 'bg-blue-100 text-blue-800',
    [ChipStatus.SUCCESS]: 'bg-green-100 text-green-800',
    [ChipStatus.WARNING]: 'bg-yellow-100 text-yellow-800',
    [ChipStatus.ERROR]: 'bg-red-100 text-red-800',
  };

  const statusColor = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className} ${statusColor}`}
    >
      {children ?? text}
    </div>
  );
}
