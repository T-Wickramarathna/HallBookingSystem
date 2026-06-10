<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Hall;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with(['user', 'hall'])->get();
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'hall_id' => 'required|exists:halls,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'seats_booked' => 'required|integer|min:1',
        ]);

        $hall = Hall::findOrFail($validated['hall_id']);

        if ($validated['seats_booked'] > $hall->capacity) {
            return response()->json([
                'message' => 'The number of seats booked cannot exceed the hall\'s maximum capacity (' . $hall->capacity . ').'
            ], 422);
        }

        // Today's bookings must not be in the past
        if ($validated['booking_date'] === date('Y-m-d')) {
            $currentTime = date('H:i');
            if ($validated['start_time'] < $currentTime) {
                return response()->json([
                    'message' => 'The start time cannot be in the past for today\'s booking.'
                ], 422);
            }
        }

        // Calculate total price
        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $durationHours = $start->diffInMinutes($end) / 60.0;
        $totalPrice = $durationHours * $hall->price;

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'hall_id' => $validated['hall_id'],
            'booking_date' => $validated['booking_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'seats_booked' => $validated['seats_booked'],
            'total_price' => $totalPrice,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Booking request submitted successfully!',
            'booking' => $booking->load('hall')
        ], 201);
    }

    public function myBookings(Request $request)
    {
        $bookings = Booking::with('hall')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
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
