import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex items-center justify-center antialiased font-sans">
      <main className="w-full min-h-screen flex items-center justify-center">{children}</main>
    </div>
  );
}
