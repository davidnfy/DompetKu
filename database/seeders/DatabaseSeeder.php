<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,

            // Aktif secara default supaya langsung ada akun demo (user) +
            // akun admin untuk testing Admin Panel:
            //   username: demo   / password: password  (role user)
            //   username: admin  / password: password  (role admin)
            DemoDataSeeder::class,
        ]);
    }
}
