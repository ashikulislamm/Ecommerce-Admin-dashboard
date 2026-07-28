'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ShieldCheck, Users, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Admin Dashboard Overview
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Welcome to the Ecommerce Admin Dashboard management portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/permissions"
          className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group backdrop-blur-md"
        >
          <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 w-fit mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
            Permission Management
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Configure system permissions, module action keys, and custom action rules.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            Open Permissions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        <Link
          href="/roles"
          className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all group backdrop-blur-md"
        >
          <div className="p-3 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20 w-fit mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
            Role Management
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Manage system roles, grant all permissions, and edit interactive RBAC matrices.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400">
            Open Roles <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        <Link
          href="/users"
          className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all group backdrop-blur-md"
        >
          <div className="p-3 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 w-fit mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
            User Management
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Create user accounts, assign roles, toggle activation, and revoke sessions.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            Open Users <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>
    </div>
  );
}