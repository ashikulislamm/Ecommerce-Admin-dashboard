'use client';

import React, { useState } from 'react';
import { X, Key, Info } from 'lucide-react';
import type { CreatePermissionPayload } from '../types/permission.types';

interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePermissionPayload) => Promise<void>;
  isSubmitting: boolean;
}

export function CreatePermissionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreatePermissionModalProps) {
  const [moduleName, setModuleName] = useState('');
  const [actionName, setActionName] = useState('');
  const [description, setDescription] = useState('');
  const [isCustom, setIsCustom] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const keyPreview =
    moduleName && actionName
      ? `${moduleName.toLowerCase().trim()}:${actionName.toLowerCase().trim()}`
      : 'module:action';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const mod = moduleName.toLowerCase().trim();
    const act = actionName.toLowerCase().trim();

    if (!mod || !act) {
      setErrorMsg('Module and action are required');
      return;
    }

    try {
      await onSubmit({
        module: mod,
        action: act,
        name: `${mod}:${act}`,
        description: description.trim() || undefined,
        isCustom,
      });

      // Reset
      setModuleName('');
      setActionName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create permission');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Create Permission</h3>
            <p className="text-xs text-slate-500">Add a new module action key (`module:action`)</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Module Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. products, categories, orders"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Action Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. create, publish, approve, export"
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors font-medium"
              required
            />
          </div>

          {/* Key Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Permission Key Preview:
            </span>
            <code className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded border border-emerald-200 inline-block">
              {keyPreview}
            </code>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="Brief description of what this permission grants..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Permission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
