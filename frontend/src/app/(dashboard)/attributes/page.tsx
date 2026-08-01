'use client';

import React, { useState } from 'react';
import { useAttributes, useDeleteAttribute } from '@/features/attributes/hooks/useAttributes';
import { CreateAttributeModal } from '@/features/attributes/components/CreateAttributeModal';
import { AttributeValueModal } from '@/features/attributes/components/AttributeValueModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Plus, Search, Filter, RefreshCw, Sliders, Edit2, Trash2, Settings2 } from 'lucide-react';
import type { AttributeItem, AttributeType } from '@/features/attributes/types/attribute.types';

export default function AttributesPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<AttributeType | ''>('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<AttributeItem | null>(null);
  const [managingValueAttribute, setManagingValueAttribute] = useState<AttributeItem | null>(null);
  const [deletingAttribute, setDeletingAttribute] = useState<AttributeItem | null>(null);

  const canRead = hasPermission('attributes:read');

  const { data, isLoading, refetch } = useAttributes({
    page,
    limit: 20,
    search: search || undefined,
    type: (type as AttributeType) || undefined,
  });

  const deleteMutation = useDeleteAttribute();

  const handleOpenCreate = () => {
    setEditingAttribute(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (attr: AttributeItem) => {
    setEditingAttribute(attr);
    setIsCreateOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAttribute) return;
    try {
      await deleteMutation.mutateAsync(deletingAttribute.id);
      toast.success(`Attribute "${deletingAttribute.name}" deleted successfully.`);
      setDeletingAttribute(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete attribute. Attributes used in product variants cannot be deleted.');
      setDeletingAttribute(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access Product Attributes." />;
  }

  return (
    <div className="space-y-6">
      {/* Unified Page Header */}
      <PageHeader
        title="Product Attributes & Values"
        description="Configure variant options (Color, Size, Material) and custom display swatches."
        icon={Sliders}
        action={
          <PermissionGate permission="attributes:create">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Attribute
            </button>
          </PermissionGate>
        }
      />

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search attributes by name or slug..."
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
              value={type}
              onChange={(e) => {
                setType(e.target.value as AttributeType | '');
                setPage(1);
              }}
              className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 appearance-none"
            >
              <option value="">All Display Types</option>
              <option value="DROPDOWN">Dropdown</option>
              <option value="RADIO">Radio</option>
              <option value="CHECKBOX">Checkbox</option>
              <option value="COLOR_SWATCH">Color Swatch</option>
              <option value="IMAGE_SWATCH">Image Swatch</option>
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

      {/* Attribute Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Attribute Name</th>
                <th className="p-3.5">Display Type</th>
                <th className="p-3.5">Defined Values</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="p-4 text-center text-slate-400">Loading attributes...</td>
                  </tr>
                ))
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    <Sliders className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No Attributes Found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "Create Attribute" to define custom variant attributes.</p>
                  </td>
                </tr>
              ) : (
                data.map((attr) => (
                  <tr key={attr.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{attr.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal">{attr.slug}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-200/50">
                        {attr.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {attr.values && attr.values.length > 0 ? (
                          attr.values.map((v) => (
                            <span
                              key={v.id}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-semibold flex items-center gap-1 border border-slate-200/60"
                            >
                              {v.displayColor && (
                                <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: v.displayColor }} />
                              )}
                              {v.value}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No values configured</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setManagingValueAttribute(attr)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1"
                      >
                        <Settings2 className="w-3.5 h-3.5" /> Manage Values
                      </button>
                      <button onClick={() => handleEdit(attr)} className="text-slate-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => setDeletingAttribute(attr)} className="text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1">
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

      {/* Attribute Create/Edit Modal */}
      <CreateAttributeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        editAttribute={editingAttribute}
      />

      {/* Attribute Values Modal */}
      <AttributeValueModal
        isOpen={!!managingValueAttribute}
        onClose={() => setManagingValueAttribute(null)}
        attribute={managingValueAttribute}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingAttribute}
        title="Delete Product Attribute"
        description="Are you sure you want to delete this attribute? Attributes used in product variants cannot be deleted."
        itemName={deletingAttribute?.name}
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingAttribute(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}