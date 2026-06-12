<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'hall_id',
        'status',
        'booking_date',
        'start_time',
        'end_time',
        'seats_booked',
        'total_price',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function hall()
    {
        return $this->belongsTo(Hall::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
