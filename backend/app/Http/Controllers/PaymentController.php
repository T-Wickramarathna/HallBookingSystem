<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * The payment gateway implementation resolved by the service container.
     * Equivalent to @Autowired in Spring Boot — Laravel injects this automatically.
     */
    public function __construct(private PaymentGatewayInterface $paymentGateway)
    {
    }

    public function createPaymentIntent(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to booking.'], 403);
        }

        if ($booking->status !== 'accepted') {
            return response()->json(['message' => 'Only accepted bookings can be paid for.'], 400);
        }

        try {
            $result = $this->paymentGateway->createPaymentIntent($booking);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::findOrFail($request->input('booking_id'));

        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        try {
            $confirmed = $this->paymentGateway->confirmPayment($request->all());

            // Add payment record
            $payment = Payment::create([
                'booking_id'     => $booking->id,
                'transaction_id' => $confirmed['transaction_id'],
                'amount'         => $booking->total_price,
                'status'         => $confirmed['status'] ?? 'succeeded',
            ]);

            // Update booking status
            $booking->update(['status' => 'paid']);

            return response()->json([
                'message' => 'Payment successful and booking confirmed!',
                'payment' => $payment,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
