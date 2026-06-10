<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Hall;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalUsers = User::where('role', 'user')->count();
        $totalActiveUsers = Booking::distinct('user_id')->count('user_id');
        $totalHalls = Hall::count();
        $totalEarnings = Payment::sum('amount');

        // Yearly booking trend for current year
        $yearlyTrend = Booking::selectRaw('MONTH(booking_date) as month, COUNT(*) as count')
            ->whereYear('booking_date', date('Y'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $trendData = array_fill(1, 12, 0);
        foreach ($yearlyTrend as $trend) {
            $trendData[$trend->month] = $trend->count;
        }
        
        $formattedTrend = [];
        foreach ($months as $index => $name) {
            $formattedTrend[] = [
                'month' => $name,
                'bookings' => $trendData[$index + 1]
            ];
        }

        // Booking status distribution
        $bookingStatus = Booking::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Ensure all possible statuses are present
        $bookingStatusDistribution = [
            'pending' => $bookingStatus['pending'] ?? 0,
            'accepted' => $bookingStatus['accepted'] ?? 0,
            'rejected' => $bookingStatus['rejected'] ?? 0,
            'paid' => $bookingStatus['paid'] ?? 0,
        ];

        // Hall status distribution
        $hallStatus = Hall::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Harmonize key cases if database has mixed casing (e.g., 'Available', 'available')
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
            'total_users' => $totalUsers,
            'total_active_users' => $totalActiveUsers,
            'total_halls' => $totalHalls,
            'total_earnings' => (float)$totalEarnings,
            'yearly_booking_trend' => $formattedTrend,
            'booking_status_distribution' => $bookingStatusDistribution,
            'hall_status_distribution' => $hallStatusDistribution,
        ]);
    }
}
