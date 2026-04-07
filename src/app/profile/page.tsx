'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils';
import { User } from '@/types';

interface Profile extends User {
  avatar_url?: string;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setEmail(data.email || user.email || '');
          setPhone(data.phone || '');
        } else {
          // Create default profile
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            phone: '',
            kyc_status: 'pending',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setFullName(user.user_metadata?.full_name || '');
          setEmail(user.email || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, router]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: fullName, phone } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const fileName = `${profile.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev =>
        prev ? { ...prev, avatar_url: data.publicUrl } : null
      );
      toast.success('Avatar updated');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

  const kycStatus = profile?.kyc_status || 'pending';
  const kycColors = {
    pending: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const profileCompletion = Math.round(
    ((fullName ? 1 : 0) + (email ? 1 : 0) + (phone ? 1 : 0)) / 3 * 100
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 text-purple-900 animate-spin" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 text-white px-4 py-8">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-purple-200 text-sm">Manage your personal information</p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Avatar Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-3xl font-bold text-purple-900 border-4 border-white shadow-md">
                {getInitials(fullName || 'User')}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-white border-4 border-purple-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-md">
                <Camera className="h-4 w-4 text-purple-900" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              Click camera to upload a new avatar
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Full Name */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
            />
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
            />
          </div>
        </div>

        {/* KYC Status */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">KYC Status</h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${kycColors[kycStatus]}`}>
              {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
            </span>
          </div>

          {kycStatus !== 'verified' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Complete KYC verification to unlock premium features and ensure account security.
              </p>
              <button className="w-full py-2.5 bg-gradient-to-r from-purple-900 to-blue-800 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow">
                Start KYC Verification
              </button>
            </div>
          )}

          {kycStatus === 'verified' && (
            <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              Your account is KYC verified
            </div>
          )}
        </div>

        {/* Profile Completion */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Profile Completion</h3>

          <div className="mb-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-700">Completion Rate</span>
              <span className="font-bold text-gray-900">{profileCompletion}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-900 to-blue-800 transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${fullName ? 'bg-green-500' : 'bg-gray-300'}`}>
                {fullName ? '✓' : '○'}
              </div>
              <span className={fullName ? 'text-gray-900' : 'text-gray-600'}>
                Full Name
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${email ? 'bg-green-500' : 'bg-gray-300'}`}>
                {email ? '✓' : '○'}
              </div>
              <span className={email ? 'text-gray-900' : 'text-gray-600'}>Email</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${phone ? 'bg-green-500' : 'bg-gray-300'}`}>
                {phone ? '✓' : '○'}
              </div>
              <span className={phone ? 'text-gray-900' : 'text-gray-600'}>
                Phone Number
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-purple-900 to-blue-800 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
