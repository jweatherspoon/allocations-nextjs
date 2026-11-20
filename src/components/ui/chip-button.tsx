import type { ButtonHTMLAttributes } from 'react';

type ChipButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** `pill`: small rounded action ("Split a paycheck →"). `card`: selectable fund chip. */
  variant?: 'pill' | 'card';
  /** Only meaningful for `card`: accent background when selected. */
  selected?: boolean;
};

export function ChipButton({
  variant = 'pill',
  selected = false,
  className = '',
  type = 'button',
  ...props
}: ChipButtonProps) {
  const look =
    variant === 'pill'
      ? 'h-9 rounded-full bg-chip px-3.5 text-[13px] font-semibold'
      : `flex-none rounded-[14px] border border-line px-3.5 py-2.5 text-left transition-all duration-200 ${
          selected ? 'bg-accent text-on-accent' : 'bg-surface text-ink'
        }`;
  return (
    <button
      type={type}
      aria-pressed={variant === 'card' ? selected : undefined}
      className={`${look} ${className}`}
      {...props}
    />
  );
}
