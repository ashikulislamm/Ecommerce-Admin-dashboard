'use client';

import React from 'react';
import type { PermissionGroup } from '../types/permission.types';
import { Layers, CheckCircle2, Shield } from 'lucide-react';

interface PermissionGroupMatrixProps {
  groups: PermissionGroup[];
  isLoading: boolean;
}

export function PermissionGroupMatrix({ groups, isLoading }: PermissionGroupMatrixProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
        No permission groups found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <div
          key={group.id}
          className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between hover:border-slate-700 transition-all"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 text-base">{group.name}</h4>
                  <span className="text-xs font-mono text-emerald-400/80 capitalize">
                    {group.module}
                  </span>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                {group.permissions?.length || 0} Actions
              </span>
            </div>

            {group.description && (
              <p className="text-xs text-slate-400 mb-4">{group.description}</p>
            )}

            <div className="space-y-2">
              {group.permissions && group.permissions.length > 0 ? (
                group.permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 text-xs border border-slate-800/80"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium text-slate-200">{perm.action}</span>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-400/80 bg-slate-900 px-1.5 py-0.5 rounded">
                      {perm.key}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">No permissions in group</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
