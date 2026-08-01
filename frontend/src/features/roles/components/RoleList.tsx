'use client';

import React from 'react';
import type { Role } from '../types/role.types';
import { ShieldAlert, Users, Layers, Trash2 } from 'lucide-react';

interface RoleListProps {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  isLoading: boolean;
}

export function RoleList({
  roles,
  selectedRoleId,
  onSelectRole,
  onDeleteRole,
  isLoading,
}: RoleListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-white border border-slate-200" />
        ))}
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white border border-slate-200">
        <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-700">No Roles Found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {roles.map((r) => {
        const isSelected = selectedRoleId === r.id;
        const permissionCount = r.permissions?.length || r.rolePermissions?.length || 0;
        const userCount = r._count?.users || 0;

        return (
          <div
            key={r.id}
            onClick={() => onSelectRole(r)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
              isSelected
                ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">{r.name}</h4>
                  {r.isSystemRole ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lime-100 text-lime-900 border border-lime-200 shrink-0">
                      System
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      Custom
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                  {r.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-4 mt-3 text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" /> {permissionCount} Permissions
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Users className="w-3.5 h-3.5 text-lime-700" /> {userCount} Users
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1">
                {r.name !== 'SUPER_ADMIN' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRole(r);
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all shadow-xs"
                    title={`Delete role "${r.name}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold" title="SUPER_ADMIN is a core system role and cannot be deleted">
                    System Protected
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
