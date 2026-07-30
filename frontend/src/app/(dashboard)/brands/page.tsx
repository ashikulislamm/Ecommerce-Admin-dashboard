'use client';

import React, { useState } from 'react';
import { useBrands, useDeleteBrand } from '@/features/brands/hooks/useBrands';
import { CreateBrandModal } from '@/features/brands/components/CreateBrandModal';
import {
  ConfirmDeleteModal,
  PageHeader,
  SearchInput,
  Card,
  Badge,
  EmptyState,
  TableSkeleton,
  Button,
} from '@/components/ui';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from '@/lib/toast';
import { Plus, Filter, RefreshCw, Award, Edit2, Trash2 } from 'lucide-react';
import type { BrandItem, BrandStatus } from '@/features/brands/types/brand.types';

export default function BrandsPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BrandStatus | ''>('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null);

  const canRead = hasPermission('brands:read');

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
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete brand.';
      toast.error(errorMsg);
      setDeletingBrand(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access Brand Management." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Brand Management"
        description="Manage manufacturer & product brand identities across the catalog."
        icon={Award}
        action={
          <PermissionGate permission="brands:create">
            <Button variant="emerald" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4" />
              Add New Brand
            </Button>
          </PermissionGate>
        }
      />

      {/* Search & Filter Toolbar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <SearchInput
            value={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search brands by name or slug..."
          />

          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as BrandStatus | '');
                setPage(1);
              }}
              className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <Button
          variant="secondary"
          size="icon"
          onClick={() => refetch()}
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </Card>

      {/* Brand Table */}
      <Card className="overflow-hidden">
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
                <TableSkeleton rows={5} columns={5} />
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Award}
                      title="No Brands Found"
                      description="Click &quot;Add New Brand&quot; to create your first brand."
                    />
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
                      <Badge variant={brand.status === 'ACTIVE' ? 'active' : 'inactive'}>
                        {brand.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(brand)}
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        variant="destructiveGhost"
                        size="sm"
                        onClick={() => setDeletingBrand(brand)}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Brand Modal */}
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