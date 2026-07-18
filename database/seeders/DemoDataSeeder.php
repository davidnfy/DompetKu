<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
   
    public function run(): void
    {
        // 1. Buat / ambil user demo (role: user)
        $user = User::firstOrCreate(
            ['username' => 'demo'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        // 1b. Buat akun admin untuk testing halaman Admin Panel
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // 2. Ambil kategori default (system-wide)
        $incomeCategories = Category::where('type', 'income')->whereNull('user_id')->get();
        $expenseCategories = Category::where('type', 'expense')->whereNull('user_id')->get();

        if ($incomeCategories->isEmpty() || $expenseCategories->isEmpty()) {
            $this->command->warn('Kategori default belum ada. Jalankan CategorySeeder terlebih dahulu.');
            return;
        }

        // Kosongkan transaksi demo lama milik user ini agar seeding idempoten
        Transaction::where('user_id', $user->id)->delete();

        $transactions = [];

        // 3. Generate transaksi untuk 30 hari terakhir (termasuk hari ini)
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            // --- Pemasukan: hanya di tanggal 1 & 15 (simulasi gajian) + kadang bonus acak ---
            if (in_array($date->day, [1, 15])) {
                $category = $incomeCategories->firstWhere('name', 'Gaji') ?? $incomeCategories->random();
                $transactions[] = [
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                    'amount' => rand(4_500_000, 6_000_000),
                    'description' => 'Gaji bulanan',
                    'transaction_date' => $date->copy()->setTime(9, 0),
                    'created_at' => now(),
                ];
            }

            // 15% kemungkinan dapat pemasukan tambahan (bonus/investasi) di hari acak
            if (rand(1, 100) <= 15) {
                $category = $incomeCategories->reject(fn ($c) => $c->name === 'Gaji')->random();
                $transactions[] = [
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                    'amount' => rand(50_000, 500_000),
                    'description' => $category->name,
                    'transaction_date' => $date->copy()->setTime(rand(8, 20), rand(0, 59)),
                    'created_at' => now(),
                ];
            }

            // --- Pengeluaran: 1-4 transaksi acak per hari ---
            $expenseCountToday = rand(1, 4);
            for ($j = 0; $j < $expenseCountToday; $j++) {
                $category = $expenseCategories->random();
                $amount = $this->randomAmountForCategory($category->name);

                $transactions[] = [
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                    'amount' => $amount,
                    'description' => $this->randomDescription($category->name),
                    'transaction_date' => $date->copy()->setTime(rand(6, 22), rand(0, 59)),
                    'created_at' => now(),
                ];
            }
        }

        // Insert massal untuk efisiensi
        foreach (array_chunk($transactions, 100) as $chunk) {
            Transaction::insert($chunk);
        }

        $this->command->info(sprintf(
            'Demo data selesai dibuat: username=%s / password=password (role user), username=admin / password=password (role admin), %d transaksi selama 30 hari.',
            $user->username,
            count($transactions)
        ));
    }

    /**
     * Nominal acak yang "masuk akal" tergantung jenis kategori.
     */
    private function randomAmountForCategory(string $categoryName): float
    {
        return match ($categoryName) {
            'Makanan & Minuman' => rand(15_000, 75_000),
            'Transportasi' => rand(10_000, 100_000),
            'Belanja' => rand(50_000, 400_000),
            'Tagihan' => rand(100_000, 800_000),
            'Hiburan' => rand(20_000, 200_000),
            'Kesehatan' => rand(30_000, 500_000),
            'Pendidikan' => rand(50_000, 300_000),
            default => rand(10_000, 150_000),
        };
    }

    private function randomDescription(string $categoryName): string
    {
        $samples = [
            'Makanan & Minuman' => ['Makan siang', 'Ngopi sore', 'Sarapan', 'Beli cemilan'],
            'Transportasi' => ['Ojek online', 'Bensin', 'Parkir', 'Tol'],
            'Belanja' => ['Belanja bulanan', 'Baju baru', 'Peralatan rumah'],
            'Tagihan' => ['Listrik', 'Internet', 'Air PDAM', 'Pulsa'],
            'Hiburan' => ['Nonton bioskop', 'Langganan streaming', 'Konser'],
            'Kesehatan' => ['Beli obat', 'Konsultasi dokter', 'Vitamin'],
            'Pendidikan' => ['Beli buku', 'Kursus online', 'Kelas tambahan'],
            'Lainnya' => ['Pengeluaran lain-lain'],
        ];

        $options = $samples[$categoryName] ?? ['Pengeluaran'];

        return $options[array_rand($options)];
    }
}
