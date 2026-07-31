'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Package, Upload, Info, Tag, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useCreateSimpleProduct, useUpdateProduct } from '../hooks/useProducts';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useMedia } from '@/features/media/hooks/useMedia';
import { useMediaFolders } from '@/features/media/hooks/useMediaFolders';
import type { ProductItem, ProductStatus } from '../types/product.types';
import { toast } from '@/lib/toast';

interface CreateSimpleProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProduct?: ProductItem | null;
}

export function CreateSimpleProductModal({
  isOpen,
  onClose,
  editProduct,
}: CreateSimpleProductModalProps) {
  const [activeSection, setActiveSection] = useState<'info' | 'taxonomy' | 'pricing' | 'media'>('info');

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(5);
  const [weight, setWeight] = useState<number | ''>('');
  const [brandId, setBrandId] = useState<string>('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [status, setStatus] = useState<ProductStatus>('DRAFT');
  const [thumbnailMediaId, setThumbnailMediaId] = useState<string>('');
  const [galleryMediaIds, setGalleryMediaIds] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  const { data: brandsData } = useBrands({ page: 1, limit: 100 });
  const { data: categoriesData } = useCategories({ page: 1, limit: 100 });
  const { folderTree: foldersTree } = useMediaFolders();
  const { data: mediaData } = useMedia({
    page: 1,
    limit: 100,
    mediaType: 'IMAGE',
    folderId: selectedFolderId || undefined,
  });

  const createMutation = useCreateSimpleProduct();
  const updateMutation = useUpdateProduct();

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setSku(editProduct.sku);
      setSlug(editProduct.slug);
      setDescription(editProduct.description || '');
      const defaultVariant = editProduct.variants?.[0];
      setPrice(defaultVariant ? Number(defaultVariant.price) : '');
      setCompareAtPrice(defaultVariant?.compareAtPrice ? Number(defaultVariant.compareAtPrice) : '');
      setStockQuantity(defaultVariant ? defaultVariant.stockQuantity : 0);
      setLowStockThreshold(defaultVariant?.lowStockThreshold ? defaultVariant.lowStockThreshold : 5);
      setWeight(defaultVariant?.weight ? Number(defaultVariant.weight) : '');
      setBrandId(editProduct.brandId || '');
      setCategoryIds(editProduct.productCategories?.map((pc) => pc.categoryId) || []);
      setStatus(editProduct.status);
      const primaryMedia = editProduct.productMedia?.find((pm) => pm.isPrimary)?.mediaId;
      const gallery = editProduct.productMedia?.filter((pm) => !pm.isPrimary).map((pm) => pm.mediaId) || [];
      setThumbnailMediaId(primaryMedia || '');
      setGalleryMediaIds(gallery);
    } else {
      setName('');
      setSku('');
      setSlug('');
      setDescription('');
      setPrice('');
      setCompareAtPrice('');
      setStockQuantity(10);
      setLowStockThreshold(5);
      setWeight('');
      setBrandId('');
      setCategoryIds([]);
      setStatus('DRAFT');
      setThumbnailMediaId('');
      setGalleryMediaIds([]);
    }
  }, [editProduct, isOpen]);

  if (!isOpen) return null;

  const handleCategoryToggle = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleGalleryToggle = (id: string) => {
    setGalleryMediaIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (categoryIds.length === 0) {
      toast.error('Select at least one category for the product.');
      return;
    }

    if (price === '' || price < 0) {
      toast.error('Regular price cannot be negative.');
      return;
    }

    if (stockQuantity === '' || stockQuantity < 0) {
      toast.error('Stock quantity cannot be negative.');
      return;
    }

    if (compareAtPrice !== '' && Number(compareAtPrice) < Number(price)) {
      toast.error('Sale price (Compare At Price) must be greater than or equal to Regular Price.');
      return;
    }

    const payload = {
      name,
      sku,
      slug: slug || undefined,
      description: description || undefined,
      price: Number(price),
      compareAtPrice: compareAtPrice !== '' ? Number(compareAtPrice) : undefined,
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: lowStockThreshold !== '' ? Number(lowStockThreshold) : undefined,
      weight: weight !== '' ? Number(weight) : undefined,
      brandId: brandId || undefined,
      categoryIds,
      status,
      thumbnailMediaId: thumbnailMediaId || undefined,
      galleryMediaIds,
    };

    try {
      if (editProduct) {
        await updateMutation.mutateAsync({ id: editProduct.id, payload });
        toast.success(`Simple product "${name}" updated successfully!`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Simple product "${name}" created successfully!`);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save simple product.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editProduct ? 'Edit Simple Product' : 'Create Simple Product'}
              </h2>
              <p className="text-xs text-slate-500">Sectional simple product configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sectional Tabs Header */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('info')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'info' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Info className="w-3.5 h-3.5" /> 1. Basic Info
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('taxonomy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'taxonomy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> 2. Brand & Categories
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('pricing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'pricing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> 3. Pricing & Inventory
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('media')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'media' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> 4. Media
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Basic Information */}
          {activeSection === 'info' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wireless Noise-Canceling Headphones"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. AUD-HP-001"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custom Slug (Optional)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Auto-generated if left empty"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product details and specifications..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Section 2: Brand & Categories */}
          {activeSection === 'taxonomy' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="">No Brand Selected</option>
                  {brandsData?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Categories *</label>
                <div className="max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
                  {categoriesData?.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white rounded-lg">
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-slate-800">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Pricing & Inventory */}
          {activeSection === 'pricing' && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Pricing & Stock Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regular Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="99.99"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sale / Compare Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="120.00"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="10"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="5"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.5"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Media */}
          {activeSection === 'media' && (
            <div className="p-3 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Primary Thumbnail & Gallery Media</h3>
                  <p className="text-[11px] text-slate-500">Select images from your Media Asset Library:</p>
                </div>

                {/* Folder Directory Selector */}
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 text-xs focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="">All Media Directories</option>
                  <option value="root">Root Directory</option>
                  {foldersTree?.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name} ({f.mediaCount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-white">
                {mediaData?.map((m) => {
                  const isThumb = thumbnailMediaId === m.id;
                  const isGallery = galleryMediaIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`relative rounded-xl border-2 overflow-hidden aspect-square cursor-pointer transition-all ${
                        isThumb
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                          : isGallery
                          ? 'border-sky-500 ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                      onClick={() => {
                        if (!thumbnailMediaId) {
                          setThumbnailMediaId(m.id);
                        } else if (thumbnailMediaId === m.id) {
                          setThumbnailMediaId('');
                        } else {
                          handleGalleryToggle(m.id);
                        }
                      }}
                    >
                      <img src={m.thumbnailUrl || m.url} alt={m.originalName} className="w-full h-full object-cover" />
                      {isThumb && (
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-sm">
                          Thumb
                        </span>
                      )}
                      {isGallery && (
                        <span className="absolute top-1 right-1 bg-sky-600 text-white text-[8px] font-bold px-1 rounded-sm">
                          Gallery
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <div className="flex gap-1 text-slate-400 font-bold text-[11px]">
              Step: {activeSection.toUpperCase()}
            </div>

            <div className="flex gap-2">
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
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editProduct ? 'Save Changes' : 'Save Simple Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
