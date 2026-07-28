'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
  Lock,
  Activity,
  Layers,
  Package,
  FolderTree,
} from 'lucide-react';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useUsers } from '@/features/users/hooks/useUsers';

export default function DashboardPage() {
  const { data: permissionsData, isLoading: isLoadingPermissions } = usePermissions({ page: 1, limit: 100 });
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles({ page: 1, limit: 100 });
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ page: 1, limit: 100 });

  const totalPermissions = permissionsData?.meta?.total || permissionsData?.data?.length || 0;
  const totalRoles = rolesData?.meta?.total || rolesData?.data?.length || 0;
  const totalUsers = usersData?.meta?.total || usersData?.data?.length || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Welcome to Apex ERP. System metrics, access governance, and core operational modules.
          </p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Permissions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Permissions
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {isLoadingPermissions ? '...' : totalPermissions}
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active system action keys
          </p>
        </div>

        {/* Card 2: Roles */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Configured Roles
            </span>
            <div className="p-2.5 rounded-xl bg-lime-50 text-lime-800 border border-lime-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {isLoadingRoles ? '...' : totalRoles}
          </div>
          <p className="text-[11px] font-semibold text-lime-800 mt-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> System & Custom RBAC
          </p>
        </div>

        {/* Card 3: Users */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Accounts
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {isLoadingUsers ? '...' : totalUsers}
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-1.5 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Session security active
          </p>
        </div>

        {/* Card 4: System Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Status
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" /> Operational
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mt-1.5">
            API connected & database healthy
          </p>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
          System Administration Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Permissions */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Permission Management
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed font-medium">
                Configure action permission keys, create custom permissions, and group permissions by module.
              </p>
            </div>
            <Link
              href="/permissions"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Manage Permissions Matrix <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Module 2: Roles */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-lime-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="p-3 rounded-xl bg-lime-50 text-lime-800 border border-lime-200 w-fit mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-lime-800 transition-colors">
                Role Management
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed font-medium">
                Manage system and custom roles, grant module permissions, and inspect assignment counts.
              </p>
            </div>
            <Link
              href="/roles"
              className="inline-flex items-center gap-2 text-xs font-bold text-lime-800 hover:text-lime-900 transition-colors"
            >
              Manage Role Matrix <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Module 3: Users */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                User Management
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed font-medium">
                Manage user accounts, assign roles, toggle activation status, and trigger session revocation.
              </p>
            </div>
            <Link
              href="/users"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Manage User Accounts <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}