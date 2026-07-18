<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    // ================= KELOLA USER =================

    /**
     * List semua user (untuk halaman admin).
     */
    public function listUsers(Request $request)
    {
        $users = User::select('id', 'name', 'username', 'role', 'created_at')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    /**
     * Admin reset password user (misal karena user lupa password
     * dan tidak bisa pakai halaman forgot-password sendiri).
     */
    public function resetUserPassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => "Password user '{$user->username}' berhasil direset."]);
    }

    /**
     * Admin hapus user (opsional, hati-hati akan menghapus transaksi & kategori miliknya via cascade).
     */
    public function destroyUser(Request $request, $id)
    {
        if ((int) $id === $request->user()->id) {
            return response()->json(['message' => 'Tidak bisa menghapus akun sendiri.'], 422);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus.']);
    }

    // ================= KELOLA KATEGORI SISTEM =================

    /**
     * List seluruh kategori (termasuk milik semua user) untuk dikelola admin.
     */
    public function listCategories()
    {
        $categories = Category::with('user:id,name,username')->orderBy('type')->orderBy('name')->get();

        return response()->json($categories);
    }

    /**
     * Admin membuat kategori default sistem (user_id = null, dipakai semua user).
     */
    public function storeCategory(Request $request)
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
            'user_id' => null,
        ]);

        return response()->json(['message' => 'Kategori sistem berhasil ditambahkan.', 'data' => $category], 201);
    }

    /**
     * Admin bisa update kategori apapun (sistem maupun milik user).
     */
    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'icon' => 'sometimes|required|string|max:100',
            'type' => 'sometimes|required|in:income,expense',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $category->update($request->only('name', 'icon', 'type'));

        return response()->json(['message' => 'Kategori berhasil diperbarui.', 'data' => $category->fresh()]);
    }

    /**
     * Admin bisa hapus kategori apapun.
     */
    public function destroyCategory($id)
    {
        $category = Category::findOrFail($id);

        if ($category->transactions()->exists()) {
            return response()->json(['message' => 'Kategori tidak bisa dihapus karena masih dipakai transaksi.'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}
