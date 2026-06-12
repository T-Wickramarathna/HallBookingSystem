<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Hall;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $users = User::all();
        $total_users = $users->count();
        $active_user_count = $users->where('is_active', true)->count();
        $deactive_user_count = $users->where('is_active', false)->count();
        $total_managers = $users->where('role', 'manager')->count();

        $total_halls = Hall::count();

        // Calculate total earnings from actual payments in the database
        $total_earnings = Payment::sum('amount');

        // Bookings overview
        $bookings_overview = Booking::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Monthly bookings for the last 12 months
        $monthly_bookings = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $count = Booking::whereMonth('created_at', $month->month)
                ->whereYear('created_at', $month->year)
                ->count();
            
            $monthly_bookings[] = [
                'month' => $month->format('M Y'),
                'count' => $count
            ];
        }

        $hallOccupancyRaw = Booking::join('halls', 'bookings.hall_id', '=', 'halls.id')
            ->select('halls.name', DB::raw('COUNT(*) as value'))
            ->groupBy('halls.name')
            ->get();

        // Hall status distribution
        $hallStatus = Hall::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        $hallStatusDistribution = [
            'available' => 0,
            'unavailable' => 0,
        ];
        foreach ($hallStatus as $status => $count) {
            $normalized = strtolower($status);
            if (array_key_exists($normalized, $hallStatusDistribution)) {
                $hallStatusDistribution[$normalized] += $count;
            } else {
                $hallStatusDistribution[$normalized] = $count;
            }
        }

        return response()->json([
            'total_users' => $total_users,
            'active_user_count' => $active_user_count,
            'deactive_user_count' => $deactive_user_count,
            'total_managers' => $total_managers,
            'total_halls' => $total_halls,
            'total_earnings' => $total_earnings,
            'bookings_overview' => $bookings_overview,
            'monthly_bookings' => $monthly_bookings,
            'hall_occupancy' => $hallOccupancyRaw,
            'hall_status_distribution' => $hallStatusDistribution,
        ]);
    }
}
