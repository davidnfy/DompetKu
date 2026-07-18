<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'code',
        'type',
        'expires_at',
        'used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean',
    ];

    /**
     * Scope to only include non-expired OTP codes.
     */
    public function scopeNotExpired($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Scope to only include unused OTP codes.
     */
    public function scopeNotUsed($query)
    {
        return $query->where('used', false);
    }

    /**
     * Generate OTP code for email and type.
     */
    public static function generateFor(string $email, string $type): string
    {
        // Invalidate older unused OTPs for this email and type
        self::where('email', $email)
            ->where('type', $type)
            ->where('used', false)
            ->update(['used' => true]);

        // Generate 6 digit numeric code
        $code = sprintf("%06d", mt_rand(0, 999999));

        self::create([
            'email' => $email,
            'code' => $code,
            'type' => $type,
            'expires_at' => now()->addMinutes(5), // 5 minutes expiry
            'used' => false,
        ]);

        return $code;
    }

    /**
     * Verify code for email and type.
     */
    public static function verifyCode(string $email, string $code, string $type): bool
    {
        // Admin email bypass simulation or strict match
        $otp = self::where('email', $email)
            ->where('code', $code)
            ->where('type', $type)
            ->notExpired()
            ->notUsed()
            ->first();

        if ($otp) {
            $otp->update(['used' => true]);
            return true;
        }

        return false;
    }
}
