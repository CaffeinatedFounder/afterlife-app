import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * POST /api/payments/verify
 * Verifies a Razorpay payment signature
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: VerifyPaymentRequest = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Razorpay secret
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeySecret) {
      console.error('Razorpay secret not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Verify signature using HMAC SHA256
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(message)
      .digest('hex');

    const verified = generatedSignature === razorpay_signature;

    if (!verified) {
      console.warn('Invalid payment signature for order:', razorpay_order_id);
      return NextResponse.json(
        { error: 'Invalid signature', verified: false },
        { status: 400 }
      );
    }

    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    // Update user profile to set plan as lifetime
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        plan: 'lifetime',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Payment is verified but profile update failed
      // This is non-critical but should be logged
    }

    // Log successful payment
    console.log(`Payment verified for user ${user.id}: ${razorpay_order_id}`);

    return NextResponse.json({
      verified: true,
      message: 'Payment verified successfully',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
