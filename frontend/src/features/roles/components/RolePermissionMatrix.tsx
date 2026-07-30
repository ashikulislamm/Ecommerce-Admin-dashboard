'use client';

import React, { useState } from 'react';
import type { Role } from '../types/role.types';
import type { PermissionGroup, Permission } from '@/features/permissions/types/permission.types';
import { ShieldCheck, Save, Sparkles, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface RolePermissionMatrixProps {
  selectedRole: Role | null;
  groups: PermissionGroup[];
  onSavePermissions: (roleId: string, permissionIds: string[]) => Promise<void>;
  onGrantAllPermissions: (roleId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function RolePermissionMatrix({
  selectedRole,
  groups,
  onSavePermissions,
  onGrantAllPermissions,
  isSubmitting,
}: RolePermissionMatrixProps) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [prevRoleId, setPrevRoleId] = useState<string | null>(null);

  if (selectedRole && selectedRole.id !== prevRoleId) {
    setPrevRoleId(selectedRole.id);
    const initialIds =
      selectedRole.permissions?.map((p: Permission) => p.id) ||
      selectedRole.rolePermissions?.map((rp) => rp.permissionId || rp.permission?.id || '') ||
      [];
    setSelectedPermissionIds(initialIds.filter(Boolean));
    setHasUnsavedChanges(false);
  }

  if (!selectedRole) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-xs h-full min-h-[350px]">
        <ShieldCheck className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-base font-bold text-slate-900">Select a Role</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Select a role from the left sidebar to configure its module action permissions matrix.
        </p>
      </div>
    );
  }

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      const updated = prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId];
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const handleToggleModuleAll = (group: PermissionGroup) => {
    const groupPermIds = group.permissions?.map((p) => p.id) || [];
    const allSelected = groupPermIds.every((id) => selectedPermissionIds.includes(id));

    setSelectedPermissionIds((prev) => {
      let updated: string[];
      if (allSelected) {
        updated = prev.filter((id) => !groupPermIds.includes(id));
      } else {
        updated = Array.from(new Set([...prev, ...groupPermIds]));
      }
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const handleSave = async () => {
    await onSavePermissions(selectedRole.id, selectedPermissionIds);
    setHasUnsavedChanges(false);
  };

  const handleGrantAll = async () => {
    if (window.confirm(`Are you sure you want to grant ALL system permissions to role "${selectedRole.name}"?`)) {
      await onGrantAllPermissions(selectedRole.id);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-slate-900">{selectedRole.name}</h3>
            {selectedRole.isSystemRole && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lime-100 text-lime-900 border border-lime-200">
                System Role
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Configure permission access matrix for {selectedRole.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="lime"
            onClick={handleGrantAll}
            disabled={isSubmitting}
          >
            <Sparkles className="w-4 h-4 text-lime-700" /> Grant All Permissions
          </Button>

          <Button
            variant={hasUnsavedChanges ? 'emerald' : 'outline'}
            onClick={handleSave}
            disabled={isSubmitting || !hasUnsavedChanges}
            className={hasUnsavedChanges ? 'animate-pulse' : ''}
          >
            <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Matrix'}
          </Button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
          <span>Unsaved changes in matrix. Click &quot;Save Matrix&quot; to commit updates.</span>
        </div>
      )}

      {/* Permission Modules Matrix */}
      <div className="space-y-6">
        {groups.map((group) => {
          const groupPermIds = group.permissions?.map((p) => p.id) || [];
          const isAllModuleSelected =
            groupPermIds.length > 0 && groupPermIds.every((id) => selectedPermissionIds.includes(id));

          return (
            <div key={group.module} className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                <span className="font-bold text-xs text-slate-900 capitalize tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  {group.module} Module
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleModuleAll(group)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
                >
                  {isAllModuleSelected ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-emerald-700" /> Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" /> Select All
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {group.permissions?.map((p) => {
                  const isChecked = selectedPermissionIds.includes(p.id);

                  return (
                    <label
                      key={p.id}
                      onClick={() => handleTogglePermission(p.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-white border-emerald-300 text-emerald-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-mono text-xs">{p.action}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-emerald-600 rounded border-slate-300 cursor-pointer"
                      />
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
