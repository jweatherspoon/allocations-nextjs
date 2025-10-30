'use client';

import Link from 'next/link';
import { NavItem } from './types';

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
}

export default function NavButton({ item, isActive }: NavButtonProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'text-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-white/30'
      }`}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
      <span
        className={`text-xs font-medium transition-opacity duration-200 hidden sm:block ${
          isActive ? 'opacity-100' : 'opacity-70'
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}
