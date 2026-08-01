'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Building2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email address or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@example.com');
    setPassword('Admin123!');
    setErrorMsg(null);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Soft Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.4) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Main Card Container */}
        <div className="bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/70 rounded-3xl p-8 sm:p-10 space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white mx-auto flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-emerald-900/15">
              A
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Ecommerce Admin Dashboard
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Sign in to your enterprise management portal
              </p>
            </div>
          </div>

          {/* Quick Demo Seed Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Demo Credentials Available
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Super Admin
              </span>
            </div>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200 text-emerald-900 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              Fill Super Admin Credentials
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">Password</label>
                <a href="#" className="text-[11px] font-bold text-emerald-700 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating Session...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Sign In
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}