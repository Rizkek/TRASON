'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Wallet, 
  Calendar, 
  Bell, 
  Lightbulb, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Finance', href: '/finance', icon: Wallet },
    { label: 'Timeline', href: '/timeline', icon: Calendar },
    { label: 'Reminders', href: '/reminders', icon: Bell },
    { label: 'Insights', href: '/insights', icon: Lightbulb },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen bg-warm-black text-soft-cream font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gray-strong border-r border-white border-opacity-[0.03] transition-all duration-500 ease-in-out md:relative md:translate-x-0 flex flex-col glass ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo/Branding */}
        <div className="px-lg py-xl flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-md flex items-center justify-center mb-md glow-primary">
            <span className="text-2xl font-serif font-bold text-white italic">T</span>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-gradient">
            TRASON
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-light mt-1 font-medium">Elevate Your Life</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-md py-xl space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-md px-lg py-md rounded-md transition-all duration-300 relative group overflow-hidden ${
                  isActive(item.href)
                    ? 'bg-primary bg-opacity-10 text-primary'
                    : 'text-gray-light hover:text-soft-cream hover:bg-white hover:bg-opacity-[0.02]'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {/* Active Indicator Line */}
                {isActive(item.href) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r shadow-[0_0_10px_rgba(78,79,235,0.8)]" />
                )}
                
                <Icon size={20} className={`${isActive(item.href) ? 'text-primary' : 'group-hover:text-secondary'} transition-colors`} />
                <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                
                {isActive(item.href) && (
                  <div className="absolute right-[-20%] top-[-50%] w-24 h-24 bg-primary bg-opacity-5 blur-3xl rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-lg mt-auto border-t border-white border-opacity-[0.03]">
          <div className="flex items-center gap-md mb-lg p-sm rounded-md bg-white bg-opacity-[0.02]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-soft-cream truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-light truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-sm px-md py-lg bg-danger bg-opacity-10 hover:bg-opacity-20 text-danger border border-danger border-opacity-20 rounded-md text-xs font-bold transition-all duration-300 group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            LOG OUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Gradients for Depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />

        {/* Header - Mobile Toggle */}
        <header className="bg-warm-black border-b border-white border-opacity-[0.03] px-lg py-md flex items-center justify-between md:hidden relative z-10 transition-colors">
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto relative z-10">
          <div className="container mx-auto px-lg py-xl md:px-2xl max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-warm-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
