<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Hall;
use App\Models\User;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_payment_intent_and_confirm_payment()
    {
        $user = User::factory()->create();

        $hall = Hall::create([
            'name' => 'Grand Ballroom',
            'location' => 'Main Wing, 1st Floor',
            'capacity' => 250,
            'price' => 150.00,
            'status' => 'available',
        ]);

        $booking = Booking::create([
            'user_id' => $user->id,
            'hall_id' => $hall->id,
            'status' => 'accepted',
            'booking_date' => '2026-07-15',
            'start_time' => '10:00:00',
            'end_time' => '18:00:00',
            'seats_booked' => 200,
            'total_price' => 150.00,
        ]);

        // Mock PaymentGatewayInterface
        $mockGateway = $this->mock(PaymentGatewayInterface::class);
        $mockGateway->shouldReceive('createPaymentIntent')
            ->once()
            ->with(\Mockery::on(function ($arg) use ($booking) {
                return $arg->id === $booking->id;
            }))
            ->andReturn(['client_secret' => 'pi_test_secret_123']);

        $mockGateway->shouldReceive('confirmPayment')
            ->once()
            ->with([
                'booking_id' => $booking->id,
                'payment_intent_id' => 'pi_test_secret_123',
            ])
            ->andReturn([
                'transaction_id' => 'pi_test_secret_123',
                'status' => 'succeeded',
            ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/bookings/{$booking->id}/payment-intent");

        $response->assertStatus(200)
            ->assertJson(['client_secret' => 'pi_test_secret_123']);

        $responseConfirm = $this->actingAs($user, 'sanctum')
            ->postJson('/api/payments/confirm', [
                'booking_id' => $booking->id,
                'payment_intent_id' => 'pi_test_secret_123',
            ]);

        $responseConfirm->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Payment successful and booking confirmed!',
            ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'transaction_id' => 'pi_test_secret_123',
            'amount' => 150.00,
            'status' => 'succeeded',
        ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'paid',
        ]);
    }

    public function test_admin_and_manager_cannot_update_status_of_paid_booking()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $manager = User::factory()->create(['role' => 'manager']);
        $user = User::factory()->create();

        $hall = Hall::create([
            'name' => 'Grand Ballroom',
            'location' => 'Main Wing, 1st Floor',
            'capacity' => 250,
            'price' => 150.00,
            'status' => 'available',
        ]);

        $booking = Booking::create([
            'user_id' => $user->id,
            'hall_id' => $hall->id,
            'status' => 'paid',
            'booking_date' => '2026-07-15',
            'start_time' => '10:00:00',
            'end_time' => '18:00:00',
            'seats_booked' => 200,
            'total_price' => 150.00,
        ]);

        // Attempt status update as Admin
        $responseAdmin = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/bookings/{$booking->id}/status", [
                'status' => 'accepted',
            ]);

        $responseAdmin->assertStatus(400)
            ->assertJsonFragment([
                'message' => 'Cannot update the status of a paid booking.',
            ]);

        // Attempt status update as Manager
        $responseManager = $this->actingAs($manager, 'sanctum')
            ->patchJson("/api/manager/bookings/{$booking->id}/status", [
                'status' => 'accepted',
            ]);

        $responseManager->assertStatus(400)
            ->assertJsonFragment([
                'message' => 'Cannot update the status of a paid booking.',
            ]);

        // Status should remain 'paid' in DB
        $this->assertEquals('paid', $booking->fresh()->status);
    }
}
