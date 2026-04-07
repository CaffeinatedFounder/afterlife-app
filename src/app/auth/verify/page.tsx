'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Get user email from session
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setEmail(data.user.email);
      }
    };

    getUser();
  }, [supabase]);

  // Check for email verification
  useEffect(() => {
    const checkVerification = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email_confirmed_at) {
        setIsVerified(true);
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    };

    // Check immediately
    checkVerification();

    // Check every 3 seconds
    const interval = setInterval(checkVerification, 3000);

    return () => clearInterval(interval);
  }, [router, supabase]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleResendEmail = async () => {
    if (!email || cooldownSeconds > 0) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      const { error } = await supabase.auth.resendEnrollmentEmail({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setResendMessage(`Error: ${error.message}`);
      } else {
        setResendMessage('Verification email sent! Check your inbox.');
        setCooldownSeconds(60);
      }
    } catch (err) {
      setResendMessage('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Purple Gradient Header */}
      <div className="h-40 bg-gradient-to-r from-purple-900 via-purple-800 to-blue-800" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 -mt-24">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {isVerified ? (
              <>
                <div className="mb-6 flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified</h1>
                <p className="text-gray-600 mb-6">Welcome to Afterlife! Redirecting to your dashboard...</p>
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 text-purple-900 animate-spin" />
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-full bg-purple-100">
                    <Mail className="h-10 w-10 text-purple-900" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                <p className="text-gray-600 mb-6">
                  We've sent a verification link to <strong>{email}</strong>
                </p>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-sm text-purple-900">
                  Click the link in the email to verify your account. You'll be redirected automatically once verified.
                </div>

                {resendMessage && (
                  <div
                    className={`mb-6 p-3 rounded-lg text-sm ${
                      resendMessage.includes('Error')
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-green-50 text-green-800 border border-green-200'
                    }`}
                  >
                    {resendMessage}
                  </div>
                )}

                <button
                  onClick={handleResendEmail}
                  disabled={isResending || cooldownSeconds > 0}
                  className="w-full bg-gradient-to-r from-purple-900 to-blue-800 text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isResending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isResending
                    ? 'Sending...'
                    : cooldownSeconds > 0
                      ? `Resend in ${cooldownSeconds}s`
                      : 'Resend verification email'}
                </button>

                <p className="text-xs text-gray-500 mt-6">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={handleResendEmail}
                    disabled={cooldownSeconds > 0}
                    className="font-semibold text-purple-900 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    try again
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
