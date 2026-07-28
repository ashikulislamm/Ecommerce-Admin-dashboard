'use client';

import React from 'react';
import type { Permission } from '../types/permission.types';
import { Shield, Key, Tag, Calendar, Trash2, Edit3, ShieldAlert } from 'lucide-react';

interface PermissionTableProps {
  permissions: Permission[];
  isLoading: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
}

export function PermissionTable({ permissions, isLoading, onEdit, onDelete }: PermissionTableProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-slate-800/50" />
        ))}
      </div>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/60 border border-slate-800">
        <ShieldAlert className="w-12 h-12 text-amber-500/80 mb-3" />
        <h3 className="text-lg font-semibold text-slate-200">No Permissions Found</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          No permissions match your current search query or module filter. Try adjusting your search filters or create a custom permission.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-xl">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" /> Module
              </div>
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Action
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" /> Permission Key
              </div>
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Type
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" /> Created At
              </div>
            </th>
            <th scope="col" className="px-6 py-4 font-semibold text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {permissions.map((perm) => (
            <tr
              key={perm.id}
              className="hover:bg-slate-800/40 transition-colors duration-150 group"
            >
              <td className="px-6 py-4 font-medium text-slate-100 capitalize">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-emerald-400 border border-emerald-500/20">
                  {perm.module}
                </span>
              </td>
              <td className="px-6 py-4 font-semibold text-slate-200">
                {perm.action}
              </td>
              <td className="px-6 py-4 font-mono text-xs text-cyan-300/90 bg-cyan-950/20 px-2 rounded w-fit border border-cyan-500/10">
                {perm.key}
              </td>
              <td className="px-6 py-4">
                {perm.isCustom ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                    Custom
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    System
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-xs text-slate-400">
                {new Date(perm.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(perm)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 transition-colors"
                    title="Edit Permission"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(perm)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Delete Permission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
