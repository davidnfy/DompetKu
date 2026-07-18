<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShoppingItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShoppingListController extends Controller
{
    /**
     * Display a listing of the shopping items.
     */
    public function index(Request $request)
    {
        $items = ShoppingItem::where('user_id', $request->user()->id)
            ->orderBy('is_checked', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($items);
    }

    /**
     * Store a newly created shopping item in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $item = ShoppingItem::create([
            'user_id' => $request->user()->id,
            'name' => trim($request->name),
            'price' => $request->price,
            'quantity' => $request->quantity,
            'is_checked' => false,
        ]);

        return response()->json([
            'message' => 'Barang berhasil ditambahkan.',
            'item' => $item,
        ], 201);
    }

    /**
     * Update the specified shopping item.
     */
    public function update(Request $request, $id)
    {
        $item = ShoppingItem::where('user_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'quantity' => 'sometimes|required|integer|min:1',
            'is_checked' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $item->update($request->only('name', 'price', 'quantity', 'is_checked'));

        return response()->json([
            'message' => 'Barang berhasil diperbarui.',
            'item' => $item->fresh(),
        ]);
    }

    /**
     * Remove the specified shopping item.
     */
    public function destroy(Request $request, $id)
    {
        $item = ShoppingItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->delete();

        return response()->json([
            'message' => 'Barang berhasil dihapus.',
        ]);
    }

    /**
     * Toggle status of the shopping item.
     */
    public function toggle(Request $request, $id)
    {
        $item = ShoppingItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->update(['is_checked' => !$item->is_checked]);

        return response()->json([
            'message' => 'Status barang berhasil diubah.',
            'item' => $item,
        ]);
    }

    /**
     * Clear all checked shopping items.
     */
    public function clearChecked(Request $request)
    {
        ShoppingItem::where('user_id', $request->user()->id)
            ->where('is_checked', true)
            ->delete();

        return response()->json([
            'message' => 'Semua barang yang selesai dibeli telah dihapus.',
        ]);
    }
}
