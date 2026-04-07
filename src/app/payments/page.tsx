'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  CheckCircle2,
  IndianRupee,
  Download,
  Shield,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { loadRazorpay, createOrder, openCheckout } from '@/lib/razorpay';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Payment {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  plan: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  plan?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  const planPrice = 7999; // INR
  const gst = Math.round(planPrice * 0.18);
  const totalAmount = planPrice + gst;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch payments
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (paymentsData) {
          setPayments(paymentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, router]);

  const handlePayNow = async () => {
    if (!profile) {
      toast.error('User profile not found');
      return;
    }

    setProcessing(true);

    try {
      // Load Razorpay
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay');
      }

      // Create order
      const order = await createOrder(totalAmount, 'INR');

      if (!order || !order.id) {
        throw new Error('Failed to create order');
      }

      // Open Razorpay checkout
      const result = await openCheckout(
        order.id,
        totalAmount,
        profile.email,
        profile.full_name
      );

      if (result && result.razorpay_payment_id) {
        toast.success('Payment successful! Your plan is now active.');
        // Refresh payments
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const isLifetimePlan = profile?.plan === 'lifetime' || profile?.plan === 'premium';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 text-purple-900 animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 text-white px-4 py-8">
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <p className="text-purple-200 text-sm">Manage your subscription and payments</p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Current Plan */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Current Plan</h2>

          <div className={`rounded-lg p-6 mb-4 ${isLifetimePlan ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {isLifetimePlan ? 'Lifetime Access' : 'Free Plan'}
                </h3>
                <p className={`text-sm ${isLifetimePlan ? 'text-green-700' : 'text-gray-600'}`}>
                  {isLifetimePlan
                    ? 'Full access to all features'
                    : 'Limited access - upgrade for premium features'}
                </p>
              </div>
              {isLifetimePlan && (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              )}
            </div>

            {!isLifetimePlan && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Upgrade to Lifetime Access for unlimited access to all premium features including:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Unlimited digital wills
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Unlimited messages (text, video, audio)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Unlimited vault storage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Priority support
                  </li>
                </ul>
              </div>
            )}
          </div>

          {!isLifetimePlan && (
            <div className="space-y-4">
              {/* Pricing Card */}
              <div className="border-2 border-purple-900 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-purple-900">
                        ₹{planPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-gray-600">(excluding GST)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">GST (18%)</p>
                    <p className="text-lg font-bold text-purple-900">
                      ₹{gst.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-3 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <div className="text-2xl font-bold text-purple-900">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <p className="text-xs text-green-600 font-semibold">One-time payment</p>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayNow}
                disabled={processing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-900 to-blue-800 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                <IndianRupee className="h-5 w-5" />
                {processing ? 'Processing...' : 'Pay Now with Razorpay'}
              </button>

              {/* Security Info */}
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Your payment is secure and encrypted with Razorpay</span>
              </div>
            </div>
          )}

          {isLifetimePlan && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-900">Payment successful</p>
                <p className="text-xs text-green-700">You have unlimited access to all features</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {payments.map(payment => (
                <div key={payment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                        <IndianRupee className="h-5 w-5 text-purple-900" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {payment.razorpay_payment_id && (
                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded p-2 mt-2">
                      <span>Order ID: {payment.razorpay_order_id}</span>
                      <button
                        className="text-purple-900 hover:text-purple-800 font-semibold flex items-center gap-1"
                        onClick={() => {
                          toast.info('Receipt download feature coming soon');
                        }}
                      >
                        <Download className="h-3 w-3" />
                        Receipt
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                Is the lifetime plan truly lifetime?
              </h4>
              <p className="text-xs text-gray-600">
                Yes! Once you purchase the lifetime plan, you have unlimited access to all features forever. No recurring charges.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                What payment methods do you accept?
              </h4>
              <p className="text-xs text-gray-600">
                We accept all major credit cards, debit cards, UPI, and net banking through Razorpay.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                Can I get a refund?
              </h4>
              <p className="text-xs text-gray-600">
                Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                Is GST included in the price?
              </h4>
              <p className="text-xs text-gray-600">
                GST is calculated separately based on your location. The final amount will be shown during checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
