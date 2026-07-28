'use client';

import React from 'react';
import type { Role } from '../types/role.types';
import { Shield, ShieldCheck, Users, Key, Edit3, Trash2, Sliders } from 'lucide-react';

interface RoleListProps {
  roles: Role[];
  isLoading: boolean;
  onSelectRole: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  selectedRoleId?: string;
}

export function RoleList({
  roles,
  isLoading,
  onSelectRole,
  onEdit,
  onDelete,
  selectedRoleId,
}: RoleListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
        No roles found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => {
        const isSelected = selectedRoleId === role.id;
        const userCount = role._count?.users ?? 0;
        const permCount = role._count?.rolePermissions ?? role.rolePermissions?.length ?? 0;

        return (
          <div
            key={role.id}
            onClick={() => onSelectRole(role)}
            className={`cursor-pointer rounded-2xl border p-5 transition-all relative overflow-hidden backdrop-blur-sm ${
              isSelected
                ? 'bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    role.isSystemRole || role.name === 'SUPER_ADMIN'
                      ? 'bg-purple-950/60 text-purple-400 border-purple-500/30'
                      : 'bg-slate-800 text-emerald-400 border-slate-700'
                  }`}
                >
                  {role.name === 'SUPER_ADMIN' ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                    {role.name}
                    {role.isSystemRole && (
                      <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                        System
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {role.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onSelectRole(role)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                  title="Manage Permission Matrix"
                >
                  <Sliders className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(role)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 transition-colors"
                  title="Edit Role Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {!role.isSystemRole && role.name !== 'SUPER_ADMIN' && (
                  <button
                    onClick={() => onDelete(role)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  <strong className="text-slate-200">{userCount}</strong> Assigned User(s)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  <strong className="text-slate-200">{permCount}</strong> Permission(s)
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
