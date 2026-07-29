'use client';

import React, { useState } from 'react';
import type { CategoryItem } from '../types/category.types';
import { ChevronRight, ChevronDown, Folder, Plus, Edit2, Trash2 } from 'lucide-react';

interface CategoryTreeViewProps {
  categories: CategoryItem[];
  onAddSub: (category: CategoryItem) => void;
  onEdit: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
}

interface TreeNodeProps {
  node: CategoryItem;
  level: number;
  onAddSub: (category: CategoryItem) => void;
  onEdit: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
}

function CategoryTreeNodeItem({ node, level, onAddSub, onEdit, onDelete }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 transition-all"
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
          {hasChildren ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <ChevronDown className="w-4 h-4 text-emerald-700" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <Folder className="w-4 h-4 text-emerald-700" />

          <span className="text-slate-900">{node.name}</span>
          <span className="text-[10px] font-mono text-slate-400 font-normal">({node.slug})</span>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              node.status === 'ACTIVE'
                ? 'bg-emerald-100/70 text-emerald-800 border border-emerald-200/50'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {node.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddSub(node)}
            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100/70 transition-colors"
            title="Add Subcategory"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-1">
          {node.children!.map((child) => (
            <CategoryTreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onAddSub={onAddSub}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTreeView({ categories, onAddSub, onEdit, onDelete }: CategoryTreeViewProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
        <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Categories Found</h3>
        <p className="text-xs text-slate-500 mt-1">Create your first category to start organizing products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <CategoryTreeNodeItem
          key={cat.id}
          node={cat}
          level={0}
          onAddSub={onAddSub}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
