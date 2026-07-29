'use client';

import React, { useState } from 'react';
import { useProducts, useDeleteProduct } from '@/features/products/hooks/useProducts';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { ProductTable } from '@/features/products/components/ProductTable';
import { CreateSimpleProductModal } from '@/features/products/components/CreateSimpleProductModal';
import { CreateVariableProductModal } from '@/features/products/components/CreateVariableProductModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from '@/lib/toast';
import { Plus, Search, Filter, RefreshCw, Package, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductItem, ProductType, ProductStatus } from '@/features/products/types/product.types';

export default function ProductsPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [productType, setProductType] = useState<ProductType | ''>('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'price'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  const canRead = hasPermission('products:read');

  const { data: response, isLoading, refetch } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    productType: (productType as ProductType) || undefined,
    status: (status as ProductStatus) || undefined,
    sortBy,
    sortOrder,
  });

  const { data: brandsData } = useBrands({ page: 1, limit: 100 });
  const { data: categoriesData } = useCategories({ page: 1, limit: 100 });

  const deleteMutation = useDeleteProduct();

  const products = response?.data || [];
  const meta = response?.meta;

  const handleOpenSimpleCreate = () => {
    setEditingProduct(null);
    setIsSimpleModalOpen(true);
  };

  const handleOpenVariableCreate = () => {
    setEditingProduct(null);
    setIsVariableModalOpen(true);
  };

  const handleEdit = (product: ProductItem) => {
    setEditingProduct(product);
    if (product.productType === 'SIMPLE') {
      setIsSimpleModalOpen(true);
    } else {
      setIsVariableModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      await deleteMutation.mutateAsync(deletingProduct.id);
      toast.success(`Product "${deletingProduct.name}" deleted successfully.`);
      setDeletingProduct(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product.');
      setDeletingProduct(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access Product Catalog Management." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Product Catalog Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage simple and variable products, inventory, media galleries, and automated variant matrices
            </p>
          </div>
        </div>

        <PermissionGate permission="products:create">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenSimpleCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" /> Create Simple Product
            </button>
            <button
              onClick={handleOpenVariableCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Layers className="w-4 h-4" /> Create Variable Product
            </button>
          </div>
        </PermissionGate>
      </div>

      {/* Control Bar & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="relative">
              <select
                value={productType}
                onChange={(e) => {
                  setProductType(e.target.value as ProductType | '');
                  setPage(1);
                }}
                className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 appearance-none"
              >
                <option value="">All Product Types</option>
                <option value="SIMPLE">SIMPLE</option>
                <option value="VARIABLE">VARIABLE</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ProductStatus | '');
                  setPage(1);
                }}
                className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Refresh Catalog"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Second row filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Category:</span>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium"
            >
              <option value="">All Categories</option>
              {categoriesData?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Brand:</span>
            <select
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium"
            >
              <option value="">All Brands</option>
              {brandsData?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="font-bold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Product Name</option>
              <option value="price">Price</option>
            </select>
            <button
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(p) => setDeletingProduct(p)}
      />

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 font-medium">
          <div>
            Showing page <span className="font-bold text-slate-900">{meta.page}</span> of{' '}
            <span className="font-bold text-slate-900">{meta.totalPages}</span> ({meta.total} total products)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Simple Product Modal */}
      <CreateSimpleProductModal
        isOpen={isSimpleModalOpen}
        onClose={() => setIsSimpleModalOpen(false)}
        editProduct={editingProduct}
      />

      {/* Create Variable Product Modal */}
      <CreateVariableProductModal
        isOpen={isVariableModalOpen}
        onClose={() => setIsVariableModalOpen(false)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingProduct}
        title="Delete Product"
        description="Are you sure you want to delete this product? Soft-deleted products will be archived from active sales channels."
        itemName={deletingProduct?.name}
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}