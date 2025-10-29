import { NavItem, RouteActionMap, ActionButtonConfig } from './types';

// Icon components - using simple SVG icons
export const FundsIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PlansIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

export const AnalyticsIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export const ProfileIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const PlusIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// Navigation items configuration
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'funds',
    label: 'Funds',
    href: '/funds',
    icon: FundsIcon,
  },
  {
    id: 'plans',
    label: 'Plans',
    href: '/plans',
    icon: PlansIcon,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: AnalyticsIcon,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: ProfileIcon,
  },
];

// Route-specific action button configurations
export const ROUTE_ACTIONS: RouteActionMap = {
  '/funds': {
    icon: PlusIcon,
    label: 'Add Fund',
    onClick: () => {
      // TODO: Implement add fund logic
      console.log('Add fund clicked');
    },
  },
  '/plans': {
    icon: PlusIcon,
    label: 'Create Plan',
    onClick: () => {
      // TODO: Implement create plan logic
      console.log('Create plan clicked');
    },
  },
  '/analytics': {
    icon: PlusIcon,
    label: 'Export Data',
    onClick: () => {
      // TODO: Implement export data logic
      console.log('Export data clicked');
    },
  },
  '/profile': {
    icon: PlusIcon,
    label: 'Edit Profile',
    onClick: () => {
      // TODO: Implement edit profile logic
      console.log('Edit profile clicked');
    },
  },
};

// Helper function to match dynamic routes
export function getActionForRoute(pathname: string): ActionButtonConfig | null {
  // Exact match
  if (ROUTE_ACTIONS[pathname]) {
    return ROUTE_ACTIONS[pathname];
  }

  // Check for fund detail pages (e.g., /funds/[fundId])
  if (pathname.startsWith('/funds/')) {
    return {
      icon: PlusIcon,
      label: 'Add Transaction',
      onClick: () => {
        // TODO: Implement add transaction logic
        console.log('Add transaction clicked');
      },
    };
  }

  return null;
}
