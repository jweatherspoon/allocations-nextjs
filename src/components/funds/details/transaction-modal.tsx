'use client';

import ModalContainer from '@/components/shared/modal/modal-container';

export default function TransactionModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      {children}
    </ModalContainer>
  );
}
