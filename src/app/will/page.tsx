import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Users, Briefcase, Gift, Scale, Lock } from 'lucide-react';

interface DigitalWill {
  id: string;
  user_id: string;
  current_section: number;
  completion_percentage: number;
  personal_info: Record<string, any> | null;
  family_details: Record<string, any> | null;
  special_instructions: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

const WILL_SECTIONS = [
  {
    number: 1,
    title: 'Personal Information',
    description: 'Basic details and identification',
    icon: FileText,
  },
  {
    number: 2,
    title: 'Family Details',
    description: 'Spouse, children, and dependents',
    icon: Users,
  },
  {
    number: 3,
    title: 'Asset Declaration',
    description: 'All your assets and valuables',
    icon: Briefcase,
  },
  {
    number: 4,
    title: 'Beneficiary Assignment',
    description: 'Who gets what',
    icon: Gift,
  },
  {
    number: 5,
    title: 'Distribution Details',
    description: 'Allocation percentages and gifts',
    icon: Scale,
  },
  {
    number: 6,
    title: 'Review & Instructions',
    description: 'Final review and executor details',
    icon: Lock,
  },
];

export default async function WillPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Fetch existing will
  const { data: will, error } = await supabase
    .from('digital_wills')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching will:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Your Digital Will
          </h1>
          <p className="text-slate-600">
            Create a comprehensive will to secure your family's future
          </p>
        </div>

        {/* Main Content */}
        {!will ? (
          <div className="space-y-8">
            {/* Hero Card */}
            <Card className="border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Create Your Digital Will</h2>
                  <p className="text-purple-100 text-lg">
                    A complete, legally-sound digital will in just 6 easy steps
                  </p>
                </div>
                <Lock className="w-12 h-12 text-purple-200 flex-shrink-0" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-purple-100">Average completion time</p>
                  <p className="text-2xl font-bold">15-20 minutes</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-purple-100">Sections to complete</p>
                  <p className="text-2xl font-bold">6 Steps</p>
                </div>
              </div>

              <Link href="/will/step1">
                <Button className="bg-white text-purple-600 hover:bg-purple-50 font-semibold">
                  Start Creating Your Will
                </Button>
              </Link>
            </Card>

            {/* Section Cards */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">What You'll Prepare</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WILL_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Card
                      key={section.number}
                      className="p-6 hover:shadow-lg transition-shadow border-slate-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-3 rounded-lg">
                          <Icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 font-medium">Step {section.number}</p>
                          <h4 className="font-semibold text-slate-900 mb-1">{section.title}</h4>
                          <p className="text-sm text-slate-600">{section.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Info Section */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-slate-900 mb-3">Why Create a Digital Will?</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Ensure your assets reach the right people</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Reduce stress and legal complications for your family</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>All information securely stored and accessible when needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Update anytime as your circumstances change</span>
                </li>
              </ul>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Will Status Card */}
            <Card className="p-8 border-0 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Digital Will</h2>
                  <p className="text-slate-600">
                    Last updated: {new Date(will.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {will.completion_percentage}%
                  </div>
                  <p className="text-sm text-slate-600">Complete</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-200 h-2 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all"
                  style={{ width: `${will.completion_percentage}%` }}
                />
              </div>

              <div className="flex gap-4">
                <Link href={`/will/step${will.current_section}`}>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    Continue from Step {will.current_section}
                  </Button>
                </Link>
                <Link href="/will/step1">
                  <Button variant="outline">Edit from Start</Button>
                </Link>
              </div>
            </Card>

            {/* Completion Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Personal Info', completed: !!will.personal_info },
                { label: 'Family Details', completed: !!will.family_details },
                { label: 'Assets', completed: will.completion_percentage > 40 },
                { label: 'Distribution', completed: will.completion_percentage > 70 },
              ].map((stat, idx) => (
                <Card key={idx} className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {stat.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900">{stat.label}</p>
                </Card>
              ))}
            </div>

            {/* Continue Sections */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Continue Your Will</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WILL_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isCompleted = section.number <= will.current_section;
                  const isCurrent = section.number === will.current_section;

                  return (
                    <Link key={section.number} href={`/will/step${section.number}`}>
                      <Card
                        className={`p-6 cursor-pointer transition-all ${
                          isCurrent
                            ? 'border-purple-600 bg-purple-50'
                            : isCompleted
                              ? 'border-green-200 bg-green-50'
                              : 'border-slate-200 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-lg ${
                              isCurrent
                                ? 'bg-gradient-to-br from-purple-100 to-blue-100'
                                : isCompleted
                                  ? 'bg-green-100'
                                  : 'bg-slate-100'
                            }`}
                          >
                            <Icon
                              className={`w-6 h-6 ${
                                isCurrent
                                  ? 'text-purple-600'
                                  : isCompleted
                                    ? 'text-green-600'
                                    : 'text-slate-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-slate-500">Step {section.number}</p>
                              {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            </div>
                            <h4 className="font-semibold text-slate-900">{section.title}</h4>
                            <p className="text-sm text-slate-600">{section.description}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
