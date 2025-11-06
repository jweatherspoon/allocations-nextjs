'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalContainerProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export default function ModalContainer({
  isOpen,
  onClose,
  children,
  className = '',
}: ModalContainerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-midnight/70 backdrop-blur-xs ${className}`}
      onClick={handleOverlayClick}
    >
      <div className='relative max-h-[90vh] w-[80vw] max-w-[90vw] overflow-auto rounded-lg bg-cream p-6 shadow-xl'>
        <button
          onClick={onClose}
          className='absolute right-3 top-3 text-xl text-flame hover:text-flame font-semibold'
          aria-label='Close modal'
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
