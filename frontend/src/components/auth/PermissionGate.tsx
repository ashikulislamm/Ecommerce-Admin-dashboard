'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { ShieldAlert } from 'lucide-react';

interface PermissionGateProps {
  permission?: string;
  permissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  children,
  fallback,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = useAuth();

  let isAllowed = true;
  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    isAllowed = hasAnyPermission(permissions);
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return null;
}

export function PermissionDeniedBanner({ message = 'Access Denied: You do not have permission to view or perform actions on this resource.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-900 text-center space-y-2 my-4">
      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-amber-900">Permission Restricted</h3>
      <p className="text-xs text-amber-700 max-w-md">{message}</p>
    </div>
  );
}
