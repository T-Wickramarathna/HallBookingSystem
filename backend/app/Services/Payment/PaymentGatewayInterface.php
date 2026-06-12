<?php

namespace App\Services\Payment;

use App\Models\Booking;

interface PaymentGatewayInterface
{
    /**
     * Create a payment intent or transaction charge.
     *
     * @param Booking $booking
     * @return array Contains keys like client_secret or reference URLs
     */
    public function createPaymentIntent(Booking $booking): array;

    /**
     * Confirm the transaction attributes returned by the client response.
     *
     * @param array $payload
     * @return array Normalized status and transaction identifier
     */
    public function confirmPayment(array $payload): array;
}
