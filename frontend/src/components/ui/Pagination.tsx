import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export interface PaginationMeta {
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
}

export interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export function Pagination({ meta, onPageChange, itemName = 'items' }: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 font-medium">
      <div>
        Showing page <span className="font-bold text-slate-900">{meta.page}</span> of{' '}
        <span className="font-bold text-slate-900">{meta.totalPages}</span>
        {meta.total !== undefined && (
          <span> ({meta.total} total {itemName})</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(Math.max(meta.page - 1, 1))}
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
