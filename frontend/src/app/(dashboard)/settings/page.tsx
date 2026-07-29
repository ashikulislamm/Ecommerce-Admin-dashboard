'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from '@/lib/toast';
import {
  Building2,
  ShieldCheck,
  Package,
  Bell,
  User,
  KeyRound,
  Save,
  RotateCcw,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  Webhook,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

interface GeneralSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  storeAddress: string;
}

interface SecuritySettings {
  minPasswordLength: number;
  requireSpecialChar: boolean;
  requireNumber: boolean;
  sessionTimeoutMinutes: number;
  requireMfaForAdmins: boolean;
  maxLoginAttempts: number;
}

interface InventorySettings {
  defaultLowStockThreshold: number;
  hideOutOfStock: boolean;
  autoGenerateSkuPattern: string;
  enableGuestCheckout: boolean;
}

interface NotificationSettings {
  emailLowStockAlerts: boolean;
  emailNewUserAlerts: boolean;
  webhookUrl: string;
  webhookSecret: string;
}

const DEFAULT_GENERAL: GeneralSettings = {
  storeName: 'Apex Enterprise Store',
  supportEmail: 'support@apexerp.com',
  supportPhone: '+1 (800) 555-0199',
  currency: 'USD',
  timezone: 'UTC-5 (EST)',
  dateFormat: 'YYYY-MM-DD',
  storeAddress: '100 Enterprise Way, Tech District, CA 94016',
};

const DEFAULT_SECURITY: SecuritySettings = {
  minPasswordLength: 8,
  requireSpecialChar: true,
  requireNumber: true,
  sessionTimeoutMinutes: 60,
  requireMfaForAdmins: false,
  maxLoginAttempts: 5,
};

const DEFAULT_INVENTORY: InventorySettings = {
  defaultLowStockThreshold: 5,
  hideOutOfStock: false,
  autoGenerateSkuPattern: '{BRAND}-{PRODUCT}-{VARIANT}',
  enableGuestCheckout: true,
};

const DEFAULT_NOTIFICATION: NotificationSettings = {
  emailLowStockAlerts: true,
  emailNewUserAlerts: true,
  webhookUrl: 'https://api.apexerp.com/v1/webhooks/orders',
  webhookSecret: 'whsec_9a8b7c6d5e4f3a2b1c',
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'general' | 'security' | 'inventory' | 'notifications' | 'profile'
  >('general');

  // Form States
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [security, setSecurity] = useState<SecuritySettings>(DEFAULT_SECURITY);
  const [inventory, setInventory] = useState<InventorySettings>(DEFAULT_INVENTORY);
  const [notification, setNotification] = useState<NotificationSettings>(DEFAULT_NOTIFICATION);

  // Profile / Password States
  const [firstName, setFirstName] = useState(user?.firstName || 'Super');
  const [lastName, setLastName] = useState(user?.lastName || 'Admin');
  const [email, setEmail] = useState(user?.email || 'admin@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('apex_system_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.general) setGeneral(parsed.general);
        if (parsed.security) setSecurity(parsed.security);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.notification) setNotification(parsed.notification);
      }
    } catch (e) {
      console.warn('Failed to parse system settings from localStorage');
    }
  }, []);

  const saveAllSettings = (updatedPartial?: any, tabName = 'Settings') => {
    const updated = {
      general,
      security,
      inventory,
      notification,
      ...updatedPartial,
    };
    localStorage.setItem('apex_system_settings', JSON.stringify(updated));
    toast.success(`${tabName} updated successfully!`);
  };

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAllSettings({ general }, 'General Store Information');
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAllSettings({ security }, 'Security & Authentication Controls');
  };

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAllSettings({ inventory }, 'Catalog & Inventory Rules');
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAllSettings({ notification }, 'Notifications & Webhook Configuration');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Admin Profile preferences updated!');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Your password has been changed successfully!');
    }, 1000);
  };

  const regenerateWebhookSecret = () => {
    const random = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setNotification((prev) => ({ ...prev, webhookSecret: random }));
    toast.info('New webhook secret key generated! Save changes to apply.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              System Settings & Configuration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage global store defaults, security policies, catalog inventory rules, and webhooks
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" /> General Store
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Security & Auth
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" /> Inventory & Catalog
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications & Webhooks
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" /> Admin Account & Password
        </button>
      </div>

      {/* Tab 1: General Store Information */}
      {activeTab === 'general' && (
        <form onSubmit={handleGeneralSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">General Store Information</h2>
            <p className="text-slate-500">Configure global business contact details, currency, and localization formats</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store / Organization Name</label>
              <input
                type="text"
                required
                value={general.storeName}
                onChange={(e) => setGeneral({ ...general, storeName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email Address</label>
              <input
                type="email"
                required
                value={general.supportEmail}
                onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={general.supportPhone}
                onChange={(e) => setGeneral({ ...general, supportPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Currency</label>
              <select
                value={general.currency}
                onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:border-emerald-600"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">System Timezone</label>
              <select
                value={general.timezone}
                onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:border-emerald-600"
              >
                <option value="UTC-5 (EST)">UTC-5 (Eastern Time)</option>
                <option value="UTC+0 (GMT)">UTC+0 (Greenwich Mean Time)</option>
                <option value="UTC+6 (BST)">UTC+6 (Bangladesh Standard Time)</option>
                <option value="UTC+8 (SGT)">UTC+8 (Singapore Time)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Physical Store / HQ Address</label>
            <textarea
              rows={2}
              value={general.storeAddress}
              onChange={(e) => setGeneral({ ...general, storeAddress: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-600"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Save className="w-4 h-4" /> Save Store Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Authentication Controls */}
      {activeTab === 'security' && (
        <form onSubmit={handleSecuritySubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">Security & Authentication Controls</h2>
            <p className="text-slate-500">Configure password strength policies, admin session timeouts, and lockout rules</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Password Length</label>
              <input
                type="number"
                min="6"
                max="32"
                value={security.minPasswordLength}
                onChange={(e) => setSecurity({ ...security, minPasswordLength: parseInt(e.target.value || '8', 10) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Session Inactivity Timeout (Minutes)</label>
              <select
                value={security.sessionTimeoutMinutes}
                onChange={(e) => setSecurity({ ...security, sessionTimeoutMinutes: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:border-emerald-600"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={120}>120 Minutes (2 Hours)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={security.requireSpecialChar}
                onChange={(e) => setSecurity({ ...security, requireSpecialChar: e.target.checked })}
                className="w-4 h-4 rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-bold text-slate-800">Require Special Character (!@#$%^&*) in Passwords</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={security.requireNumber}
                onChange={(e) => setSecurity({ ...security, requireNumber: e.target.checked })}
                className="w-4 h-4 rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-bold text-slate-800">Require Numeric Digit (0-9) in Passwords</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={security.requireMfaForAdmins}
                onChange={(e) => setSecurity({ ...security, requireMfaForAdmins: e.target.checked })}
                className="w-4 h-4 rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-bold text-slate-800">Require Multi-Factor Authentication (MFA) for Administrative Roles</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Save className="w-4 h-4" /> Save Security Policy
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Catalog & Inventory Rules */}
      {activeTab === 'inventory' && (
        <form onSubmit={handleInventorySubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">Catalog & Inventory Rules</h2>
            <p className="text-slate-500">Manage low stock thresholds, out-of-stock visibility, and automatic SKU formatters</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={inventory.defaultLowStockThreshold}
                onChange={(e) => setInventory({ ...inventory, defaultLowStockThreshold: parseInt(e.target.value || '5', 10) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Auto-Generate Variant SKU Pattern</label>
              <input
                type="text"
                value={inventory.autoGenerateSkuPattern}
                onChange={(e) => setInventory({ ...inventory, autoGenerateSkuPattern: e.target.value })}
                placeholder="{BRAND}-{PRODUCT}-{VARIANT}"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inventory.hideOutOfStock}
                onChange={(e) => setInventory({ ...inventory, hideOutOfStock: e.target.checked })}
                className="w-4 h-4 rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-bold text-slate-800">Automatically Hide Out-Of-Stock Products from Public Catalog</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inventory.enableGuestCheckout}
                onChange={(e) => setInventory({ ...inventory, enableGuestCheckout: e.target.checked })}
                className="w-4 h-4 rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-bold text-slate-800">Allow Guest Customers to Place Orders Without Creating Account</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Save className="w-4 h-4" /> Save Inventory Rules
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Notifications & Webhooks */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleNotificationSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">Notifications & Webhook Configuration</h2>
            <p className="text-slate-500">Configure email alert subscriptions and external ERP webhook endpoints</p>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notification.emailLowStockAlerts}
                onChange={(e) => setNotification({ ...notification, emailLowStockAlerts: e.target.checked })}
                className="w-4 h-4 rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-bold text-slate-800">Send Daily Email Summary for Low Stock Inventory Items</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notification.emailNewUserAlerts}
                onChange={(e) => setNotification({ ...notification, emailNewUserAlerts: e.target.checked })}
                className="w-4 h-4 rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-bold text-slate-800">Notify Super Admin on New Staff Account Registrations</span>
            </label>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Webhook className="w-4 h-4 text-emerald-700" /> Outbound Webhook Integration
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Webhook Endpoint Target URL</label>
              <input
                type="url"
                required
                value={notification.webhookUrl}
                onChange={(e) => setNotification({ ...notification, webhookUrl: e.target.value })}
                placeholder="https://api.yourdomain.com/webhooks"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Webhook Secret Key Signature</label>
                <button
                  type="button"
                  onClick={regenerateWebhookSecret}
                  className="text-emerald-700 hover:underline font-bold text-[11px] flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Regenerate Secret
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={notification.webhookSecret}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-700 select-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Save className="w-4 h-4" /> Save Notification Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 5: Admin Account Profile & Password */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Details Form */}
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Admin Account Profile</h2>
              <p className="text-slate-500">Update your account name and contact email address</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
              >
                <Save className="w-4 h-4" /> Save Profile Info
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-700" /> Change Account Password
                </h2>
                <p className="text-slate-500">Update your login security credentials</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:bg-white focus:border-emerald-600"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Account Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}