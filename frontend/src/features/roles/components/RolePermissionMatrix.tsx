'use client';

import React, { useState, useEffect } from 'react';
import type { Role } from '../types/role.types';
import type { PermissionGroup, Permission } from '@/features/permissions/types/permission.types';
import {
  ShieldCheck,
  Save,
  Wand2,
  RotateCcw,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface RolePermissionMatrixProps {
  role: Role;
  permissionGroups: PermissionGroup[];
  allPermissions: Permission[];
  onSaveBatch: (roleId: string, permissionIds: string[]) => Promise<void>;
  onGrantAll: (roleId: string) => Promise<void>;
  isSaving: boolean;
}

export function RolePermissionMatrix({
  role,
  permissionGroups,
  allPermissions,
  onSaveBatch,
  onGrantAll,
  isSaving,
}: RolePermissionMatrixProps) {
  // Currently assigned permission IDs in local state for batch editing
  const initialAssignedIds = React.useMemo(() => {
    return (role.rolePermissions || []).map((rp) => rp.permissionId || rp.permission?.id).filter(Boolean);
  }, [role]);

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(initialAssignedIds);

  useEffect(() => {
    setSelectedPermissionIds(initialAssignedIds);
  }, [initialAssignedIds]);

  const hasUnsavedChanges = React.useMemo(() => {
    if (selectedPermissionIds.length !== initialAssignedIds.length) return true;
    const initialSet = new Set(initialAssignedIds);
    return selectedPermissionIds.some((id) => !initialSet.has(id));
  }, [selectedPermissionIds, initialAssignedIds]);

  const handleToggle = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const handleSelectModuleAll = (group: PermissionGroup) => {
    const groupPermIds = (group.permissions || []).map((p) => p.id);
    setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...groupPermIds])));
  };

  const handleDeselectModuleAll = (group: PermissionGroup) => {
    const groupPermIds = new Set((group.permissions || []).map((p) => p.id));
    setSelectedPermissionIds((prev) => prev.filter((id) => !groupPermIds.has(id)));
  };

  const handleReset = () => {
    setSelectedPermissionIds(initialAssignedIds);
  };

  const handleSave = async () => {
    await onSaveBatch(role.id, selectedPermissionIds);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md shadow-2xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-bold text-slate-100">{role.name}</h3>
            {hasUnsavedChanges && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/30 text-xs font-semibold animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toggle permissions or manage module actions for this role
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasUnsavedChanges && (
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}

          <button
            onClick={() => onGrantAll(role.id)}
            disabled={isSaving || role.name === 'SUPER_ADMIN'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/30 hover:bg-purple-900/60 transition-colors disabled:opacity-50"
          >
            <Wand2 className="w-3.5 h-3.5" /> Grant All System Permissions
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Matrix'}
          </button>
        </div>
      </div>

      {/* Permission Matrix Grid */}
      <div className="space-y-4">
        {permissionGroups.map((group) => {
          const groupPerms = group.permissions || [];
          const allGroupSelected =
            groupPerms.length > 0 &&
            groupPerms.every((p) => selectedPermissionIds.includes(p.id));

          return (
            <div
              key={group.id}
              className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-3">
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm capitalize">{group.name}</h4>
                  <span className="text-[11px] text-slate-400">{group.description}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      allGroupSelected
                        ? handleDeselectModuleAll(group)
                        : handleSelectModuleAll(group)
                    }
                    className="text-xs text-emerald-400 hover:underline font-medium"
                  >
                    {allGroupSelected ? 'Deselect Module' : 'Select All Module'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groupPerms.map((perm) => {
                  const isChecked = selectedPermissionIds.includes(perm.id);

                  return (
                    <label
                      key={perm.id}
                      onClick={() => handleToggle(perm.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-sm'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold capitalize truncate">{perm.action}</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">{perm.key}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
