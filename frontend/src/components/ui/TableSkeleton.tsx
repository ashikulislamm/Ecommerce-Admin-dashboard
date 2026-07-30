import React from 'react';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="animate-pulse">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="p-4">
              <div className="h-4 bg-slate-200/70 rounded-md w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
