'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  Users,
  FolderTree,
  Award,
  Shield,
  ShieldCheck,
  ImageIcon,
  Sliders,
  ArrowRight,
  Plus,
  CheckCircle2,
  Lock,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { Card, Badge, Button } from '@/components/ui';

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch real system metric data
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ page: 1, limit: 5 });
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories({ page: 1, limit: 100 });
  const { data: brandsData, isLoading: isLoadingBrands } = useBrands({ page: 1, limit: 100 });
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ page: 1, limit: 100 });
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles({ page: 1, limit: 100 });
  const { data: permissionsData, isLoading: isLoadingPermissions } = usePermissions({ page: 1, limit: 100 });

  // Calculate real metrics from responses
  const totalProducts = productsData?.meta?.total ?? productsData?.data?.length ?? 0;
  const totalCategories = categoriesData?.length ?? 0;
  const totalBrands = brandsData?.length ?? 0;
  const totalUsers = usersData?.meta?.total ?? usersData?.data?.length ?? 0;
  const totalRoles = rolesData?.meta?.total ?? rolesData?.data?.length ?? 0;
  const totalPermissions = permissionsData?.meta?.total ?? permissionsData?.data?.length ?? 0;

  const recentProducts = productsData?.data?.slice(0, 5) || [];

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'Administrator';

  return (
    <div className="space-y-8">
      {/* ERP Welcome Header */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {userName}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/products">
              <Button variant="emerald">
                <Plus className="w-4 h-4" /> Manage Products
              </Button>
            </Link>
            <Link href="/users">
              <Button variant="outline">
                <Users className="w-4 h-4" /> User Management
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Primary Operational Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Products Catalog */}
        <Card hoverable className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Product Catalog
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {isLoadingProducts ? '...' : totalProducts}
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Total SKUs &amp; Variants</span>
            <Link href="/products" className="hover:underline font-bold inline-flex items-center gap-0.5">
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 2: Categories & Brands */}
        <Card hoverable className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Taxonomy &amp; Brands
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {isLoadingCategories || isLoadingBrands ? '...' : totalCategories + totalBrands}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{totalCategories} Categories • {totalBrands} Brands</span>
            <Link href="/categories" className="hover:underline text-purple-700 font-bold inline-flex items-center gap-0.5">
              Tree <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 3: System Users */}
        <Card hoverable className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Accounts
            </span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {isLoadingUsers ? '...' : totalUsers}
          </div>
          <div className="text-[11px] font-semibold text-sky-700 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Session Security</span>
            <Link href="/users" className="hover:underline font-bold inline-flex items-center gap-0.5">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 4: RBAC Permissions & Roles */}
        <Card hoverable className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              RBAC Governance
            </span>
            <div className="p-2.5 rounded-xl bg-lime-50 text-lime-800 border border-lime-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {isLoadingRoles || isLoadingPermissions ? '...' : `${totalRoles} / ${totalPermissions}`}
          </div>
          <div className="text-[11px] font-semibold text-lime-800 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Roles / Permission Keys</span>
            <Link href="/roles" className="hover:underline font-bold inline-flex items-center gap-0.5">
              Matrix <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Main Real Data Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Catalog Items (2 cols) */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Recent Catalog Additions</h3>
                  <p className="text-[11px] text-slate-500">Live products registered in system database</p>
                </div>
              </div>
              <Link href="/products">
                <Button variant="ghost" size="sm">
                  View All <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {isLoadingProducts ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">Loading catalog data...</div>
              ) : recentProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">No products in catalog yet.</div>
              ) : (
                recentProducts.map((p) => {
                  const media = p.productMedia?.find((pm) => pm.isPrimary)?.media;
                  const thumb = media?.thumbnailUrl || media?.url;
                  const prices = p.variants?.map((v) => Number(v.price)) || [];
                  const price = prices.length > 0 ? `$${Math.min(...prices).toFixed(2)}` : '$0.00';

                  return (
                    <div key={p.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                          {thumb ? (
                            <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{p.name}</h4>
                          <p className="text-[10px] font-mono text-slate-400 truncate">SKU: {p.sku}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-xs">
                        <span className="font-bold text-slate-900">{price}</span>
                        <Badge variant={p.status.toLowerCase() as 'active' | 'inactive' | 'draft' | 'archived'}>
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 px-5 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Showing latest {recentProducts.length} entries</span>
            <span className="font-semibold text-slate-700">Live Database Context</span>
          </div>
        </Card>

        {/* Right Column: Governance Summary (1 col) */}
        <Card className="p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-lg bg-lime-50 text-lime-800 border border-lime-200">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">System Security &amp; RBAC</h3>
                <p className="text-[11px] text-slate-500">Access governance infrastructure</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">System Roles</span>
                  <span className="text-[11px] text-slate-500">Configured RBAC profiles</span>
                </div>
                <span className="font-black text-slate-900 text-base">{isLoadingRoles ? '...' : totalRoles}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Permission Keys</span>
                  <span className="text-[11px] text-slate-500">System action privileges</span>
                </div>
                <span className="font-black text-slate-900 text-base">{isLoadingPermissions ? '...' : totalPermissions}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Active Users</span>
                  <span className="text-[11px] text-slate-500">Registered system accounts</span>
                </div>
                <span className="font-black text-slate-900 text-base">{isLoadingUsers ? '...' : totalUsers}</span>
              </div>
            </div>
          </div>

          <Link href="/permissions" className="block">
            <Button variant="lime" className="w-full justify-center">
              <ShieldCheck className="w-4 h-4" /> Configure Access Matrix
            </Button>
          </Link>
        </Card>
      </div>

      {/* System Administration Modules Launchpad */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" /> Operational Administration Modules
          </h2>
          <span className="text-xs text-slate-500 font-medium">Core Enterprise Capabilities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Module 1: Catalog */}
          <Card hoverable className="p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Product Catalog
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Manage simple and variable products, variant matrices, and prices.
              </p>
            </div>
            <Link href="/products" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
              Manage Catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>

          {/* Module 2: Taxonomy */}
          <Card hoverable className="p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 w-fit">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                Categories &amp; Brands
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Organize nested category trees and manufacturer brand identities.
              </p>
            </div>
            <Link href="/categories" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800">
              Taxonomy Tree <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>

          {/* Module 3: Users */}
          <Card hoverable className="p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 w-fit">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                User Accounts
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Manage system users, assign roles, toggle activation, and revoke sessions.
              </p>
            </div>
            <Link href="/users" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800">
              User Accounts <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>

          {/* Module 4: RBAC */}
          <Card hoverable className="p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-lime-50 text-lime-800 border border-lime-200 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-lime-800 transition-colors">
                Roles &amp; Permissions
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Configure role permission matrix, grant system keys, and inspect roles.
              </p>
            </div>
            <Link href="/roles" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-lime-800 hover:text-lime-900">
              Access Matrix <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}