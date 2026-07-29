'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Layers, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { useCreateVariableProduct, useGenerateVariantMatrix } from '../hooks/useProducts';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useAttributes } from '@/features/attributes/hooks/useAttributes';
import type { ProductItem, ProductStatus, CreateVariantPayload } from '../types/product.types';
import { toast } from '@/lib/toast';

interface CreateVariableProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateVariableProductModal({
  isOpen,
  onClose,
}: CreateVariableProductModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [status, setStatus] = useState<ProductStatus>('DRAFT');

  // Attribute selection for matrix generation
  // Map of attributeId -> array of selected attributeValueIds
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<string, string[]>>({});

  // Step 2 states: Variants generated matrix
  const [generatedVariants, setGeneratedVariants] = useState<CreateVariantPayload[]>([]);

  const { data: brandsData } = useBrands({ page: 1, limit: 100 });
  const { data: categoriesData } = useCategories({ page: 1, limit: 100 });
  const { data: attributesData } = useAttributes({ page: 1, limit: 100 });

  const createVariableMutation = useCreateVariableProduct();
  const generateMatrixMutation = useGenerateVariantMatrix();

  if (!isOpen) return null;

  const handleCategoryToggle = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleValueToggle = (attributeId: string, valueId: string) => {
    setSelectedAttributeValues((prev) => {
      const current = prev[attributeId] || [];
      const updated = current.includes(valueId)
        ? current.filter((v) => v !== valueId)
        : [...current, valueId];
      return { ...prev, [attributeId]: updated };
    });
  };

  const handleGenerateMatrix = async () => {
    if (!name.trim()) {
      toast.error('Product name is required before generating variants.');
      return;
    }
    if (!sku.trim()) {
      toast.error('Product base SKU is required before generating variants.');
      return;
    }

    const groupedIds = Object.values(selectedAttributeValues).filter((arr) => arr.length > 0);
    if (groupedIds.length === 0) {
      toast.error('Select at least one attribute and value option to generate variants matrix.');
      return;
    }

    try {
      const drafts = await generateMatrixMutation.mutateAsync({
        attributeValueIdsGrouped: groupedIds,
        baseSku: sku.trim(),
      });

      // Convert drafts to editable variant payloads with default values
      const initialVariants: CreateVariantPayload[] = drafts.map((d) => ({
        sku: d.suggestedSku,
        price: 0,
        compareAtPrice: undefined,
        stockQuantity: 10,
        lowStockThreshold: 5,
        status: 'ACTIVE',
        attributeValueIds: d.attributeValueIds,
      }));

      setGeneratedVariants(initialVariants);
      setStep(2);
      toast.success(`Generated ${initialVariants.length} variant combinations!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate variant matrix.');
    }
  };

  const handleVariantChange = (index: number, field: keyof CreateVariantPayload, value: any) => {
    setGeneratedVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setGeneratedVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    if (categoryIds.length === 0) {
      toast.error('Select at least one category for the product.');
      return;
    }

    if (generatedVariants.length === 0) {
      toast.error('At least one variant combination is required for a variable product.');
      return;
    }

    // Validate prices and SKUs
    for (let i = 0; i < generatedVariants.length; i++) {
      const v = generatedVariants[i];
      if (!v.sku.trim()) {
        toast.error(`Variant #${i + 1} is missing a SKU.`);
        return;
      }
      if (v.price < 0) {
        toast.error(`Variant SKU "${v.sku}" has a negative price.`);
        return;
      }
      if (v.stockQuantity < 0) {
        toast.error(`Variant SKU "${v.sku}" has a negative stock.`);
        return;
      }
    }

    const payload = {
      name,
      sku,
      slug: slug || undefined,
      description: description || undefined,
      brandId: brandId || undefined,
      categoryIds,
      status,
      variants: generatedVariants,
    };

    try {
      await createVariableMutation.mutateAsync(payload);
      toast.success(`Variable product "${name}" with ${generatedVariants.length} variants created successfully!`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create variable product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Variable Product</h2>
              <p className="text-xs text-slate-500">Configure multi-attribute variant matrix (Color, Size, Material)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  step === 1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                1. Info & Attributes
              </button>
              <button
                type="button"
                onClick={() => {
                  if (generatedVariants.length > 0) setStep(2);
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  step === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'
                }`}
              >
                2. Variant Matrix ({generatedVariants.length})
              </button>
            </div>

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 1: Base Information & Attribute Selector */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Classic Cotton Crewneck T-Shirt"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Base Product SKU *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. TS-CREW"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-hidden focus:border-emerald-500"
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
                <div className="max-h-24 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
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

            {/* Select Attributes for Matrix */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Select Variant Attributes & Options
                  </h3>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Check options below to generate all Cartesian combinations automatically (e.g., Red/Blue x S/M/L).
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {attributesData?.map((attr) => {
                  const selectedVals = selectedAttributeValues[attr.id] || [];
                  return (
                    <div key={attr.id} className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{attr.name}</span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          {attr.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {attr.values?.map((v) => {
                          const isChecked = selectedVals.includes(v.id);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleValueToggle(attr.id, v.id)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isChecked
                                  ? 'bg-purple-700 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {v.displayColor && (
                                <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: v.displayColor }} />
                              )}
                              {v.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateMatrix}
                disabled={generateMatrixMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-xs transition-all disabled:opacity-50"
              >
                {generateMatrixMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Matrix & Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interactive Variant Matrix Grid */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900">Review & Edit Generated Variants</h3>
                <p className="text-[11px] text-slate-500">
                  {generatedVariants.length} combinations generated. Set price, stock, or remove unwanted variants.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                ← Edit Attribute Selection
              </button>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Variant SKU *</th>
                    <th className="p-3">Price ($) *</th>
                    <th className="p-3">Sale Price ($)</th>
                    <th className="p-3">Stock *</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generatedVariants.map((variant, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-400">{idx + 1}</td>

                      <td className="p-3">
                        <input
                          type="text"
                          required
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                          className="w-36 p-1.5 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:border-purple-600"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={variant.price || ''}
                          onChange={(e) =>
                            handleVariantChange(idx, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))
                          }
                          placeholder="0.00"
                          className="w-24 p-1.5 rounded-lg border border-slate-200 font-bold text-xs focus:outline-hidden focus:border-purple-600"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.compareAtPrice || ''}
                          onChange={(e) =>
                            handleVariantChange(
                              idx,
                              'compareAtPrice',
                              e.target.value === '' ? undefined : parseFloat(e.target.value),
                            )
                          }
                          placeholder="Optional"
                          className="w-24 p-1.5 rounded-lg border border-slate-200 font-bold text-xs focus:outline-hidden focus:border-purple-600"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          required
                          value={variant.stockQuantity}
                          onChange={(e) =>
                            handleVariantChange(idx, 'stockQuantity', parseInt(e.target.value || '0', 10))
                          }
                          className="w-20 p-1.5 rounded-lg border border-slate-200 font-bold text-xs focus:outline-hidden focus:border-purple-600"
                        />
                      </td>

                      <td className="p-3">
                        <select
                          value={variant.status}
                          onChange={(e) => handleVariantChange(idx, 'status', e.target.value)}
                          className="p-1.5 rounded-lg border border-slate-200 text-xs"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Remove combination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={createVariableMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-xs transition-all disabled:opacity-50"
              >
                {createVariableMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Save Variable Product ({generatedVariants.length} Variants)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
