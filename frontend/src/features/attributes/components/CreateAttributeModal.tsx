'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreateAttribute, useUpdateAttribute } from '../hooks/useAttributes';
import type { AttributeItem, AttributeType } from '../types/attribute.types';
import { toast } from '@/lib/toast';

interface CreateAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAttribute?: AttributeItem | null;
}

export function CreateAttributeModal({ isOpen, onClose, editAttribute }: CreateAttributeModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<AttributeType>('DROPDOWN');
  const [description, setDescription] = useState('');

  const createMutation = useCreateAttribute();
  const updateMutation = useUpdateAttribute();

  useEffect(() => {
    if (editAttribute) {
      setName(editAttribute.name);
      setSlug(editAttribute.slug);
      setType(editAttribute.type);
      setDescription(editAttribute.description || '');
    } else {
      setName('');
      setSlug('');
      setType('DROPDOWN');
      setDescription('');
    }
  }, [editAttribute, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      slug: slug || undefined,
      type,
      description: description || undefined,
    };

    try {
      if (editAttribute) {
        await updateMutation.mutateAsync({ id: editAttribute.id, payload });
        toast.success(`Attribute "${name}" updated successfully!`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Attribute "${name}" created successfully!`);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save attribute.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {editAttribute ? 'Edit Attribute' : 'Create Product Attribute'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Attribute Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Color, Size, Material"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Display Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AttributeType)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="DROPDOWN">Dropdown Select</option>
              <option value="RADIO">Radio Buttons</option>
              <option value="CHECKBOX">Checkboxes</option>
              <option value="COLOR_SWATCH">Color Swatch (Hex Code)</option>
              <option value="IMAGE_SWATCH">Image Swatch</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Custom Slug (Optional)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto-generated if left empty"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Attribute details..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {editAttribute ? 'Save Changes' : 'Create Attribute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
