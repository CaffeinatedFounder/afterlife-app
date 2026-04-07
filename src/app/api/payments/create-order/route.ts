import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface CreateOrderRequest {
  amount: number;
  currency: string;
}

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for payment
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
    const body: CreateOrderRequest = await request.json();
    const { amount, currency = 'INR' } = body;

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get Razorpay credentials from environment
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Create order via Razorpay API
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `order_${user.id}_${Date.now()}`,
        notes: {
          user_id: user.id,
          email: user.email,
        },
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error('Razorpay API error:', error);
      throw new Error(`Razorpay API error: ${orderResponse.status}`);
    }

    const order = await orderResponse.json();

    // Save order to database
    const { error: dbError } = await supabase
      .from('payments')
      .insert([
        {
          user_id: user.id,
          razorpay_order_id: order.id,
          amount: amount,
          currency,
          status: 'pending',
          plan: 'lifetime',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      // Order was created in Razorpay but not saved to DB
      // This is non-critical as we can recover from the webhook
    }

    return NextResponse.json({
      order: {
        id: order.id,
        entity: order.entity,
        amount: order.amount / 100, // Convert back to rupees
        currency: order.currency,
        status: order.status,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
