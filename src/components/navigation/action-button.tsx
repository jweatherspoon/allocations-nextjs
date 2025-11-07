'use client';

import { ActionButtonConfig } from './types';

interface ActionButtonProps {
  config: ActionButtonConfig | null;
}

export default function ActionButton({ config }: ActionButtonProps) {
  if (!config) return null;

  const Icon = config.icon;

  return (
    <button
      onClick={config.onClick}
      className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-midnight-100 to-midnight rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 -mt-8"
      aria-label={config.label}
    >
      <div className="absolute inset-0 rounded-full bg-cream/20 animate-pulse" />
      <Icon className="w-8 h-8 text-white relative z-10" />
      
      {/* Ring effect */}
      <div className="absolute inset-0 rounded-full border-4 border-cream/30" />
    </button>
  );
}
