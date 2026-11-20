import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** Decorative by default (`aria-hidden`); label the parent button instead. */
const base = (props: IconProps): IconProps => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...props,
});

export function BackIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d='M15 5l-7 7 7 7' />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2.4, ...props })}>
      <path d='M12 4v16m8-8H4' />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base({ width: 18, height: 18, ...props })}>
      <path d='M6 6l12 12M18 6L6 18' />
    </svg>
  );
}
