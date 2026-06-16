import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

// Replace with your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "YOUR_STRIPE_PUBLISHABLE_KEY";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ amount, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required if you redirect it, but for modal you might handle it differently.
        // For inline confirmation context, we can just use redirect: 'if_required'
      },
      redirect: 'if_required'
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsLoading(false);
    } else {
      setError(null);
      setIsLoading(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      
      {error && (
        <div className="text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/30">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-xl border border-[#8C827A]/30 text-[#E5DCD3] hover:bg-[#24211E] transition-colors text-sm font-bold"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="flex-1 py-3 px-4 rounded-xl bg-[#C5A880] hover:bg-[#C5A880]/85 text-[#1A1816] transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `支付 HK$${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

export default function StripePaymentWrapper({ 
  amount, 
  onSuccess, 
  onCancel 
}: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (amount <= 0) return;
    
    // Create PaymentIntent as soon as the component loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then((res) => res.json())
      .then((data) => {
         if (data.clientSecret) {
           setClientSecret(data.clientSecret);
         }
      })
      .catch((err) => console.error('Failed to create payment intent', err));
  }, [amount]);

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#C5A880',
      colorBackground: '#1A1816',
      colorText: '#E5DCD3',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '12px',
    }
  };

  if (!clientSecret) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-stone-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#C5A880]" />
        <span className="text-sm font-mono uppercase tracking-widest">載入安全支付組件...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1816] p-6 rounded-2xl border border-[#8C827A]/20">
      <div className="mb-6">
        <h3 className="text-xl font-serif text-[#C5A880] font-bold">Stripe 安全支付</h3>
        <p className="text-xs text-stone-400 mt-1 pb-4 border-b border-[#8C827A]/20">
           支援信用卡及 Stripe 啟用的本地付款方式
        </p>
      </div>
      
      <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
        <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </div>
  );
}
