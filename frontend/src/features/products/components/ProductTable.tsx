'use client';

import React from 'react';
import type { ProductItem } from '../types/product.types';
import { Package, Edit2, Trash2, Tag, Layers, ImageIcon } from 'lucide-react';

interface ProductTableProps {
  products: ProductItem[];
  isLoading: boolean;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
}

export function ProductTable({ products, isLoading, onEdit, onDelete }: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4 bg-white rounded-2xl border border-slate-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs">
        <Package className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Products Found</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          No products match your current search query or filter selection. Click "Create Simple Product" or "Create Variable Product" to start building your catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3.5">Product</th>
              <th className="p-3.5">SKU</th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5">Brand & Categories</th>
              <th className="p-3.5">Price / Range</th>
              <th className="p-3.5">Total Stock</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              // Calculate thumbnail URL
              const primaryMedia = product.productMedia?.find((pm) => pm.isPrimary)?.media;
              const thumbUrl = primaryMedia?.thumbnailUrl || primaryMedia?.url;

              // Calculate price range
              const prices = product.variants?.map((v) => Number(v.price)) || [];
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
              const priceDisplay =
                minPrice === maxPrice
                  ? `$${minPrice.toFixed(2)}`
                  : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;

              // Calculate total stock
              const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0;

              return (
                <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Thumbnail & Name */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                        {thumbUrl ? (
                          <img src={thumbUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{product.name}</h4>
                        <p className="text-[10px] font-mono text-slate-400 truncate">{product.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="p-3.5 font-mono text-slate-700 font-bold">{product.sku}</td>

                  {/* Type */}
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        product.productType === 'SIMPLE'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {product.productType}
                    </span>
                  </td>

                  {/* Brand & Categories */}
                  <td className="p-3.5">
                    <div className="space-y-1">
                      {product.brand ? (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200">
                          {product.brand.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No Brand</span>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {product.productCategories?.map((pc) => (
                          <span
                            key={pc.id}
                            className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[9px] font-semibold border border-emerald-200/50"
                          >
                            {pc.category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-3.5 font-bold text-slate-900">{priceDisplay}</td>

                  {/* Stock */}
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        totalStock > 5
                          ? 'bg-emerald-100 text-emerald-800'
                          : totalStock > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {totalStock} in stock
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        product.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : product.status === 'DRAFT'
                          ? 'bg-slate-100 text-slate-600'
                          : product.status === 'INACTIVE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-slate-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
