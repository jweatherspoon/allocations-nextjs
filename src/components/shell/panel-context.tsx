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

export type PanelRequest =
  | { kind: 'quick'; mode?: 'deposit' | 'withdraw'; fundId?: string }
  | {
      kind: 'split';
      amount?: number;
      allocations?: Record<string, number>;
      gapMode?: boolean;
    }
  | { kind: 'new' }
  | { kind: 'settings' };

export type PanelKind = PanelRequest['kind'];

/** Props every panel component receives from `PanelHost`. */
export type PanelProps<K extends PanelKind> = {
  request: Extract<PanelRequest, { kind: K }>;
  onClose: () => void;
};

export interface PanelApi {
  /** Opens the sheet (or swaps its content if it is already open). */
  open: (req: PanelRequest) => void;
  /** Slides the sheet down. */
  close: () => void;
  /** The request being shown, or null when closed / closing. */
  current: PanelRequest | null;
}

/** How long the content stays mounted after `close()` so the slide-down can play. */
export const PANEL_UNMOUNT_MS = 440;

interface PanelInternals extends PanelApi {
  /** Request still mounted (stays set during the slide-down). */
  rendered: PanelRequest | null;
  /** True once the sheet should be slid into view. */
  shown: boolean;
  /** Increments on every `open`, so panels remount with fresh state. */
  renderKey: number;
}

const PanelContext = createContext<PanelInternals | null>(null);

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [rendered, setRendered] = useState<PanelRequest | null>(null);
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const unmountTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const raf = useRef(0);

  const open = useCallback((req: PanelRequest) => {
    clearTimeout(unmountTimer.current);
    cancelAnimationFrame(raf.current);
    setClosing(false);
    setRendered(req);
    setRenderKey((k) => k + 1);
    // Two frames so the sheet mounts off-screen first, then transitions in.
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => setShown(true));
    });
  }, []);

  const close = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setShown(false);
    setClosing(true);
    clearTimeout(unmountTimer.current);
    unmountTimer.current = setTimeout(() => {
      setRendered(null);
      setClosing(false);
    }, PANEL_UNMOUNT_MS);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(unmountTimer.current);
      cancelAnimationFrame(raf.current);
    },
    []
  );

  const value = useMemo<PanelInternals>(
    () => ({
      open,
      close,
      current: closing ? null : rendered,
      rendered,
      shown,
      renderKey,
    }),
    [open, close, closing, shown, rendered, renderKey]
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}

function usePanelInternals(): PanelInternals {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error('usePanels must be used inside <AppShell>');
  }
  return ctx;
}

export function usePanels(): PanelApi {
  const { open, close, current } = usePanelInternals();
  return useMemo(() => ({ open, close, current }), [open, close, current]);
}

/** @internal Used by `PanelHost` / `AppShell` only. */
export function usePanelHostState() {
  const { rendered, shown, renderKey, close } = usePanelInternals();
  return { rendered, visible: shown, renderKey, close };
}
