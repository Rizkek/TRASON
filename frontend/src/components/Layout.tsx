'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Finance', href: '/finance', icon: '💰' },
    { label: 'Timeline', href: '/timeline', icon: '📅' },
    { label: 'Reminders', href: '/reminders', icon: '🔔' },
    { label: 'Insights', href: '/insights', icon: '💡' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen bg-warm-black">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-gray-strong border-r border-deep-sage border-opacity-20 transition-all duration-300 md:relative md:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo/Branding */}
        <div className="px-2xl py-xl border-b border-deep-sage border-opacity-20">
          <h1 className="text-display font-serif text-warm-gold">
            TRASON
          </h1>
          <p className="text-micro text-gray-light mt-1">Self-Improvement Journey</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-lg py-xl space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-lg px-md py-md rounded-sm transition-colors duration-200 relative group ${
                isActive(item.href)
                  ? 'text-warm-gold'
                  : 'text-gray-light hover:text-soft-cream'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {/* Left indicator bar for active */}
              {isActive(item.href) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-warm-gold rounded-r" />
              )}
              <span className="text-xl ml-2">{item.icon}</span>
              <span className="text-base font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="px-lg py-md border-t border-deep-sage border-opacity-20 space-y-md">
          <div>
            <p className="font-semibold text-sm text-soft-cream">{user?.name || 'User'}</p>
            <p className="text-micro text-gray-light mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-md py-2 bg-warm-brown bg-opacity-20 hover:bg-opacity-40 text-warm-brown border border-warm-brown border-opacity-30 rounded-sm text-sm font-medium transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Mobile Toggle */}
        <header className="bg-gray-strong border-b border-deep-sage border-opacity-20 px-lg py-md flex items-center justify-between md:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle sidebar"
            aria-label="Toggle menu"
            className="text-warm-gold hover:text-pale-blush transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-lg font-serif text-warm-gold">
            TRASON
          </h2>
          <div className="w-6" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-container mx-auto px-2xl py-2xl md:px-2xl">
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
