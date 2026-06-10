<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to booking.'], 403);
        }

        if ($booking->status !== 'accepted') {
            return response()->json(['message' => 'Only accepted bookings can be paid for.'], 400);
        }

        // Use the real key from .env
        Stripe::setApiKey(env('STRIPE_SECRET', env('STRIPE_SECRET_KEY')));

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($booking->total_price * 100), // Stripe requires amount in cents
                'currency' => 'usd',
                'metadata' => ['booking_id' => $booking->id],
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        $validatedData = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'payment_intent_id' => 'required|string',
        ]);

        $booking = Booking::findOrFail($validatedData['booking_id']);

        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        // Add payment record
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'stripe_payment_id' => $validatedData['payment_intent_id'],
            'amount' => $booking->total_price,
            'status' => 'succeeded',
        ]);

        // Update booking status
        $booking->update(['status' => 'paid']);
        
        return response()->json([
            'message' => 'Payment successful and booking confirmed!',
            'payment' => $payment
        ]);
    }
}
