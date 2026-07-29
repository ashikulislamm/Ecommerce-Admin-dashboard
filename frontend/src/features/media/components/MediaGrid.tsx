'use client';

import React from 'react';
import type { MediaItem } from '../types/media.types';
import { Image as ImageIcon, FileText, Video, Trash2, Edit2, ExternalLink } from 'lucide-react';

interface MediaGridProps {
  mediaList: MediaItem[];
  isLoading: boolean;
  onEdit: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
}

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost:3000')) {
    return envUrl.replace('/api/v1', '');
  }
  return 'http://localhost:8080';
};

export function MediaGrid({ mediaList, isLoading, onEdit, onDelete }: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-44 w-full animate-pulse rounded-2xl bg-white border border-slate-200" />
        ))}
      </div>
    );
  }

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Media Assets Found</h3>
        <p className="text-xs text-slate-500 mt-1">Upload images, videos, or documents to build your asset library.</p>
      </div>
    );
  }

  const backendHost = getApiBaseUrl();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {mediaList.map((item) => {
        const fullUrl = item.url?.startsWith('http') ? item.url : `${backendHost}${item.url}`;
        const thumbUrl = item.thumbnailUrl
          ? item.thumbnailUrl.startsWith('http')
            ? item.thumbnailUrl
            : `${backendHost}${item.thumbnailUrl}`
          : fullUrl;

        return (
          <div
            key={item.id}
            className="group rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Thumbnail Preview */}
            <div className="relative h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
              {item.mediaType === 'IMAGE' ? (
                <img
                  src={thumbUrl}
                  alt={item.altText || item.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : item.mediaType === 'VIDEO' ? (
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <Video className="w-8 h-8 text-emerald-700" />
                  <span className="text-[10px] font-bold uppercase">Video</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <FileText className="w-8 h-8 text-emerald-700" />
                  <span className="text-[10px] font-bold uppercase">Document</span>
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white/90 text-slate-800 hover:text-emerald-700 transition-colors shadow-xs"
                  title="View Full Asset"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 rounded-xl bg-white/90 text-slate-800 hover:text-emerald-700 transition-colors shadow-xs"
                  title="Edit Metadata"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="p-2 rounded-xl bg-white/90 text-rose-600 hover:bg-rose-50 transition-colors shadow-xs"
                  title="Delete Asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3 text-xs space-y-1 bg-white">
              <p className="font-bold text-slate-900 truncate" title={item.originalName}>
                {item.title || item.originalName}
              </p>
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                <span>{(item.fileSize / 1024).toFixed(1)} KB</span>
                {item.width && item.height && (
                  <span>
                    {item.width}x{item.height}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
