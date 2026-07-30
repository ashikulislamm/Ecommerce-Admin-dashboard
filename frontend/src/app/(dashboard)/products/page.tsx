'use client';

import React, { useState } from 'react';
import { useProducts, useDeleteProduct } from '@/features/products/hooks/useProducts';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { ProductTable } from '@/features/products/components/ProductTable';
import { CreateSimpleProductModal } from '@/features/products/components/CreateSimpleProductModal';
import { CreateVariableProductModal } from '@/features/products/components/CreateVariableProductModal';
import { ConfirmDeleteModal, PageHeader, SearchInput, Card, Pagination, Button } from '@/components/ui';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from '@/lib/toast';
import { Plus, Filter, RefreshCw, Package, Layers } from 'lucide-react';
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
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete product.';
      toast.error(errorMsg);
      setDeletingProduct(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access Product Catalog Management." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Product Catalog Management"
        description="Manage simple and variable products, inventory, media galleries, and automated variant matrices"
        icon={Package}
        action={
          <PermissionGate permission="products:create">
            <div className="flex items-center gap-2">
              <Button variant="emerald" onClick={handleOpenSimpleCreate}>
                <Plus className="w-4 h-4" /> Create Simple Product
              </Button>
              <Button variant="purple" onClick={handleOpenVariableCreate}>
                <Layers className="w-4 h-4" /> Create Variable Product
              </Button>
            </div>
          </PermissionGate>
        }
      />

      {/* Control Bar & Filters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <SearchInput
              value={search}
              onSearchChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search products by name, SKU, or description..."
            />

            <div className="relative">
              <select
                value={productType}
                onChange={(e) => {
                  setProductType(e.target.value as ProductType | '');
                  setPage(1);
                }}
                className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 appearance-none cursor-pointer"
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
                className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 appearance-none cursor-pointer"
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

          <Button
            variant="secondary"
            size="icon"
            onClick={() => refetch()}
            title="Refresh Catalog"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
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
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium cursor-pointer"
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
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium cursor-pointer"
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
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'name' | 'price')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium cursor-pointer"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Product Name</option>
              <option value="price">Price</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            >
              {sortOrder.toUpperCase()}
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Product Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(p) => setDeletingProduct(p)}
      />

      {/* Pagination Controls */}
      <Pagination meta={meta} onPageChange={setPage} itemName="products" />

      {/* Modals */}
      <CreateSimpleProductModal
        isOpen={isSimpleModalOpen}
        onClose={() => setIsSimpleModalOpen(false)}
        editProduct={editingProduct}
      />
      <CreateVariableProductModal
        isOpen={isVariableModalOpen}
        onClose={() => setIsVariableModalOpen(false)}
      />
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