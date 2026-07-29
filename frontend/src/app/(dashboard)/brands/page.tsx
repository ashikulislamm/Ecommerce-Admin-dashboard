'use client';

import React, { useState } from 'react';
import { useBrands, useDeleteBrand } from '@/features/brands/hooks/useBrands';
import { CreateBrandModal } from '@/features/brands/components/CreateBrandModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { toast } from '@/lib/toast';
import { Plus, Search, Filter, RefreshCw, Award, Edit2, Trash2 } from 'lucide-react';
import type { BrandItem, BrandStatus } from '@/features/brands/types/brand.types';

export default function BrandsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BrandStatus | ''>('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null);

  const { data, isLoading, refetch } = useBrands({
    page,
    limit: 20,
    search: search || undefined,
    status: (status as BrandStatus) || undefined,
  });

  const deleteMutation = useDeleteBrand();

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEdit = (brand: BrandItem) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return;
    try {
      await deleteMutation.mutateAsync(deletingBrand.id);
      toast.success(`Brand "${deletingBrand.name}" deleted successfully.`);
      setDeletingBrand(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete brand. Brands with assigned products cannot be deleted.');
      setDeletingBrand(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Brand Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage manufacturer & product brand identities across the catalog.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Brand
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brands by name or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as BrandStatus | '');
                setPage(1);
              }}
              className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Brand Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Brand Name</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Assigned Products</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-4 text-center text-slate-400">Loading brands...</td>
                  </tr>
                ))
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No Brands Found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "Add New Brand" to create your first brand.</p>
                  </td>
                </tr>
              ) : (
                data.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{brand.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{brand.slug}</td>
                    <td className="p-3.5 text-slate-700 font-bold">{brand._count?.products || 0} product(s)</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        brand.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {brand.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button onClick={() => handleEdit(brand)} className="text-slate-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => setDeletingBrand(brand)} className="text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CreateBrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editBrand={editingBrand}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingBrand}
        title="Delete Brand"
        description="Are you sure you want to delete this brand? Brands with assigned products cannot be deleted."
        itemName={deletingBrand?.name}
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingBrand(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}