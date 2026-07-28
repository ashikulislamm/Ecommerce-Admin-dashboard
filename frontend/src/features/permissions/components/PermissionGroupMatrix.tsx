'use client';

import React from 'react';
import type { PermissionGroup } from '../types/permission.types';
import { Layers, ShieldCheck } from 'lucide-react';

interface PermissionGroupMatrixProps {
  groups: PermissionGroup[];
  isLoading: boolean;
}

export function PermissionGroupMatrix({ groups, isLoading }: PermissionGroupMatrixProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-white border border-slate-200" />
        ))}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-slate-200">
        <Layers className="w-12 h-12 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Permission Groups Found</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Permission groups will automatically appear here once permissions are registered.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {groups.map((g) => (
        <div
          key={g.id || g.module}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                <ShieldCheck className="w-4 h-4 text-emerald-700" /> {g.module}
              </span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {g.permissions?.length || 0} Actions
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mb-4">
              {g.description || `Registered action controls for the ${g.module} module.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
            {g.permissions?.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200/80"
              >
                {p.action}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
