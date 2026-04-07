/**
 * Razorpay Integration Utility Functions
 * Handles payment order creation, checkout, and verification
 */

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  created_at: number;
}

interface RazorpayCheckoutResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Load Razorpay script dynamically
 * Returns true if successfully loaded or already present
 */
export async function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

/**
 * Create a Razorpay order via our API
 */
export async function createOrder(
  amount: number,
  currency: string = 'INR'
): Promise<RazorpayOrder | null> {
  try {
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.order) {
      throw new Error('No order returned from API');
    }

    return data.order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return null;
  }
}

/**
 * Open Razorpay checkout modal
 */
export async function openCheckout(
  orderId: string,
  amount: number,
  userEmail: string,
  userName: string
): Promise<RazorpayCheckoutResult | null> {
  return new Promise((resolve, reject) => {
    const Razorpay = (window as any).Razorpay;

    if (!Razorpay) {
      reject(new Error('Razorpay not loaded'));
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: orderId,
      amount: amount,
      currency: 'INR',
      name: 'Afterlife',
      description: 'Lifetime Access Plan',
      customer_notify: 1,
      email: userEmail,
      contact: '',
      prefill: {
        name: userName,
        email: userEmail,
      },
      notes: {
        note_key_1: 'Afterlife Lifetime Access',
      },
      theme: {
        color: '#2D2D7F',
      },
      handler: async function (response: RazorpayCheckoutResult) {
        // Verify payment
        const verified = await verifyPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        if (verified) {
          resolve(response);
        } else {
          reject(new Error('Payment verification failed'));
        }
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    try {
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Verify Razorpay payment via our API
 */
export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.verified === true;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}
