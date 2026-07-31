'use client';

import React, { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useUploadMediaMultiple } from '../hooks/useMedia';
import { toast } from '@/lib/toast';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string | null;
}

export function UploadMediaModal({ isOpen, onClose, folderId }: UploadMediaModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const uploadMutation = useUploadMediaMultiple();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    try {
      await uploadMutation.mutateAsync({ files: selectedFiles, folderId });
      toast.success(`${selectedFiles.length} asset(s) uploaded successfully!`);
      setSelectedFiles([]);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload media files.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Upload Media Assets</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*,video/mp4,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload-input"
          />
          <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Click to upload or drag files here</p>
              <p className="text-[11px] text-slate-500 mt-0.5">JPEG, PNG, WEBP, GIF, PDF, MP4 up to 10MB each</p>
            </div>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            <p className="text-xs font-bold text-slate-700">{selectedFiles.length} file(s) selected:</p>
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-100/70 border border-slate-200/60">
                <span className="truncate font-semibold text-slate-800">{file.name}</span>
                <span className="text-[10px] text-slate-500 font-bold ml-2">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploadMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 disabled:opacity-50 transition-colors"
          >
            {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Upload Assets
          </button>
        </div>
      </div>
    </div>
  );
}
