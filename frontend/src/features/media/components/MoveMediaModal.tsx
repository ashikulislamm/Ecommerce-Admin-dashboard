import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Folder, HardDrive, ArrowRightLeft } from 'lucide-react';
import type { MediaFolderTreeNode } from '../types/media-folder.types';

interface MoveMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMediaIds: string[];
  tree: MediaFolderTreeNode[];
  onSubmit: (targetFolderId: string | null) => Promise<void>;
  isMoving: boolean;
}

function FlattenFolderSelect({
  nodes,
  depth = 0,
  targetFolderId,
  onSelect,
}: {
  nodes: MediaFolderTreeNode[];
  depth?: number;
  targetFolderId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <>
      {nodes.map((node) => (
        <React.Fragment key={node.id}>
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
              targetFolderId === node.id
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            style={{ marginLeft: `${depth * 16}px` }}
            onClick={() => onSelect(node.id)}
          >
            <div className="flex items-center gap-2 truncate">
              <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">{node.name}</span>
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <FlattenFolderSelect
              nodes={node.children}
              depth={depth + 1}
              targetFolderId={targetFolderId}
              onSelect={onSelect}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
}

export function MoveMediaModal({
  isOpen,
  onClose,
  selectedMediaIds,
  tree,
  onSubmit,
  isMoving,
}: MoveMediaModalProps) {
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(targetFolderId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl border border-sky-200">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Move {selectedMediaIds.length} Media File(s)</DialogTitle>
              <DialogDescription>
                Select a target directory folder to move your selected media files.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            <div
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                targetFolderId === null
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setTargetFolderId(null)}
            >
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-700" />
                <span>Root Directory (No Folder)</span>
              </div>
            </div>

            <FlattenFolderSelect
              nodes={tree}
              targetFolderId={targetFolderId}
              onSelect={setTargetFolderId}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isMoving}>
              Move Files
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
