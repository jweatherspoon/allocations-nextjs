'use client';

import { useState } from 'react';

import StatusChip from '@/components/shared/chip/status-chip';
import { RenderedChipStatus } from '@/models/status/chip-status.enum';

export default function EditableChip({
  currentStatus,
  statuses,
  className,
  onCommitChangeAction,
}: {
  currentStatus: RenderedChipStatus;
  statuses: RenderedChipStatus[];
  onCommitChangeAction?: (newStatus: RenderedChipStatus) => void;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const { status, label } = currentStatus;

  return (
    <div>
      {isEditing ? <p>edit</p> : <StatusChip status={status} text={label} />}
    </div>
  );
}
