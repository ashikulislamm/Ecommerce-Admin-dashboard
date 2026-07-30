import React from 'react';
import { LucideIcon, PackageX } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon = PackageX,
  action,
}: EmptyStateProps) {
  return (
    <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
      <div className="p-3.5 rounded-2xl bg-slate-100/80 text-slate-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
      {description && <p className="text-xs text-slate-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
