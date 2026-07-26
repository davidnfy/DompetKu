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

    public function scopeNotExpired($query)
    {
        return $query->where('expires_at', '>', now());
    }

    public function scopeNotUsed($query)
    {
        return $query->where('used', false);
    }

    public static function generateFor(string $email, string $type): string
    {
        self::where('email', $email)
            ->where('type', $type)
            ->where('used', false)
            ->update(['used' => true]);

        $code = sprintf("%06d", mt_rand(0, 999999));

        self::create([
            'email' => $email,
            'code' => $code,
            'type' => $type,
            'expires_at' => now()->addMinutes(5),
            'used' => false,
        ]);

        return $code;
    }

    public static function verifyCode(string $email, string $code, string $type): bool
    {
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