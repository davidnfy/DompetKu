<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\OtpCode;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    private const ADMIN_EMAIL = 'mail.dompetku@gmail.com';
    /**
     * Send OTP to target email.
     */
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'type' => 'required|in:login,register,reset',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Format email tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $type = $request->type;

        // Validations for specific types
        if ($type === 'register') {
            $exists = User::where('email', $email)->exists();
            if ($exists) {
                return response()->json(['message' => 'Email sudah terdaftar. Silakan login.'], 422);
            }
        } elseif ($type === 'login' || $type === 'reset') {
            $exists = User::where('email', $email)->exists();
            if (!$exists) {
                // If it is admin login attempt, we might allow it or create admin if needed. 
                // But admin account usually exists already via DB Seeder.
                return response()->json(['message' => 'Email tidak ditemukan.'], 404);
            }
        }

        try {
            // Generate OTP
            $code = OtpCode::generateFor($email, $type);

            // Send OTP through the configured SMTP mailer.
            Mail::to($email)->send(new OtpMail($code, $type));

            return response()->json([
                'message' => 'Kode OTP berhasil dikirim ke email Anda.',
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mengirim email OTP: ' . $e->getMessage());

            return response()->json([
                'message' => 'Gagal mengirim kode OTP. Periksa konfigurasi email Anda.',
            ], 500);
        }
    }

    /**
     * Registrasi user baru menggunakan email + kode OTP.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|alpha_dash|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
            'password_confirmation' => 'required|same:password',
            'code' => 'required|string|size:6',
        ], [
            'password.regex' => 'Password minimal 8 karakter dan mengandung kombinasi huruf dan angka.',
            'password_confirmation.same' => 'Konfirmasi password tidak cocok.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi registrasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));

        // Verify OTP code
        if (!OtpCode::verifyCode($email, $request->code, 'register')) {
            return response()->json(['message' => 'Kode OTP salah atau sudah kedaluwarsa.'], 422);
        }

        // Generate passwordless hash or default secure password since Laravel authenticates with password.
        // Actually, we can login directly via email OTP without password later.
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $email,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(),
            'role' => 'user',
        ]);


        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login memakai email + kode OTP.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'code' => 'nullable|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi login gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan.'], 404);
        }

        // Verify password first
        if (!$request->filled('password') || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Password salah atau tidak valid.'], 401);
        }

        // If no OTP code provided, generate and send one (two-step login)
        if (!$request->filled('code')) {
            try {
                $code = OtpCode::generateFor($email, 'login');
                Mail::to($email)->send(new OtpMail($code, 'login'));
                return response()->json([
                    'message' => 'Kode OTP dikirim ke email Anda.',
                    'debug_code' => $code ?? null,
                ]);
            } catch (\Exception $e) {
                Log::error('Gagal mengirim OTP saat login: ' . $e->getMessage());
                return response()->json(['message' => 'Gagal mengirim kode OTP.'], 500);
            }
        }

        // If OTP code provided, verify it and issue token
        if (!OtpCode::verifyCode($email, $request->code, 'login')) {
            return response()->json(['message' => 'Kode OTP salah atau sudah kedaluwarsa.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update profil (nama & username) milik user yang sedang login.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|alpha_dash|unique:users,username,' . $user->id,
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update([
            'name' => $request->name,
            'username' => $request->username,
            'email' => strtolower(trim($request->email)),
        ]);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Ganti password (tidak wajib karena login pakai OTP, tapi tetap kita sediakan template).
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama tidak sesuai.',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password berhasil diganti.']);
    }

    /**
     * Cek apakah email terdaftar (dipakai di halaman Lupa Password / Reset Password).
     */
    public function checkUsername(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $email = strtolower(trim($request->email));
        $exists = User::where('email', $email)->exists();

        if (!$exists) {
            return response()->json(['message' => 'Email tidak ditemukan.'], 404);
        }

        return response()->json(['message' => 'Email ditemukan.']);
    }

    /**
     * Reset password menggunakan email OTP.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/', 'confirmed'],
        ], [
            'password.regex' => 'Password minimal 8 karakter dan mengandung kombinasi huruf dan angka.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));

        // Validate reset token issued after OTP verification
        $cachedEmail = Cache::pull('pwd_reset:' . $request->token);
        if (!$cachedEmail || $cachedEmail !== $email) {
            return response()->json(['message' => 'Token reset tidak valid atau sudah kedaluwarsa.'], 422);
        }

        $user = User::where('email', $email)->firstOrFail();
        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password berhasil direset. Silakan login.']);
    }

    /**
     * Verify OTP for reset flow and issue a short-lived reset token.
     */
    public function verifyResetCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));

        if (!OtpCode::verifyCode($email, $request->code, 'reset')) {
            return response()->json(['message' => 'Kode OTP salah atau sudah kedaluwarsa.'], 422);
        }

        $token = Str::random(64);
        Cache::put('pwd_reset:' . $token, $email, now()->addMinutes(10));

        return response()->json([
            'message' => 'Kode terverifikasi. Silakan lanjut buat password baru.',
            'token' => $token,
        ]);
    }
}

