<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed kategori default (system-wide, user_id = null)
     * agar setiap user baru langsung punya pilihan kategori dengan ikon menarik.
     */
    public function run(): void
    {
        $categories = [
            // ==== Kategori Pemasukan ====
            ['name' => 'Gaji', 'icon' => 'fa-money-bill-wave', 'type' => 'income'],
            ['name' => 'Bonus', 'icon' => 'fa-gift', 'type' => 'income'],
            ['name' => 'Investasi', 'icon' => 'fa-chart-line', 'type' => 'income'],
            ['name' => 'Tabungan', 'icon' => 'fa-piggy-bank', 'type' => 'income'],
            ['name' => 'Hadiah', 'icon' => 'fa-hand-holding-dollar', 'type' => 'income'],
            ['name' => 'Freelance', 'icon' => 'fa-laptop', 'type' => 'income'],
            ['name' => 'Lainnya', 'icon' => 'fa-circle-plus', 'type' => 'income'],

            // ==== Kategori Pengeluaran ====
            ['name' => 'Makanan & Minuman', 'icon' => 'fa-utensils', 'type' => 'expense'],
            ['name' => 'Kopi & Ngemil', 'icon' => 'fa-mug-hot', 'type' => 'expense'],
            ['name' => 'Transportasi', 'icon' => 'fa-car', 'type' => 'expense'],
            ['name' => 'Bensin', 'icon' => 'fa-gas-pump', 'type' => 'expense'],
            ['name' => 'Motor', 'icon' => 'fa-motorcycle', 'type' => 'expense'],
            ['name' => 'Belanja', 'icon' => 'fa-cart-shopping', 'type' => 'expense'],
            ['name' => 'Pakaian', 'icon' => 'fa-shirt', 'type' => 'expense'],
            ['name' => 'Tagihan Listrik', 'icon' => 'fa-bolt', 'type' => 'expense'],
            ['name' => 'Tagihan Air', 'icon' => 'fa-droplet', 'type' => 'expense'],
            ['name' => 'Internet & Pulsa', 'icon' => 'fa-wifi', 'type' => 'expense'],
            ['name' => 'Hiburan', 'icon' => 'fa-film', 'type' => 'expense'],
            ['name' => 'Game', 'icon' => 'fa-gamepad', 'type' => 'expense'],
            ['name' => 'Kesehatan', 'icon' => 'fa-briefcase-medical', 'type' => 'expense'],
            ['name' => 'Obat', 'icon' => 'fa-pills', 'type' => 'expense'],
            ['name' => 'Pendidikan', 'icon' => 'fa-graduation-cap', 'type' => 'expense'],
            ['name' => 'Rumah', 'icon' => 'fa-house', 'type' => 'expense'],
            ['name' => 'Hewan Peliharaan', 'icon' => 'fa-paw', 'type' => 'expense'],
            ['name' => 'Olahraga', 'icon' => 'fa-dumbbell', 'type' => 'expense'],
            ['name' => 'Liburan', 'icon' => 'fa-plane-departure', 'type' => 'expense'],
            ['name' => 'Lainnya', 'icon' => 'fa-circle-minus', 'type' => 'expense'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
