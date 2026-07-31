import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Trash2, HardDrive } from 'lucide-react';
import type { MediaFolderTreeNode } from '../types/media-folder.types';

interface FolderTreeSidebarProps {
  tree: MediaFolderTreeNode[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateSubfolder: (parentFolderId: string | null) => void;
  onDeleteFolder: (folder: MediaFolderTreeNode) => void;
}

interface TreeNodeItemProps {
  node: MediaFolderTreeNode;
  depth?: number;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateSubfolder: (parentFolderId: string | null) => void;
  onDeleteFolder: (folder: MediaFolderTreeNode) => void;
}

function TreeNodeItem({
  node,
  depth = 0,
  selectedFolderId,
  onSelectFolder,
  onCreateSubfolder,
  onDeleteFolder,
}: TreeNodeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedFolderId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`group flex items-center justify-between py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          isSelected
            ? 'bg-emerald-50 text-emerald-900 font-extrabold border border-emerald-200/80 shadow-2xs'
            : 'text-slate-700 hover:bg-slate-100/80'
        }`}
        style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
        onClick={() => onSelectFolder(node.id)}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              className="p-0.5 rounded-md hover:bg-slate-200/60 text-slate-500"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          {isSelected || isOpen ? (
            <FolderOpen className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
          )}

          <span className="truncate">{node.name}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-medium">
            {node.mediaCount}
          </span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            type="button"
            title="Add subfolder"
            className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/60"
            onClick={(e) => {
              e.stopPropagation();
              onCreateSubfolder(node.id);
            }}
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Delete folder"
            className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-100/60"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder(node);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onCreateSubfolder={onCreateSubfolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTreeSidebar({
  tree,
  selectedFolderId,
  onSelectFolder,
  onCreateSubfolder,
  onDeleteFolder,
}: FolderTreeSidebarProps) {
  const isRootSelected = selectedFolderId === null || selectedFolderId === 'all';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Media Directory</h3>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-all"
          onClick={() => onCreateSubfolder(null)}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      <div className="space-y-1">
        {/* All Files (Root) */}
        <div
          className={`flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            isRootSelected
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          onClick={() => onSelectFolder(null)}
        >
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            <span>All Media Files</span>
          </div>
        </div>

        {/* Tree Directory */}
        <div className="pt-2 space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
          {tree.length === 0 ? (
            <p className="text-[11px] text-slate-400 p-2 text-center italic">No subfolders created yet.</p>
          ) : (
            tree.map((node) => (
              <TreeNodeItem
                key={node.id}
                node={node}
                selectedFolderId={selectedFolderId}
                onSelectFolder={onSelectFolder}
                onCreateSubfolder={onCreateSubfolder}
                onDeleteFolder={onDeleteFolder}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
