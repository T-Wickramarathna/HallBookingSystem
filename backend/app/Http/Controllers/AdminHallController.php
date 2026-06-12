<?php

namespace App\Http\Controllers;

use App\Models\Hall;
use Illuminate\Http\Request;

class AdminHallController extends Controller
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
            'status' => 'nullable|string|in:available,unavailable,maintenance',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('halls', 'public');
            $validatedData['image_path'] = $path;
        }

        $hall = Hall::create($validatedData);

        return response()->json([
            'message' => 'Hall created successfully',
            'hall' => $hall
        ], 201);
    }

    public function update(Request $request, Hall $hall)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:available,unavailable,maintenance',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($hall->image_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($hall->image_path);
            }
            $path = $request->file('image')->store('halls', 'public');
            $validatedData['image_path'] = $path;
        }

        $hall->update($validatedData);

        return response()->json([
            'message' => 'Hall updated successfully',
            'hall' => $hall
        ]);
    }

    public function destroy(Hall $hall)
    {
        if ($hall->image_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($hall->image_path);
        }
        $hall->delete();

        return response()->json(['message' => 'Hall deleted successfully']);
    }
}
