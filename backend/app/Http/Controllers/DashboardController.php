<?php

namespace App\Http\Controllers;

use App\Models\Hall;
use App\Models\Booking;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalHalls = Hall::count();
        $totalActiveBookings = Booking::whereIn('status', ['pending', 'accepted'])->count();
        
        return response()->json([
            'total_halls' => $totalHalls,
            'total_active_bookings' => $totalActiveBookings,
        ]);
    }
}
