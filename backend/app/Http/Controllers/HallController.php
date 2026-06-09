<?php

namespace App\Http\Controllers;

use App\Models\Hall;
use Illuminate\Http\Request;

class HallController extends Controller
{
    public function index()
    {
        $halls = Hall::all();
        return response()->json($halls);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:available,unavailable',
            'image_path' => 'nullable|string',
        ]);

        $hall = Hall::create($validatedData);

        return response()->json([
            'message' => 'Hall created successfully',
            'hall' => $hall
        ], 201);
    }
}
