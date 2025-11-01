'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import NavButton from './nav-button';
import ActionButton from './action-button';
import { NAV_ITEMS, getActionForRoute } from './nav-config';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Check if current route is login
  const isLoginPage = pathname === '/login';

  // Get the action button config for the current route
  const actionConfig = useMemo(() => {
    const config = getActionForRoute(pathname);
    if (config?.url) {
      return {
        ...config,
        onClick: () => {
          config.onClick?.();
          router.push(config.url!);
        }
      }
    }

    return config;
  }, [pathname, router]);

  // Check if nav item is active
  const isActive = (href: string) => {
    if (href === '/funds' && pathname.startsWith('/funds')) return true;
    if (href === '/plans' && pathname.startsWith('/plans')) return true;
    if (href === '/analytics' && pathname.startsWith('/analytics')) return true;
    if (href === '/profile' && pathname.startsWith('/profile')) return true;
    return pathname === href;
  };

  // Hide navbar on login page
  if (isLoginPage) return null;

  // Split navigation items: 2 left, 2 right
  const leftItems = NAV_ITEMS.slice(0, 2);
  const rightItems = NAV_ITEMS.slice(2, 4);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto pb-4">
        {/* Glassmorphism container */}
        <div className="relative backdrop-blur-xl bg-cream dark:bg-midnight border border-cream/20 rounded-2xl shadow-2xl px-6 py-2 overflow-visible">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-cream/50 to-transparent dark:from-midnight/50 rounded-2xl pointer-events-none" />

          {/* Navigation content */}
          <div className="relative flex items-center justify-between">
            {/* Left navigation items */}
            <div className="flex items-center gap-2">
              {leftItems.map((item) => (
                <NavButton key={item.id} item={item} isActive={isActive(item.href)} />
              ))}
            </div>

            {/* Center action button */}
            <div className="flex items-center justify-center px-4">
              <ActionButton config={actionConfig} />
            </div>

            {/* Right navigation items */}
            <div className="flex items-center gap-2">
              {rightItems.map((item) => (
                <NavButton key={item.id} item={item} isActive={isActive(item.href)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
