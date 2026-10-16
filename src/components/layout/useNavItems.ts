'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ModuleId } from '@/modules/types';
import { DEFAULT_MODULE_STATUS } from '@/modules/registry';
import { SYS_ICONS } from '@/config/icons';

export interface NavItem {
  href: string;
  icon: any;
  moduleId?: ModuleId;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: SYS_ICONS.dashboard }, // core, always visible
  { href: '/finance', icon: SYS_ICONS.finance.main, moduleId: 'finance' },
  { href: '/investments', icon: SYS_ICONS.investments, moduleId: 'investments' },
  { href: '/schedule', icon: SYS_ICONS.timeline, moduleId: 'timeline' },
  { href: '/sport', icon: SYS_ICONS.sport, moduleId: 'sport' },
  { href: '/career', icon: SYS_ICONS.career, moduleId: 'career' },
  { href: '/reminders', icon: SYS_ICONS.notifications, moduleId: 'reminders' },
  { href: '/insights', icon: SYS_ICONS.insights, moduleId: 'insights' },
  { href: '/settings', icon: SYS_ICONS.settings }, // core, always visible
];

/** The translation key of a nav item, e.g. /dashboard -> nav.dashboard. */
export const navLabelKey = (href: string) => `nav.${href.replace('/', '')}`;

/**
 * Navigation split into what every layout needs: the full list, the bottom-bar items on phones
 * (Dashboard plus up to three modules) and the rest, which go into the "More" sheet.
 */
export function useNavItems() {
  const pathname = usePathname();
  const { module_features } = useUserPreferences();

  const visibleItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.moduleId || (module_features?.[item.moduleId] ?? DEFAULT_MODULE_STATUS[item.moduleId]) !== false),
    [module_features]
  );

  const barItems = useMemo(() => {
    const dashboard = visibleItems.find((i) => i.href === '/dashboard');
    const modules = visibleItems.filter((i) => i.href !== '/dashboard' && i.href !== '/settings');
    return [dashboard, ...modules.slice(0, 3)].filter((i): i is NavItem => Boolean(i));
  }, [visibleItems]);

  const sheetItems = useMemo(() => {
    const inBar = new Set(barItems.map((i) => i.href));
    return visibleItems.filter((i) => !inBar.has(i.href));
  }, [visibleItems, barItems]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const current = NAV_ITEMS.find((item) => isActive(item.href));

  return { visibleItems, barItems, sheetItems, isActive, current };
}
