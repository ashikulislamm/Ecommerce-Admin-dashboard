'use client';

import React, { useState } from 'react';
import { useMedia, useDeleteMedia, useUpdateMedia } from '@/features/media/hooks/useMedia';
import { useMediaFolders } from '@/features/media/hooks/useMediaFolders';
import { MediaGrid } from '@/features/media/components/MediaGrid';
import { FolderTreeSidebar } from '@/features/media/components/FolderTreeSidebar';
import { CreateFolderModal } from '@/features/media/components/CreateFolderModal';
import { MoveMediaModal } from '@/features/media/components/MoveMediaModal';
import { UploadMediaModal } from '@/features/media/components/UploadMediaModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { PermissionGate, PermissionDeniedBanner } from '@/components/auth/PermissionGate';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Upload, Search, Filter, RefreshCw, X, Loader2, ArrowRightLeft, FolderPlus, Image as ImageIcon } from 'lucide-react';
import type { MediaItem, MediaType } from '@/features/media/types/media.types';
import type { MediaFolderTreeNode } from '@/features/media/types/media-folder.types';

export default function MediaPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [mediaType, setMediaType] = useState<MediaType | ''>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [parentFolderIdForCreate, setParentFolderIdForCreate] = useState<string | null>(null);
  const [isMoveMediaOpen, setIsMoveMediaOpen] = useState(false);
  const [selectedMediaForMove, setSelectedMediaForMove] = useState<string[]>([]);

  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<MediaFolderTreeNode | null>(null);

  const canRead = hasPermission('media:read');

  const {
    folderTree,
    createFolder,
    isCreating: isCreatingFolder,
    deleteFolder,
    isDeleting: isDeletingFolder,
    moveMedia,
    isMoving: isMovingMedia,
  } = useMediaFolders();

  const { data, isLoading, refetch } = useMedia({
    page,
    limit: 20,
    search: search || undefined,
    mediaType: (mediaType as MediaType) || undefined,
    folderId: selectedFolderId || undefined,
  });

  const deleteMutation = useDeleteMedia();
  const updateMutation = useUpdateMedia();

  const handleOpenCreateFolder = (parentId: string | null) => {
    setParentFolderIdForCreate(parentId);
    setIsCreateFolderOpen(true);
  };

  const handleCreateFolderSubmit = async (name: string, parentId: string | null) => {
    await createFolder({ name, parentId });
  };

  const handleDeleteFolderConfirm = async () => {
    if (!deletingFolder) return;
    try {
      await deleteFolder(deletingFolder.id);
      if (selectedFolderId === deletingFolder.id) {
        setSelectedFolderId(null);
      }
      setDeletingFolder(null);
    } catch (err: any) {
      setDeletingFolder(null);
    }
  };

  const handleOpenMoveMedia = (mediaItem: MediaItem) => {
    setSelectedMediaForMove([mediaItem.id]);
    setIsMoveMediaOpen(true);
  };

  const handleMoveMediaSubmit = async (targetFolderId: string | null) => {
    await moveMedia({ mediaIds: selectedMediaForMove, targetFolderId });
  };

  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditAltText(item.altText || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        payload: { title: editTitle, altText: editAltText },
      });
      toast.success(`Metadata for "${editingItem.originalName}" updated successfully!`);
      setEditingItem(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update metadata.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      toast.success(`Asset "${deletingItem.originalName}" deleted successfully.`);
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete asset. It may be attached to existing catalog items.');
      setDeletingItem(null);
    }
  };

  if (!canRead) {
    return <PermissionDeniedBanner message="You do not have permission to access Media Assets Library." />;
  }

  return (
    <div className="space-y-6">
      {/* Unified Page Header */}
      <PageHeader
        title="Media Assets & Folder System"
        description="Organize photos in nested directories (e.g. Gadgets → Smartwatch → Apple) and manage catalog assets."
        icon={ImageIcon}
        action={
          <div className="flex items-center gap-2">
            <PermissionGate permission="media:create">
              <button
                onClick={() => handleOpenCreateFolder(selectedFolderId)}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
              >
                <FolderPlus className="w-4 h-4 text-amber-500" />
                New Folder
              </button>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Assets
              </button>
            </PermissionGate>
          </div>
        }
      />

      {/* Main Layout Grid with Folder Tree Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column — Folder Tree Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <FolderTreeSidebar
            tree={folderTree}
            selectedFolderId={selectedFolderId}
            onSelectFolder={(folderId) => {
              setSelectedFolderId(folderId);
              setPage(1);
            }}
            onCreateSubfolder={handleOpenCreateFolder}
            onDeleteFolder={(folder) => setDeletingFolder(folder)}
          />
        </div>

        {/* Right Column — Media Grid & Search Toolbar */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assets by filename or title..."
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
                  value={mediaType}
                  onChange={(e) => {
                    setMediaType(e.target.value as MediaType | '');
                    setPage(1);
                  }}
                  className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500 appearance-none"
                >
                  <option value="">All Asset Types</option>
                  <option value="IMAGE">Images</option>
                  <option value="VIDEO">Videos</option>
                  <option value="DOCUMENT">Documents</option>
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

          {/* Media Grid */}
          <MediaGrid
            mediaList={data || []}
            isLoading={isLoading}
            onEdit={handleOpenEdit}
            onDelete={(item) => setDeletingItem(item)}
            onMove={handleOpenMoveMedia}
          />
        </div>
      </div>

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        parentFolderId={parentFolderIdForCreate}
        tree={folderTree}
        onSubmit={handleCreateFolderSubmit}
        isCreating={isCreatingFolder}
      />

      {/* Move Media Modal */}
      <MoveMediaModal
        isOpen={isMoveMediaOpen}
        onClose={() => setIsMoveMediaOpen(false)}
        selectedMediaIds={selectedMediaForMove}
        tree={folderTree}
        onSubmit={handleMoveMediaSubmit}
        isMoving={isMovingMedia}
      />

      {/* Upload Modal */}
      <UploadMediaModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folderId={selectedFolderId}
      />

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Edit Asset Metadata</h2>
              <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Asset Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter title..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Describe image..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 disabled:opacity-50"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Folder Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingFolder}
        title="Delete Folder?"
        description="Are you sure you want to delete this folder? Folders containing subfolders or media files cannot be deleted."
        itemName={deletingFolder?.name}
        isPending={isDeletingFolder}
        onClose={() => setDeletingFolder(null)}
        onConfirm={handleDeleteFolderConfirm}
      />

      {/* Confirm Delete Asset Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingItem}
        title="Delete Asset Permanently?"
        description="Are you sure you want to delete this media file? Physical storage files and thumbnails will be permanently purged if unused."
        itemName={deletingItem?.originalName}
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}