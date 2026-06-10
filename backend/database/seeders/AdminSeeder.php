<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'mobile' => '0700000000',
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
