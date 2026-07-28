'use client';

import React from 'react';
import type { Permission } from '../types/permission.types';
import { Key, Tag, Calendar, Trash2, Edit3, ShieldAlert } from 'lucide-react';

interface PermissionTableProps {
  permissions: Permission[];
  isLoading: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
}

export function PermissionTable({ permissions, isLoading, onEdit, onDelete }: PermissionTableProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4 bg-white rounded-2xl border border-slate-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs">
        <ShieldAlert className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Permissions Found</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          No permissions match your current search query or module filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-bold">
          <tr>
            <th scope="col" className="px-6 py-3.5">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-700" /> Module
              </div>
            </th>
            <th scope="col" className="px-6 py-3.5">
              Action
            </th>
            <th scope="col" className="px-6 py-3.5">
              <div className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-lime-700" /> Permission Key
              </div>
            </th>
            <th scope="col" className="px-6 py-3.5">
              Type
            </th>
            <th scope="col" className="px-6 py-3.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Created At
              </div>
            </th>
            <th scope="col" className="px-6 py-3.5 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {permissions.map((perm) => (
            <tr
              key={perm.id}
              className="hover:bg-slate-50/80 transition-colors duration-150 group"
            >
              <td className="px-6 py-3.5 font-bold text-slate-900 capitalize">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  {perm.module}
                </span>
              </td>
              <td className="px-6 py-3.5 font-semibold text-slate-800">
                {perm.action}
              </td>
              <td className="px-6 py-3.5">
                <span className="font-mono text-xs text-emerald-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/80">
                  {perm.key}
                </span>
              </td>
              <td className="px-6 py-3.5">
                {perm.isCustom ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-lime-100 text-lime-900 border border-lime-200">
                    Custom
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    System
                  </span>
                )}
              </td>
              <td className="px-6 py-3.5 text-xs text-slate-500 font-medium">
                {new Date(perm.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(perm)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Edit Permission"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(perm)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
