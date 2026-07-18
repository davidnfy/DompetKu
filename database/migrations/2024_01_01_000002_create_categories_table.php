<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            // Nama icon Font Awesome, contoh: 'fa-utensils', 'fa-car'
            $table->string('icon')->default('fa-tag');
            $table->enum('type', ['income', 'expense']);
            // user_id nullable = kategori default sistem (dipakai semua user)
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
