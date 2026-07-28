'use client';

import React from 'react';
import type { User, UserStatus } from '../types/user.types';
import { User as UserIcon, Mail, Shield, UserX, UserCheck, Trash2, UserCog, AlertCircle } from 'lucide-react';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onChangeRole: (user: User) => void;
  onChangeStatus: (user: User, status: UserStatus) => void;
  onDelete: (user: User) => void;
}

export function UserTable({
  users,
  isLoading,
  onChangeRole,
  onChangeStatus,
  onDelete,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-slate-800/50" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/60 border border-slate-800">
        <AlertCircle className="w-12 h-12 text-amber-500/80 mb-3" />
        <h3 className="text-lg font-semibold text-slate-200">No Users Found</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          No users match your current search query or filter options.
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
                <UserIcon className="w-4 h-4 text-cyan-400" /> Name
              </div>
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" /> Email
              </div>
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" /> Role
              </div>
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Status
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Created At
            </th>
            <th scope="col" className="px-6 py-4 font-semibold text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {users.map((u) => {
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || 'N/A';
            const isSelfOrSuper = u.role?.name === 'SUPER_ADMIN';

            return (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                <td className="px-6 py-4 font-semibold text-slate-100">{fullName}</td>
                <td className="px-6 py-4 text-slate-300 font-mono text-xs">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                    {u.role?.name || 'No Role'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.status === 'ACTIVE' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                    </span>
                  )}
                  {u.status === 'INACTIVE' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Inactive
                    </span>
                  )}
                  {u.status === 'SUSPENDED' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Suspended
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onChangeRole(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-950/40 transition-colors"
                      title="Change User Role"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>

                    {u.status === 'ACTIVE' ? (
                      <button
                        onClick={() => onChangeStatus(u, 'INACTIVE')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-950/40 transition-colors"
                        title="Deactivate User & Revoke Sessions"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onChangeStatus(u, 'ACTIVE')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                        title="Activate User"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}

                    {!isSelfOrSuper && (
                      <button
                        onClick={() => onDelete(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
