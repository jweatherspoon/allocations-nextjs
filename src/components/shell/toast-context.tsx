'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const TOAST_MS = 4200;

interface ToastState {
  id: number;
  message: string;
  undo?: () => void | Promise<void>;
  visible: boolean;
}

export interface ToastApi {
  /** Shows a toast for 4.2 s. When `undo` is given the toast shows an Undo button. */
  show: (message: string, undo?: () => void | Promise<void>) => void;
}

interface ToastInternals extends ToastApi {
  toast: ToastState | null;
  dismiss: () => void;
}

const ToastContext = createContext<ToastInternals | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const seq = useRef(0);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setToast((t) => (t ? { ...t, visible: false } : t));
  }, []);

  const show = useCallback((message: string, undo?: () => void | Promise<void>) => {
    clearTimeout(timer.current);
    seq.current += 1;
    setToast({ id: seq.current, message, undo, visible: true });
    timer.current = setTimeout(
      () => setToast((t) => (t ? { ...t, visible: false } : t)),
      TOAST_MS
    );
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(
    () => ({ toast, show, dismiss }),
    [toast, show, dismiss]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

function useToastInternals(): ToastInternals {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <AppShell>');
  }
  return ctx;
}

export function useToast(): ToastApi {
  const { show } = useToastInternals();
  return useMemo(() => ({ show }), [show]);
}

/** Top-of-screen toast with an optional Undo button. Rendered once by AppShell. */
export function ToastHost() {
  const { toast, dismiss } = useToastInternals();
  const visible = !!toast?.visible;

  return (
    <div className='pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+12px)] z-[90]'>
      <div className='mx-auto w-full max-w-[440px] px-[18px]'>
        <div
          role='status'
          aria-live='polite'
          className={`flex items-center justify-between gap-3 rounded-[18px] bg-ink px-4 py-3.5 text-sm font-medium text-bg transition-all duration-[350ms] ease-[cubic-bezier(.2,.9,.25,1.1)] ${
            visible
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : '-translate-y-4 opacity-0'
          }`}
        >
          <span>{toast?.message}</span>
          {toast?.undo && (
            <button
              type='button'
              tabIndex={visible ? 0 : -1}
              className='text-sm font-bold'
              onClick={() => {
                const undo = toast.undo;
                dismiss();
                void undo?.();
              }}
            >
              Undo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
