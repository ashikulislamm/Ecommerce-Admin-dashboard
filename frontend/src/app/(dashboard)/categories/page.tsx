'use client';

import React, { useState } from 'react';
import { useCategoryTree, useCategories, useDeleteCategory } from '@/features/categories/hooks/useCategories';
import { CategoryTreeView } from '@/features/categories/components/CategoryTreeView';
import { CreateCategoryModal } from '@/features/categories/components/CreateCategoryModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Plus, RefreshCw, GitBranch, List, FolderTree } from 'lucide-react';
import type { CategoryItem } from '@/features/categories/types/category.types';

export default function CategoriesPage() {
  const { hasPermission } = useAuth();
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<CategoryItem | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<CategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  const canRead = hasPermission('categories:read');

  const { data: treeData, isLoading: isTreeLoading, refetch: refetchTree } = useCategoryTree();
  const { data: flatData, isLoading: isFlatLoading, refetch: refetchFlat } = useCategories({ page: 1, limit: 100 });

  const deleteMutation = useDeleteCategory();

  const handleOpenAddRoot = () => {
    setSelectedParent(null);
    setSelectedEdit(null);
    setIsModalOpen(true);
  };

  const handleAddSub = (parent: CategoryItem) => {
    setSelectedParent(parent);
    setSelectedEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setSelectedParent(null);
    setSelectedEdit(category);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      await deleteMutation.mutateAsync(deletingCategory.id);
      toast.success(`Category "${deletingCategory.name}" deleted successfully.`);
      setDeletingCategory(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category.');
      setDeletingCategory(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access Category Management." />;
  }

  return (
    <div className="space-y-6">
      {/* Unified Page Header */}
      <PageHeader
        title="Category Hierarchy & Management"
        description="Organize products into unlimited nested categories and parent trees."
        icon={FolderTree}
        action={
          <PermissionGate permission="categories:create">
            <button
              onClick={handleOpenAddRoot}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Root Category
            </button>
          </PermissionGate>
        }
      />

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('tree')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'tree' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Tree View
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'flat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Flat Table
          </button>
        </div>

        <button
          onClick={() => {
            refetchTree();
            refetchFlat();
          }}
          className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* View Modes */}
      {viewMode === 'tree' ? (
        <CategoryTreeView
          categories={treeData || []}
          onAddSub={handleAddSub}
          onEdit={handleEdit}
          onDelete={(cat) => setDeletingCategory(cat)}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Slug</th>
                  <th className="p-3.5">Parent Category</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isFlatLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="p-4 text-center text-slate-400">Loading categories...</td>
                    </tr>
                  ))
                ) : (flatData || []).map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{cat.name}</td>
                    <td className="p-3.5 font-mono text-slate-500">{cat.slug}</td>
                    <td className="p-3.5 text-slate-600">{cat.parent?.name || '—'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cat.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button onClick={() => handleEdit(cat)} className="text-slate-600 hover:text-emerald-700 font-bold">Edit</button>
                      <button onClick={() => setDeletingCategory(cat)} className="text-rose-600 hover:text-rose-800 font-bold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parentCategory={selectedParent}
        editCategory={selectedEdit}
        allCategories={flatData || []}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingCategory}
        title="Delete Category"
        description="Are you sure you want to delete this category? Categories with subcategories or assigned products cannot be deleted."
        itemName={deletingCategory?.name}
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}