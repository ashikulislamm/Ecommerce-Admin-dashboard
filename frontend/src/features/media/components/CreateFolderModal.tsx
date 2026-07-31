import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus } from 'lucide-react';
import type { MediaFolderTreeNode } from '../types/media-folder.types';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentFolderId: string | null;
  tree: MediaFolderTreeNode[];
  onSubmit: (name: string, parentFolderId: string | null) => Promise<void>;
  isCreating: boolean;
}

export function CreateFolderModal({
  isOpen,
  onClose,
  parentFolderId,
  onSubmit,
  isCreating,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    await onSubmit(folderName.trim(), parentFolderId);
    setFolderName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>{parentFolderId ? 'Create Subfolder' : 'Create Root Folder'}</DialogTitle>
              <DialogDescription>
                {parentFolderId
                  ? 'Organize images inside this parent folder.'
                  : 'Add a new directory at the root level of the media library.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5 text-xs font-bold text-slate-700">
            <label htmlFor="folder-name-input" className="block">Folder Name *</label>
            <Input
              id="folder-name-input"
              placeholder="e.g. Smartwatch, Apple, Banner Ads..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isCreating}>
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
