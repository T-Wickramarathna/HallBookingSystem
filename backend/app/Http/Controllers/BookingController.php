<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with(['user', 'hall'])->get();
        return response()->json($bookings);
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $validatedData = $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $booking->update(['status' => $validatedData['status']]);

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking
        ]);
    }
}
