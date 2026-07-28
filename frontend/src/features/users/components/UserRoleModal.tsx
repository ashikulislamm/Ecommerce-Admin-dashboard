'use client';

import React, { useState } from 'react';
import { X, UserCog, Info } from 'lucide-react';
import type { User } from '../types/user.types';
import type { Role } from '@/features/roles/types/role.types';

interface UserRoleModalProps {
  user: User | null;
  roles: Role[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, roleId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function UserRoleModal({
  user,
  roles,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: UserRoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(user?.roleId || roles[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setSelectedRoleId(user.roleId);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await onSubmit(user.id, selectedRoleId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update user role');
    }
  };

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Change User Role</h3>
            <p className="text-xs text-slate-400">Reassign role for {fullName}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select New Role
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-purple-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.description || 'No description'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-950/40 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Assign Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
