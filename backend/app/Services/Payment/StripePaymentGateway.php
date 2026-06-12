<?php

namespace App\Services\Payment;

use App\Models\Booking;
use Stripe\Stripe;
use Stripe\PaymentIntent as StripeIntent;

class StripePaymentGateway implements PaymentGatewayInterface
{
    public function __construct()
    {
        // Load keys inside the constructor, equivalent to PostConstruct loading in Java
        Stripe::setApiKey(env('STRIPE_SECRET', env('STRIPE_SECRET_KEY')));
    }

    /**
     * Create payment intent with Stripe API.
     */
    public function createPaymentIntent(Booking $booking): array
    {
        $intent = StripeIntent::create([
            'amount' => (int) ($booking->total_price * 100), // Stripe uses cents
            'currency' => 'usd',
            'metadata' => ['booking_id' => $booking->id],
        ]);

        return [
            'client_secret' => $intent->client_secret,
        ];
    }

    /**
     * Confirm Stripe payment credentials transaction.
     */
    public function confirmPayment(array $payload): array
    {
        if (empty($payload['payment_intent_id'])) {
            throw new \InvalidArgumentException('Payment intent ID is required for Stripe payments.');
        }

        return [
            'transaction_id' => $payload['payment_intent_id'],
            'status' => 'succeeded',
        ];
    }
}
