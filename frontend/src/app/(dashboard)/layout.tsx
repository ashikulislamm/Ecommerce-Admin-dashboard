'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  ShieldCheck,
  Users,
  Package,
  FolderTree,
  Image as ImageIcon,
  Award,
  Sliders,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package, permission: 'products:read' },
  { label: 'Media Library', href: '/media', icon: ImageIcon, permission: 'media:read' },
  { label: 'Categories', href: '/categories', icon: FolderTree, permission: 'categories:read' },
  { label: 'Brands', href: '/brands', icon: Award, permission: 'brands:read' },
  { label: 'Attributes', href: '/attributes', icon: Sliders, permission: 'attributes:read' },
  { label: 'User Management', href: '/users', icon: Users, permission: 'users:read' },
  { label: 'Roles', href: '/roles', icon: ShieldCheck, permission: 'roles:read' },
  { label: 'Permissions', href: '/permissions', icon: Shield, permission: 'permissions:read' },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, hasPermission } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication Route Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">
            Verifying Authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter NAV_ITEMS by permission
  const visibleNavItems = NAV_ITEMS.filter((item) => hasPermission(item.permission));

  const formatRouteTitle = (path: string | null) => {
    if (!path || path === '/dashboard') return 'Overview';
    const clean = path.replace('/', '').replace('-', ' ');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            A
          </div>
          <span className="font-extrabold text-slate-900 text-base">Apex ERP</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Permission-Aware Sidebar */}
      <aside
        className={`w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 ${
          isMobileMenuOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-emerald-900/10">
            A
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-base leading-none">
              Apex ERP
            </h1>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 uppercase tracking-wider">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'Administrator'}
                </p>
                <p className="text-[10px] font-semibold text-emerald-700 truncate uppercase">
                  {user?.role?.name || 'SUPER_ADMIN'}
                </p>
              </div>
            </div>
            <Button
              variant="destructiveGhost"
              size="icon-sm"
              onClick={() => {
                logout();
                router.push('/login');
              }}
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {formatRouteTitle(pathname)}
            </h2>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
