import type { ButtonHTMLAttributes } from 'react';

/** The big accent CTA at the bottom of panels. `disabled` dims it to 35%. */
export function PrimaryButton({
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`h-[58px] w-full rounded-[18px] bg-accent text-center text-base font-semibold text-on-accent transition-opacity enabled:active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-35 ${className}`}
      {...props}
    />
  );
}
