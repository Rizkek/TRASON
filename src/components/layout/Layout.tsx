'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ConfirmModal } from '@/components';
import { useAllModuleStatus } from '@/hooks/useModuleStatus';
import { ModuleId } from '@/modules/types';
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  Bell,
  Lightbulb,
  BriefcaseBusiness,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  Dumbbell
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const { enabledModules } = useAllModuleStatus(user?.id);

  // Map each menu item to its corresponding ModuleId (if applicable)
  const menuItems: { label: string; href: string; icon: any; moduleId?: ModuleId }[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, // Core, always visible
    { label: 'Finance', href: '/finance', icon: Wallet, moduleId: 'finance' },
    { label: 'Investments', href: '/investments', icon: BriefcaseBusiness, moduleId: 'investments' },
    { label: 'Timeline', href: '/timeline', icon: Calendar, moduleId: 'timeline' },
    { label: 'Sport', href: '/sport', icon: Dumbbell, moduleId: 'sport' },
    { label: 'Career', href: '/career', icon: Briefcase, moduleId: 'career' },
    { label: 'Reminders', href: '/reminders', icon: Bell, moduleId: 'reminders' },
    { label: 'Insights', href: '/insights', icon: Lightbulb, moduleId: 'insights' },
    { label: 'Settings', href: '/settings', icon: Settings }, // Core, always visible
  ];

  // Filter items based on enabled modules
  const visibleMenuItems = menuItems.filter((item) =>
    !item.moduleId || enabledModules.includes(item.moduleId)
  );

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    console.log('[Layout] Logout button clicked');
    setIsLoggingOut(true);
    
    console.log('[Layout] Calling signOut()');
    await signOut();
    
    console.log('[Layout] signOut() finished, closing modal and redirecting');
    setIsLogoutModalOpen(false);
    setIsLoggingOut(false);
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-warm-black text-soft-cream font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 bg-gray-strong border-r border-white/[0.03] transition-all duration-500 ease-in-out md:static md:translate-x-0 flex flex-col glass h-screen overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="px-lg py-xl flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-md flex items-center justify-center mb-md glow-primary">
            <span className="text-2xl font-serif font-bold text-white italic">T</span>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-gradient">
            TRASON
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-light mt-1 font-medium">Elevate Your Life</p>
        </div>

        <nav className="flex-1 px-md py-xl space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-md px-lg py-md rounded-md transition-all duration-300 relative group overflow-hidden ${isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-light hover:text-soft-cream hover:bg-white/[0.02]'
                  }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {isActive(item.href) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r shadow-[0_0_10px_rgba(78,79,235,0.8)]" />
                )}

                <Icon size={20} className={`${isActive(item.href) ? 'text-primary' : 'group-hover:text-secondary'} transition-colors`} />
                <span className="text-sm font-semibold tracking-wide">{item.label}</span>

                {isActive(item.href) && (
                  <div className="absolute right-[-20%] top-[-50%] w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-md mt-auto mb-md space-y-2">
          {/* User Profile */}
          <div className="flex items-center gap-md px-lg py-md rounded-md bg-white/[0.02] border border-white/[0.05]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-soft-cream truncate">{user?.first_name || user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-light truncate opacity-80">{user?.email}</p>
            </div>
          </div>
          {/* Logout */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-md px-lg py-md rounded-md text-gray-light hover:text-danger hover:bg-danger/10 transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />

        <header className="bg-warm-black border-b border-white/[0.03] px-lg py-md flex items-center justify-between md:hidden relative z-10 transition-colors">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-md text-primary hover:text-secondary transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl font-serif font-bold text-gradient">
            TRASON
          </h2>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="container mx-auto px-lg py-xl md:px-2xl max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-warm-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Logout Confirmation */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Log Out"
        description="Are you sure you want to log out of your account?"
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isLoggingOut}
      />
    </div>
  );
};
