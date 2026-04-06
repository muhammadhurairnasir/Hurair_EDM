import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckCircle2, Loader2 } from 'lucide-react';

const StripeCheckoutForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onSuccess();
      } else {
        setError('Payment processing. Please verify your dashboard.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-xl text-sm font-medium">
        🔐 Sandbox Mode — Use card <strong>4242 4242 4242 4242</strong>, any future date &amp; any 3-digit CVC.
      </div>

      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
        <CardElement options={cardElementOptions} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
          <><CheckCircle2 className="w-5 h-5" /> Pay Now</>
        )}
      </button>
    </form>
  );
};

export default StripeCheckoutForm;
