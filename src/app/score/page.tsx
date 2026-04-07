import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  User,
  Users,
  Landmark,
  Heart,
  FileText,
  Shield,
  MessageSquare,
  BadgeCheck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { ScoreRing } from '@/components/score/score-ring';
import { AfterlifeScore } from '@/types';

async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect('/auth/login');
  }

  return data.user;
}

async function calculateScore(userId: string): Promise<AfterlifeScore> {
  const supabase = await createClient();

  // Fetch all relevant data
  const [
    profileRes,
    beneficiariesRes,
    assetsRes,
    willRes,
    messagesRes,
    vaultRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('beneficiaries').select('*').eq('user_id', userId),
    supabase.from('assets').select('*').eq('user_id', userId),
    supabase.from('digital_wills').select('*').eq('user_id', userId).single(),
    supabase.from('messages').select('*').eq('user_id', userId),
    supabase.from('vault_documents').select('*').eq('user_id', userId),
  ]);

  const profile = profileRes.data;
  const beneficiaries = beneficiariesRes.data || [];
  const assets = assetsRes.data || [];
  const will = willRes.data;
  const messages = messagesRes.data || [];
  const vaultDocs = vaultRes.data || [];

  // Calculate each component score (0-10 points each = 80 max + bonuses)
  let totalScore = 0;

  // Personal Info (10 pts)
  if (profile?.first_name && profile?.last_name) totalScore += 3;
  if (profile?.phone) totalScore += 2;
  if (profile?.date_of_birth) totalScore += 2;
  if (profile?.address) totalScore += 3;

  // Family Details (10 pts)
  if (profile?.spouse_name) totalScore += 3;
  if (profile?.children_count && profile.children_count > 0) totalScore += 4;
  if (profile?.parents_count && profile.parents_count > 0) totalScore += 3;

  // Assets Declared (10 pts)
  const assetCount = assets.length;
  if (assetCount > 0) totalScore += Math.min(assetCount * 1.5, 10);

  // Beneficiaries (10 pts)
  const beneficiaryCount = beneficiaries.length;
  if (beneficiaryCount > 0) totalScore += Math.min(beneficiaryCount * 3, 10);

  // Will Completed (10 pts)
  if (will?.status === 'completed') totalScore += 10;
  else if (will?.status === 'review') totalScore += 7;
  else if (will?.status === 'in_progress') totalScore += 4;
  else if (will?.status === 'draft') totalScore += 1;

  // Vault Documents (10 pts)
  const docCount = vaultDocs.length;
  if (docCount > 0) totalScore += Math.min(docCount * 1.2, 10);

  // Messages Written (10 pts)
  const messageCount = messages.length;
  if (messageCount > 0) totalScore += Math.min(messageCount * 2, 10);

  // KYC Verified (10 pts)
  if (profile?.kyc_status === 'verified') totalScore += 10;
  else if (profile?.kyc_status === 'submitted') totalScore += 5;

  const maxScore = 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Calculate breakdown for each category
  const breakdown = {
    personal_info: Math.min(
      Math.round(
        ((profile?.first_name && profile?.last_name ? 1 : 0) +
          (profile?.phone ? 1 : 0) +
          (profile?.date_of_birth ? 1 : 0) +
          (profile?.address ? 1 : 0)) /
          4 *
          10
      ),
      10
    ),
    family_details: Math.min(
      Math.round(
        ((profile?.spouse_name ? 1 : 0) +
          (profile?.children_count ? 1 : 0) +
          (profile?.parents_count ? 1 : 0)) /
          3 *
          10
      ),
      10
    ),
    assets_declared: Math.min(
      Math.round((assets.length / 5) * 10),
      10
    ),
    beneficiaries_assigned: Math.min(
      Math.round((beneficiaries.length / 5) * 10),
      10
    ),
    will_completed: will?.status === 'completed' ? 10 : will?.status === 'review' ? 7 : 0,
    vault_documents: Math.min(Math.round((vaultDocs.length / 10) * 10), 10),
    messages_written: Math.min(Math.round((messages.length / 5) * 10), 10),
    kyc_verified:
      profile?.kyc_status === 'verified' ? 10 : profile?.kyc_status === 'submitted' ? 5 : 0,
  };

  // Generate recommendations
  const recommendations: string[] = [];

  if (!profile?.first_name || !profile?.last_name) {
    recommendations.push('Complete your personal information');
  }
  if (beneficiaries.length === 0) {
    recommendations.push('Add at least one beneficiary');
  }
  if (assets.length === 0) {
    recommendations.push('Declare your assets');
  }
  if (!will || will.status !== 'completed') {
    recommendations.push('Complete your digital will');
  }
  if (vaultDocs.length === 0) {
    recommendations.push('Upload important documents to vault');
  }
  if (messages.length === 0) {
    recommendations.push('Leave messages for your loved ones');
  }
  if (profile?.kyc_status !== 'verified') {
    recommendations.push('Complete KYC verification');
  }

  return {
    user_id: userId,
    total_score: Math.round(totalScore),
    max_score: maxScore,
    percentage,
    breakdown,
    recommendations,
    last_calculated: new Date().toISOString(),
  };
}

interface ScoreBreakdownItem {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: number;
  maxValue: number;
}

export default async function ScorePage() {
  const user = await getUser();
  const score = await calculateScore(user.id);

  const scoreItems: ScoreBreakdownItem[] = [
    { icon: User, label: 'Personal Info', value: score.breakdown.personal_info, maxValue: 10 },
    { icon: Users, label: 'Family Details', value: score.breakdown.family_details, maxValue: 10 },
    { icon: Landmark, label: 'Assets Declared', value: score.breakdown.assets_declared, maxValue: 10 },
    { icon: Heart, label: 'Beneficiaries', value: score.breakdown.beneficiaries_assigned, maxValue: 10 },
    { icon: FileText, label: 'Will Completed', value: score.breakdown.will_completed, maxValue: 10 },
    { icon: Shield, label: 'Vault Documents', value: score.breakdown.vault_documents, maxValue: 10 },
    { icon: MessageSquare, label: 'Messages Written', value: score.breakdown.messages_written, maxValue: 10 },
    { icon: BadgeCheck, label: 'KYC Verified', value: score.breakdown.kyc_verified, maxValue: 10 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 text-white px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Afterlife Score</h1>
        <p className="text-purple-200">Complete your profile to secure your legacy</p>
      </div>

      {/* Score Ring */}
      <div className="px-4 py-8 flex justify-center">
        <ScoreRing score={score.total_score} size="lg" />
      </div>

      {/* Score Details */}
      <div className="px-4 space-y-6">
        {/* Main Score Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Score Breakdown</h2>
          <p className="text-gray-600 mb-6">
            {score.percentage === 100
              ? 'Excellent! Your digital legacy is fully secured.'
              : score.percentage >= 75
                ? 'Great progress! You\'re almost there.'
                : score.percentage >= 50
                  ? 'Good start! Keep going to complete your legacy.'
                  : 'Get started by completing the sections below.'}
          </p>

          {/* Score Grid */}
          <div className="grid grid-cols-2 gap-4">
            {scoreItems.map((item, index) => {
              const Icon = item.icon;
              const percentage = (item.value / item.maxValue) * 100;

              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-purple-900" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {item.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-1">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-900 to-blue-800 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs font-bold text-gray-900">
                    {item.value}/{item.maxValue}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        {score.recommendations.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <h3 className="text-base font-bold text-amber-900">
                Recommendations to Improve Your Score
              </h3>
            </div>

            <div className="space-y-2">
              {score.recommendations.slice(0, 5).map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-amber-800 text-sm"
                >
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Progress Chart Info */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-900" />
            <h3 className="text-lg font-bold text-gray-900">Progress</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Overall Completion</span>
              <span className="font-bold text-gray-900">{score.percentage}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-900 to-blue-800 transition-all duration-700"
                style={{ width: `${score.percentage}%` }}
              />
            </div>

            <div className="pt-3 border-t border-gray-200 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-xs text-gray-600 mb-1">Categories Complete</div>
                <div className="text-lg font-bold text-purple-900">
                  {scoreItems.filter(item => item.value > 0).length}/8
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Total Points</div>
                <div className="text-lg font-bold text-purple-900">
                  {score.total_score}/{score.max_score}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Last Updated</div>
                <div className="text-xs font-semibold text-purple-900">Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-6">
        <a
          href="/dashboard"
          className="block w-full py-3 bg-gradient-to-r from-purple-900 to-blue-800 text-white font-bold rounded-lg text-center hover:shadow-lg transition-shadow"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
