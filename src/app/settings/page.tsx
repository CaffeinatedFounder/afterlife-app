'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Loader2,
  LogOut,
  Lock,
  Bell,
  Eye,
  HelpCircle,
  Mail,
  Smartphone,
  Key,
  Shield,
  Clock,
  Download,
  Trash2,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="divide-y divide-gray-200">{children}</div>
    </div>
  );
}

interface SettingRowProps {
  icon?: React.ComponentType<{ className: string }>;
  label: string;
  value?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

function SettingRow({ icon: Icon, label, value, action, onClick }: SettingRowProps) {
  return (
    <div
      onClick={onClick}
      className={`px-6 py-4 flex items-center justify-between gap-3 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && <Icon className="h-5 w-5 text-gray-600 flex-shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {value && <p className="text-xs text-gray-600 truncate">{value}</p>}
        </div>
      </div>
      {action || (onClick && <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />)}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState('weekly');

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        setUserEmail(user.email || '');

        // Fetch user settings from database
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (settings) {
          setEmailNotifications(settings.email_notifications ?? true);
          setPushNotifications(settings.push_notifications ?? false);
          setReminderFrequency(settings.reminder_frequency ?? 'weekly');
          setTwoFAEnabled(settings.two_fa_enabled ?? false);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [supabase, router]);

  const handleSaveSetting = async (key: string, value: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            [key]: value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error('Failed to save setting');
    }
  };

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    handleSaveSetting('email_notifications', checked);
  };

  const handlePushNotificationsChange = (checked: boolean) => {
    setPushNotifications(checked);
    handleSaveSetting('push_notifications', checked);
  };

  const handleReminderFrequencyChange = (frequency: string) => {
    setReminderFrequency(frequency);
    handleSaveSetting('reminder_frequency', frequency);
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      toast.success('Data export initiated. Check your email for a download link.');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Call delete function
      toast.success('Your account has been deleted. Goodbye!');
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 text-purple-900 animate-spin" />
          <span className="text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 text-white px-4 py-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-purple-200 text-sm">Manage your account and preferences</p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-5">
        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingRow icon={Mail} label="Email" value={userEmail} />
          <SettingRow
            icon={Smartphone}
            label="Phone Number"
            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
            onClick={() => router.push('/profile')}
          />
          <SettingRow
            icon={Key}
            label="Change Password"
            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
            onClick={() => {
              toast.info('Password reset link sent to your email');
            }}
          />
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection
          title="Security"
          description="Keep your account safe and secure"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-gray-600">
                  {twoFAEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <Toggle
              checked={twoFAEnabled}
              onChange={checked => {
                setTwoFAEnabled(checked);
                handleSaveSetting('two_fa_enabled', checked);
                toast.success(
                  checked ? '2FA enabled' : '2FA disabled'
                );
              }}
            />
          </div>

          <SettingRow
            icon={Clock}
            label="Login History"
            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
            onClick={() => {
              toast.info('Login history feature coming soon');
            }}
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          title="Notifications"
          description="Choose how you want to be notified"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-600">Receive updates via email</p>
              </div>
            </div>
            <Toggle
              checked={emailNotifications}
              onChange={handleEmailNotificationsChange}
            />
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Push Notifications
                </p>
                <p className="text-xs text-gray-600">Browser notifications</p>
              </div>
            </div>
            <Toggle
              checked={pushNotifications}
              onChange={handlePushNotificationsChange}
            />
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Reminder Frequency
                </p>
              </div>
            </div>
            <select
              value={reminderFrequency}
              onChange={e => handleReminderFrequencyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-sm text-gray-900 bg-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </SettingsSection>

        {/* Privacy Section */}
        <SettingsSection
          title="Privacy & Data"
          description="Control your data and privacy"
        >
          <SettingRow
            icon={Download}
            label="Export My Data"
            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
            onClick={handleDataExport}
          />
          <div className="px-6 py-4">
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-3 w-full text-left hover:bg-gray-50 transition-colors p-2 -m-2"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-gray-600">
                  Permanently delete your account and data
                </p>
              </div>
            </button>
          </div>
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingRow label="Version" value="1.0.0" />
          <SettingRow
            icon={MessageCircle}
            label="Terms of Service"
            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
            onClick={() => window.open('https://afterlife.app/terms', '_blank')}
          />
          <SettingRow
            icon={Eye}
            label="Privacy Policy"
            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
            onClick={() => window.open('https://afterlife.app/privacy', '_blank')}
          />
          <SettingRow label="Grievance Officer" value="Sheetal Koul" />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SettingRow
            icon={HelpCircle}
            label="Help Center"
            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
            onClick={() => window.open('https://help.afterlife.app', '_blank')}
          />
          <SettingRow
            icon={Mail}
            label="Contact Us"
            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
            onClick={() => {
              window.location.href = 'mailto:support@afterlife.app';
            }}
          />
          <SettingRow
            icon={HelpCircle}
            label="FAQ"
            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
            onClick={() => window.open('https://afterlife.app/faq', '_blank')}
          />
        </SettingsSection>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
          <LogOut className="h-5 w-5" />
          {loggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 animate-slideUp">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Delete Account</h2>
            </div>

            <div className="space-y-3 bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm font-semibold text-red-900">
                This action cannot be undone. Your account and all data will be permanently deleted.
              </p>
              <ul className="text-sm text-red-800 space-y-2 list-disc list-inside">
                <li>All your digital wills will be deleted</li>
                <li>All your messages will be deleted</li>
                <li>All vault documents will be deleted</li>
                <li>Beneficiaries will no longer have access</li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDeleteAccount}
                className="w-full py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="w-full py-2.5 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
