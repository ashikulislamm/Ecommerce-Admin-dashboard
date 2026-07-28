'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials or connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSeedLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await login('admin@example.com', 'Admin123!');
      router.replace('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl shadow-slate-200/60 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm mb-1">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Apex ERP Portal
        </h1>
        <p className="text-xs font-medium text-slate-500">
          Sign in to access your enterprise admin dashboard
        </p>
      </div>

      {/* Quick 1-Click Login Option */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-slate-700 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Demo Super Admin Sign In</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          Sign in automatically using pre-configured Super Admin credentials (`admin@example.com`).
        </p>
        <button
          type="button"
          onClick={handleQuickSeedLogin}
          disabled={isLoading}
          className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign In as Super Admin'}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors font-mono"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            'Signing in...'
          ) : (
            <>
              <LogIn className="w-4 h-4" /> Sign In with Credentials
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center border-t border-slate-100">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home Page
        </Link>
      </div>
    </div>
  );
}