'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  Mail,
  Lock,
  User,
  Phone,
  Key,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const signupSchema = z
  .object({
    inviteCode: z.string().min(1, 'Invite code is required'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  const strengths = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Weak', color: 'bg-red-500' },
    { score: 2, label: 'Fair', color: 'bg-orange-500' },
    { score: 3, label: 'Good', color: 'bg-yellow-500' },
    { score: 4, label: 'Strong', color: 'bg-blue-500' },
    { score: 5, label: 'Very Strong', color: 'bg-green-500' },
  ];

  return strengths[score];
}

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteValidating, setInviteValidating] = useState(false);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password');
  const passwordStrength = getPasswordStrength(password);
  const inviteCodeWatch = watch('inviteCode');

  const validateInviteCode = async (code: string) => {
    if (!code) {
      setInviteValid(null);
      return;
    }

    setInviteValidating(true);
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('id, used')
        .eq('code', code.toUpperCase())
        .single();

      if (error || !data) {
        setInviteValid(false);
      } else if (data.used) {
        setInviteValid(false);
      } else {
        setInviteValid(true);
      }
    } catch (err) {
      setInviteValid(false);
    } finally {
      setInviteValidating(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Verify invite code one more time
      const { data: inviteData, error: inviteError } = await supabase
        .from('invite_codes')
        .select('id')
        .eq('code', data.inviteCode.toUpperCase())
        .eq('used', false)
        .single();

      if (inviteError || !inviteData) {
        setError('Invalid or expired invite code');
        setIsLoading(false);
        return;
      }

      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone || '',
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Signup failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Mark invite code as used
      await supabase
        .from('invite_codes')
        .update({ used: true, used_by: authData.user.id, used_at: new Date() })
        .eq('id', inviteData.id);

      // Redirect to verification page
      router.push('/auth/verify');
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Purple Gradient Header */}
      <div className="h-32 bg-gradient-to-r from-purple-900 via-purple-800 to-blue-800" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 -mt-16 pb-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
            <p className="text-gray-600 mb-8">Join Afterlife to secure your digital legacy</p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
              {/* Invite Code */}
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="inviteCode"
                    type="text"
                    placeholder="Enter your invite code"
                    {...register('inviteCode')}
                    onBlur={() => validateInviteCode(inviteCodeWatch)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-purple-900 focus:ring-2 focus:ring-purple-900/20 outline-none transition uppercase"
                  />
                  {inviteValidating && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                  )}
                  {inviteValid === true && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                  {inviteValid === false && (
                    <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
                {errors.inviteCode && (
                  <p className="text-xs text-red-600 mt-1">{errors.inviteCode.message}</p>
                )}
                {inviteValid === false && !errors.inviteCode && (
                  <p className="text-xs text-red-600 mt-1">Invalid or expired invite code</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    {...register('fullName')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-900 focus:ring-2 focus:ring-purple-900/20 outline-none transition"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-900 focus:ring-2 focus:ring-purple-900/20 outline-none transition"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...register('phone')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-900 focus:ring-2 focus:ring-purple-900/20 outline-none transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-900 focus:ring-2 focus:ring-purple-900/20 outline-none transition"
                  />
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p className="text-xs text-gray-600">
                        Strength:{' '}
                        <span className={`font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                          {passwordStrength.label}
                        </span>
                      </p>
                    )}
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-900 focus:ring-2 focus:ring-purple-900/20 outline-none transition"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  {...register('termsAccepted')}
                  className="mt-1 rounded border-gray-300 accent-purple-900"
                />
                <label htmlFor="termsAccepted" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="font-semibold text-purple-900 hover:text-purple-800">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-semibold text-purple-900 hover:text-purple-800">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-xs text-red-600">{errors.termsAccepted.message}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || inviteValid !== true}
                className="w-full bg-gradient-to-r from-purple-900 to-blue-800 text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-purple-900 hover:text-purple-800">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
