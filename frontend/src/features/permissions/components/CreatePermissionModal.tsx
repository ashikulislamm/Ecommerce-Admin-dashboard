'use client';

import React, { useState } from 'react';
import { X, ShieldPlus, Key, Info, Check } from 'lucide-react';
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
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const generatedKey = module && action ? `${module.toLowerCase().trim()}:${action.toLowerCase().trim()}` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!module.trim()) {
      setErrorMsg('Module is required');
      return;
    }
    if (!action.trim()) {
      setErrorMsg('Action is required');
      return;
    }

    const keyRegex = /^[a-z][a-z0-9_-]*:[a-z][a-z0-9_-]*$/;
    if (!keyRegex.test(generatedKey)) {
      setErrorMsg(
        'Invalid key format. Module and action must start with a lowercase letter and contain only alphanumeric characters, hyphens, or underscores (e.g. product:publish)',
      );
      return;
    }

    try {
      await onSubmit({
        module: module.trim().toLowerCase(),
        action: action.trim().toLowerCase(),
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        isCustom,
      });
      // Reset form
      setModule('');
      setAction('');
      setName('');
      setDescription('');
      setIsCustom(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create permission');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
            <ShieldPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Create Permission</h3>
            <p className="text-xs text-slate-400">Add a new standard or custom system permission</p>
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
              Module <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. product, category, order"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Action <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. create, publish, bulk-export"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {generatedKey && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" /> Generated Key:
              </span>
              <span className="font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">
                {generatedKey}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Display Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Publish Product"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="Brief description of this permission's scope"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCustom"
              checked={isCustom}
              onChange={(e) => setIsCustom(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="isCustom" className="text-xs text-slate-300 cursor-pointer">
              Mark as Custom Permission
            </label>
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
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Permission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
