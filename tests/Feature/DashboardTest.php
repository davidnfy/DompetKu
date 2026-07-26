<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_retrieves_correct_data_with_date_range(): void
    {
        // 1. Setup User dan Autentikasi
        $user = User::factory()->create();
        
        // 2. Setup Kategori
        $incomeCategory = Category::create([
            'name' => 'Gaji',
            'icon' => 'fa-wallet',
            'type' => 'income',
            'user_id' => $user->id,
        ]);

        $expenseCategory = Category::create([
            'name' => 'Makanan',
            'icon' => 'fa-utensils',
            'type' => 'expense',
            'user_id' => $user->id,
        ]);

        // 3. Setup Transaksi pada tanggal-tanggal tertentu
        // Tanggal uji: 1 Juli s/d 24 Juli (rentang 24 hari)
        // Transaksi di dalam rentang
        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $incomeCategory->id,
            'amount' => 5000000,
            'transaction_date' => '2026-07-01 10:00:00',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $expenseCategory->id,
            'amount' => 100000,
            'transaction_date' => '2026-07-05 12:00:00',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $expenseCategory->id,
            'amount' => 200000,
            'transaction_date' => '2026-07-10 18:30:00',
        ]);

        // Transaksi di luar rentang (seharusnya diabaikan)
        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $expenseCategory->id,
            'amount' => 500000,
            'transaction_date' => '2026-07-25 15:00:00',
        ]);

        // 4. Request API Dashboard dengan parameter tanggal
        $response = $this->actingAs($user)
            ->getJson('/api/dashboard?start_date=2026-07-01&end_date=2026-07-24');

        // 5. Assertions
        $response->assertStatus(200);
        
        $data = $response->json();
        
        $this->assertEquals(24, $data['period_days']);
        $this->assertEquals(5000000, $data['total_income']);
        $this->assertEquals(300000, $data['total_expense']); // 100rb + 200rb (500rb diabaikan karena tanggal 25)
        $this->assertEquals(4700000, $data['balance']);
        
        // Rata-rata harian: total / 24 hari
        $this->assertEquals(round(300000 / 24, 2), $data['average_daily_expense']);
        $this->assertEquals(round(5000000 / 24, 2), $data['average_daily_income']);
        
        // Tren harian harus memiliki 24 elemen (1 Juli - 24 Juli)
        $this->assertCount(24, $data['daily_trend']);
        
        // Cek breakdown kategori pengeluaran
        $this->assertCount(1, $data['category_breakdown']);
        $this->assertEquals('Makanan', $data['category_breakdown'][0]['category_name']);
        $this->assertEquals(300000, $data['category_breakdown'][0]['total_amount']);
    }

    public function test_dashboard_uses_default_fallback_with_invalid_date_range(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/dashboard?start_date=invalid-date&end_date=2026-07-24');

        $response->assertStatus(200);
        
        // Seharusnya fallback ke default 7 hari terakhir
        $this->assertEquals(7, $response->json('period_days'));
    }
}
