'use client';

import React, { useState } from 'react';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useCreateAttributeValue, useDeleteAttributeValue } from '../hooks/useAttributes';
import type { AttributeItem } from '../types/attribute.types';
import { toast } from '@/lib/toast';

interface AttributeValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: AttributeItem | null;
}

export function AttributeValueModal({ isOpen, onClose, attribute }: AttributeValueModalProps) {
  const [newValue, setNewValue] = useState('');
  const [displayColor, setDisplayColor] = useState('#15803d');

  const createValMutation = useCreateAttributeValue();
  const deleteValMutation = useDeleteAttributeValue();

  if (!isOpen || !attribute) return null;

  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    const payload: any = {
      value: newValue.trim(),
    };

    if (attribute.type === 'COLOR_SWATCH') {
      payload.displayColor = displayColor;
    }

    try {
      await createValMutation.mutateAsync({
        attributeId: attribute.id,
        payload,
      });
      toast.success(`Value "${newValue.trim()}" added to ${attribute.name}!`);
      setNewValue('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add value.');
    }
  };

  const handleDeleteValue = async (valueId: string, valStr: string) => {
    try {
      await deleteValMutation.mutateAsync({
        attributeId: attribute.id,
        valueId,
      });
      toast.success(`Value "${valStr}" removed.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete value.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manage Values for "{attribute.name}"</h2>
            <p className="text-xs text-slate-500">Display Type: <span className="font-bold text-emerald-700">{attribute.type}</span></p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Value Form */}
        <form onSubmit={handleAddValue} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            required
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="New option value (e.g. Red, XL)..."
            className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-hidden focus:border-emerald-500"
          />

          {attribute.type === 'COLOR_SWATCH' && (
            <input
              type="color"
              value={displayColor}
              onChange={(e) => setDisplayColor(e.target.value)}
              className="w-10 h-10 p-1 rounded-xl border border-slate-200 cursor-pointer bg-white"
              title="Pick Hex Color"
            />
          )}

          <button
            type="submit"
            disabled={createValMutation.isPending}
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 disabled:opacity-50"
          >
            {createValMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </form>

        {/* List of existing values */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 pt-2">
          <p className="text-xs font-bold text-slate-700">Current Values ({attribute.values?.length || 0}):</p>
          {attribute.values && attribute.values.length > 0 ? (
            attribute.values.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2">
                  {v.displayColor && (
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                      style={{ backgroundColor: v.displayColor }}
                    />
                  )}
                  <span className="font-bold text-slate-900">{v.value}</span>
                  {v.displayColor && <span className="text-[10px] font-mono text-slate-400">{v.displayColor}</span>}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteValue(v.id, v.value)}
                  disabled={deleteValMutation.isPending}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Value"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No values defined yet.</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
