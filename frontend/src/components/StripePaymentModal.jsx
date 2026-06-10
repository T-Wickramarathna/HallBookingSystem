import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Loader2, Lock } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ booking, clientSecret, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${booking.user?.first_name} ${booking.user?.last_name}`,
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        await api.post('/payments/confirm', {
          booking_id: booking.id,
          payment_intent_id: paymentIntent.id
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Payment Successful!',
          text: 'Your booking has been officially confirmed.',
          confirmButtonColor: '#2563eb'
        });
        
        onSuccess();
      } catch (err) {
        setError('Payment succeeded but failed to verify on server. Please contact support.');
      }
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}
      
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <CardElement options={{
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
        }}/>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Processing...</>
        ) : (
          <><Lock className="w-4 h-4 mr-2" /> Pay ${booking.total_price}</>
        )}
      </button>
    </form>
  );
};

const StripePaymentModal = ({ booking, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loadingSecret, setLoadingSecret] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const response = await api.post(`/bookings/${booking.id}/payment-intent`);
        setClientSecret(response.data.client_secret);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize payment.');
      } finally {
        setLoadingSecret(false);
      }
    };
    
    fetchIntent();
  }, [booking.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Secure Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 pb-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <h4 className="text-2xl font-bold text-gray-900">${booking.total_price}</h4>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{booking.hall?.name}</p>
              <p className="text-sm font-medium text-gray-900">Booking #{booking.id}</p>
            </div>
          </div>

          {loadingSecret ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
              <p className="text-sm text-gray-500">Initializing secure checkout...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {error}
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                booking={booking} 
                clientSecret={clientSecret} 
                onSuccess={onSuccess} 
                onClose={onClose} 
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;
