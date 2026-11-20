/** Fund colour helpers. Hues come from a fixed palette; never use raw hex for funds. */

export type Theme = 'dark' | 'light';

export const HUES = [160, 25, 255, 330, 85, 210, 120, 290] as const;

/** The fund's stored hue, or a stable palette pick derived from its id. */
export function fundHue(fund: { id: string; hue?: number }): number {
  if (typeof fund.hue === 'number') return fund.hue;
  let h = 0;
  for (let i = 0; i < fund.id.length; i++) {
    h = (h * 31 + fund.id.charCodeAt(i)) >>> 0;
  }
  return HUES[h % HUES.length];
}

export function fundColor(hue: number, theme: Theme): string {
  return theme === 'dark'
    ? `oklch(0.76 0.09 ${hue})`
    : `oklch(0.58 0.11 ${hue})`;
}

/** CSS variable string for a pace status (works as `color` / `background`). */
export function statusColor(status: string): string {
  switch (status) {
    case 'Behind':
      return 'var(--warn)';
    case 'Overdue':
      return 'var(--neg)';
    case 'Funded':
    case 'Ahead':
      return 'var(--good)';
    default:
      return 'var(--accent)';
  }
}

/** Browser-chrome colour per theme; mirrors `--bg` in globals.css. */
export const THEME_COLORS: Record<Theme, string> = {
  dark: '#09090b',
  light: '#f4f3f0',
};
