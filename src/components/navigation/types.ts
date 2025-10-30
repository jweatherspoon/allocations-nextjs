export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ActionButtonConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  url?: string;
}

export type RouteActionMap = {
  [key: string]: ActionButtonConfig;
};
