<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\HallController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;

// Add these two lines for your authentication logic
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes (or auth depending on requirements, assuming public for halls listing)
Route::get('/halls', [HallController::class, 'index']);

use App\Http\Controllers\PaymentController;

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Booking & Payment endpoints
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);
    Route::post('/bookings/{id}/payment-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);

    // Manager only endpoints
    Route::middleware('manager')->group(function () {
        Route::post('/halls', [HallController::class, 'store']);
        Route::get('/manager/bookings', [BookingController::class, 'index']);
        Route::patch('/manager/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
        Route::get('/manager/dashboard', [DashboardController::class, 'index']);
    });
});