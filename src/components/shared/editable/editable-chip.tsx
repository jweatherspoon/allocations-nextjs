'use client';

import { useState } from 'react';

import StatusChip from '@/components/shared/chip/status-chip';
import { RenderedChipStatus } from '@/models/status/chip-status.enum';

export default function EditableChip({
  currentStatus,
  statuses,
  onCommitChangeAction,
}: {
  currentStatus: RenderedChipStatus;
  statuses: RenderedChipStatus[];
  onCommitChangeAction?: (newStatus: RenderedChipStatus) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleChipClick = () => {
    setIsEditing((prev) => !prev);
  };

  const findStatus = (deltaIndex: number) => {
    const currentIndex = statuses.findIndex(
      (status) =>
        status.status === currentStatus.status &&
        status.label === currentStatus.label
    );

    const newIndex =
      (currentIndex + deltaIndex + statuses.length) % statuses.length;

    return statuses[newIndex];
  };

  const priorStatus = findStatus(-1);
  const nextStatus = findStatus(1);

  return isEditing ? (
    <div
      className='relative flex items-center flex-col'
      onClick={handleChipClick}
    >
      <div className='absolute -right-1 -top-4'>
        <StatusChip
          status={priorStatus.status}
          text={priorStatus.label}
          className='blur-[1px] shadow-sm'
        />
      </div>
      <StatusChip
        status={currentStatus.status}
        className='z-2 shadow-md mr-4 mb-2'
      >
        {currentStatus.label}
      </StatusChip>
      <div className='absolute -bottom-5 -right-4'>
        <StatusChip
          status={nextStatus.status}
          text={nextStatus.label}
          className='blur-[1px] shadow-sm'
        />
      </div>
    </div>
  ) : (
    <div onClick={handleChipClick}>
      <StatusChip status={currentStatus.status} text={currentStatus.label} />
    </div>
  );
}
