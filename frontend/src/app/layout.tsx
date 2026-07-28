import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import QueryProvider from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Ecommerce Admin ERP Dashboard',
  description: 'Clean, modern ERP admin dashboard with RBAC and User Management.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}