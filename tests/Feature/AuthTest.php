<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\OtpCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $email = 'budi@example.com';
        $code = OtpCode::generateFor($email, 'register');

        $response = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'username' => 'budisantoso',
            'email' => $email,
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'code' => $code,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'user', 'token']);
    }

    public function test_user_can_login(): void
    {
        $email = 'test@example.com';
        User::factory()->create([
            'username' => 'testuser',
            'email' => $email,
            'password' => Hash::make('Password123'),
        ]);

        $code = OtpCode::generateFor($email, 'login');

        $response = $this->postJson('/api/login', [
            'email' => $email,
            'password' => 'Password123',
            'code' => $code,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user', 'token']);
    }

    public function test_admin_can_login_without_additional_verification(): void
    {
        User::factory()->create([
            'name' => 'Administrator',
            'username' => 'admin',
            'email' => 'mail.dompetku@gmail.com',
            'password' => Hash::make('Password123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'mail.dompetku@gmail.com',
            'password' => 'Password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user', 'token']);
    }

    public function test_otp_send_fails_without_local_fallback_when_email_delivery_errors(): void
    {
        Mail::shouldReceive('to')->andThrow(new \Exception('SMTP unavailable'));

        $response = $this->postJson('/api/send-otp', [
            'email' => 'budi@example.com',
            'type' => 'register',
        ]);

        $response->assertStatus(500)
            ->assertJsonMissing(['debug_code'])
            ->assertJson(['message' => 'Gagal mengirim kode OTP. Periksa konfigurasi email Anda.']);
    }

    public function test_dashboard_requires_authentication(): void
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(401);
    }
}

