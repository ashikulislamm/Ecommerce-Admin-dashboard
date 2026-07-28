import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Package,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  BarChart3,
  Server,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header / Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-emerald-900/10">
              A
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Apex ERP</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Enterprise v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm shadow-emerald-900/10 transition-all hover:shadow-md"
            >
              Access Admin Panel <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Next-Generation Enterprise Resource Planning</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Modern E-Commerce Admin &{' '}
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-600 bg-clip-text text-transparent">
              Security Governance
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            A comprehensive, clean ERP suite built for enterprise catalog management, granular
            Role-Based Access Control (RBAC), and user session security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-900/15 transition-all hover:scale-[1.02]"
            >
              Sign In to ERP Software <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 font-extrabold text-sm shadow-xs transition-all"
            >
              Explore Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-16 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Module Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Architected for high throughput, modular control, and uncompromising security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">RBAC Matrix</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Granular module-action permissions with real-time role mapping and instant privilege updates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">User Governance</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Manage user accounts, enforce activation status, and trigger automatic refresh session revocation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Product Catalog</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Organize e-commerce inventory, manage categories, and handle pricing and stock status.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Real-Time Metrics</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Monitor system health, active sessions, and core operation metrics in a clean unified dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Specifications */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">System Performance & Security</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Built with industry-standard patterns for security and high responsiveness.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shrink-0"
            >
              Login to Admin ERP
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-slate-900">JWT Session Security</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Dual-token authentication with automatic rotation</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-lime-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-slate-900">TanStack Query Caching</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Instant UI revalidation and optimal client state</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-slate-900">PostgreSQL Database</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">ACID transactional integrity via Prisma ORM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200/80 py-8 px-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="font-extrabold text-slate-900">Apex Admin ERP</span>
          </div>
          <p>© {new Date().getFullYear()} Enterprise Ecommerce Admin System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}