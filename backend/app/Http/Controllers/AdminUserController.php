<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }

    public function storeManager(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'mobile' => ['required', 'string', 'regex:/^0[7][0-9]{8}$/'],
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'mobile' => $request->mobile,
            'role' => 'manager',
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Manager created successfully', 'user' => $user], 201);
    }

    public function toggleStatus(Request $request, User $user)
    {
        $user->update([
            'is_active' => !$user->is_active
        ]);

        return response()->json([
            'message' => 'User status updated successfully',
            'user' => $user
        ]);
    }
}
