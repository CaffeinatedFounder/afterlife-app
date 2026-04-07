import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CheckCircle2, FileText, Users, MessageSquare, AlertCircle } from 'lucide-react';

async function getDashboardData() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    return {
      user: authData.user,
      profile: null,
      completionScore: 0,
    };
  }

  // Calculate completion score
  const completionScore = calculateCompletionScore(profile);

  return {
    user: authData.user,
    profile,
    completionScore,
  };
}

function calculateCompletionScore(profile: any): number {
  let score = 0;
  const maxScore = 100;

  // Weight different sections
  if (profile.first_name && profile.last_name) score += 15;
  if (profile.phone) score += 10;
  if (profile.address) score += 15;
  if (profile.has_will) score += 20;
  if (profile.has_beneficiaries) score += 20;
  if (profile.vault_documents_count && profile.vault_documents_count > 0) score += 20;

  return Math.min(score, maxScore);
}

function QuickActionCard({
  icon: Icon,
  title,
  subtitle,
  progress,
  href,
  completed,
}: {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  subtitle: string;
  progress: number;
  href: string;
  completed: boolean;
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl shadow hover:shadow-md transition p-5 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
          <Icon className="h-6 w-6 text-purple-900" />
        </div>
        {completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>

      {/* Progress bar */}
      {!completed && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-900 to-blue-800 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </a>
  );
}

export default async function DashboardPage() {
  const { user, profile, completionScore } = await getDashboardData();

  const firstName = profile?.first_name || 'there';
  const isProfileIncomplete = !profile?.first_name || !profile?.last_name;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello, {firstName}</h1>
        <p className="text-gray-600">Secure your digital legacy</p>
      </div>

      {/* Completion Score Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Afterlife Score</h2>
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={`${(2 * Math.PI * 54 * completionScore) / 100} ${2 * Math.PI * 54}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#2D2D7F" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{completionScore}</div>
                <div className="text-xs text-gray-600">%</div>
              </div>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1">
            <p className="text-gray-600 mb-4">
              {completionScore === 100
                ? 'Your digital legacy is secure!'
                : `Complete ${100 - completionScore}% more to secure your legacy`}
            </p>
            <a
              href="/dashboard/progress"
              className="inline-block text-purple-900 font-semibold hover:text-purple-800"
            >
              View detailed progress →
            </a>
          </div>
        </div>
      </div>

      {/* Profile Incomplete Alert */}
      {isProfileIncomplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Complete your profile</h3>
            <p className="text-sm text-amber-800 mb-3">
              Add your personal details to get started securing your legacy.
            </p>
            <a href="/settings/profile" className="text-sm font-semibold text-amber-900 hover:text-amber-800">
              Go to profile →
            </a>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickActionCard
            icon={FileText}
            title="Digital Will"
            subtitle="Create and manage your will"
            progress={profile?.has_will ? 100 : 0}
            href="/will"
            completed={profile?.has_will}
          />
          <QuickActionCard
            icon={CheckCircle2}
            title="Digital Vault"
            subtitle="Secure important documents"
            progress={profile?.vault_documents_count ? (profile.vault_documents_count / 10) * 100 : 0}
            href="/vault"
            completed={false}
          />
          <QuickActionCard
            icon={Users}
            title="Beneficiaries"
            subtitle="Manage who inherits your legacy"
            progress={profile?.has_beneficiaries ? 100 : 0}
            href="/dashboard/beneficiaries"
            completed={profile?.has_beneficiaries}
          />
          <QuickActionCard
            icon={MessageSquare}
            title="Messages"
            subtitle="Leave messages for loved ones"
            progress={profile?.has_messages ? 100 : 0}
            href="/messages"
            completed={profile?.has_messages}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <p className="text-gray-600 text-center py-8">No recent activity yet</p>
        </div>
      </div>

      {/* Bottom spacing for fixed nav */}
      <div className="h-8" />
    </div>
  );
}
