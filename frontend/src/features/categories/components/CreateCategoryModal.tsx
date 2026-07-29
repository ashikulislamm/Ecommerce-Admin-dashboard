'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategories';
import type { CategoryItem } from '../types/category.types';
import { toast } from '@/lib/toast';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentCategory?: CategoryItem | null;
  editCategory?: CategoryItem | null;
  allCategories?: CategoryItem[];
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  parentCategory,
  editCategory,
  allCategories = [],
}: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setSlug(editCategory.slug);
      setDescription(editCategory.description || '');
      setParentId(editCategory.parentId || '');
      setStatus(editCategory.status);
    } else if (parentCategory) {
      setName('');
      setSlug('');
      setDescription('');
      setParentId(parentCategory.id);
      setStatus('ACTIVE');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setParentId('');
      setStatus('ACTIVE');
    }
  }, [editCategory, parentCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      slug: slug || undefined,
      description: description || undefined,
      parentId: parentId || undefined,
      status,
    };

    try {
      if (editCategory) {
        await updateMutation.mutateAsync({ id: editCategory.id, payload });
        toast.success(`Category "${name}" updated successfully!`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Category "${name}" created successfully!`);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {editCategory ? 'Edit Category' : parentCategory ? `Add Subcategory under "${parentCategory.name}"` : 'Create Category'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laptops & Computers"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
            />
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
            <label className="block font-bold text-slate-700 mb-1">Parent Category</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="">None (Root Category)</option>
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.id} disabled={editCategory?.id === cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category details..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
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
              {editCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
