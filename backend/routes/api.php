<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\ProfileController;
Route::put('/profile', [ProfileController::class, 'update'])->middleware('auth:sanctum');

use App\Http\Controllers\HallController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;

// Add these two lines for your authentication logic
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes (or auth depending on requirements, assuming public for halls listing)
Route::get('/halls', [HallController::class, 'index']);

// Protected User Routes (Bookings & Payments)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);
    Route::post('/bookings/{id}/payment-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);
});

// Protected Manager Routes
Route::middleware(['auth:sanctum', 'manager'])->group(function () {
    Route::post('/halls', [HallController::class, 'store']);
    Route::put('/halls/{hall}', [HallController::class, 'update']);
    Route::delete('/halls/{hall}', [HallController::class, 'destroy']);
    Route::get('/manager/bookings', [BookingController::class, 'index']);
    Route::patch('/manager/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    Route::get('/manager/dashboard', [DashboardController::class, 'index']);
});

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminHallController;
use App\Http\Controllers\AdminBookingController;

// Protected Admin Routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/managers', [AdminUserController::class, 'storeManager']);
    Route::patch('/admin/users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus']);
    
    // Admin Hall CRUD
    Route::post('/admin/halls', [AdminHallController::class, 'store']);
    Route::put('/admin/halls/{hall}', [AdminHallController::class, 'update']);
    Route::delete('/admin/halls/{hall}', [AdminHallController::class, 'destroy']);
    
    // Admin Bookings
    Route::get('/admin/bookings', [AdminBookingController::class, 'index']);
    Route::patch('/admin/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus']);
});