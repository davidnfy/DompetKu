<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * List kategori yang bisa dipakai user (miliknya sendiri + default sistem),
     * opsional filter by type (income/expense).
     */
    public function index(Request $request)
    {
        $query = Category::availableFor($request->user()->id);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->orderBy('name')->get());
    }

    /**
     * User membuat kategori sendiri (bukan kategori default sistem).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'icon' => 'required|string|max:100',
            'type' => 'required|in:income,expense',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'icon' => $request->icon,
            'type' => $request->type,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Kategori berhasil ditambahkan.', 'data' => $category], 201);
    }

    /**
     * User hanya boleh update kategori miliknya sendiri (bukan kategori sistem).
     */
    public function update(Request $request, $id)
    {
        $category = Category::where('id', $id)->where('user_id', $request->user()->id)->first();

        if (! $category) {
            return response()->json(['message' => 'Kategori tidak ditemukan atau bukan milik Anda.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'icon' => 'sometimes|required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $category->update($request->only('name', 'icon'));

        return response()->json(['message' => 'Kategori berhasil diperbarui.', 'data' => $category->fresh()]);
    }

    /**
     * User hanya boleh hapus kategori miliknya sendiri.
     */
    public function destroy(Request $request, $id)
    {
        $category = Category::where('id', $id)->where('user_id', $request->user()->id)->first();

        if (! $category) {
            return response()->json(['message' => 'Kategori tidak ditemukan atau bukan milik Anda.'], 404);
        }

        if ($category->transactions()->exists()) {
            return response()->json(['message' => 'Kategori tidak bisa dihapus karena masih dipakai transaksi.'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}
