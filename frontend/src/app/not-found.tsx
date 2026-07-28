import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="inline-flex p-4 rounded-2xl bg-rose-950/60 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">404</h1>
        <h2 className="text-lg font-semibold text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested page could not be found or has been moved.
        </p>
        <div className="pt-4">
          <Link
            href="/permissions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/40"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Permissions
          </Link>
        </div>
      </div>
    </div>
  );
}