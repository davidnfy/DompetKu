-- =====================================================================
-- Personal Finance Tracker - Database Dump (v2)
-- Struktur tabel + kategori default (dengan ikon) + akun demo & admin.
--
-- Cara import:
--   mysql -u root -p -e "CREATE DATABASE finance_tracker;"
--   mysql -u root -p finance_tracker < finance_tracker.sql
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- Tabel: users (login pakai username, ada kolom role)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `remember_token` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabel: password_reset_tokens
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `user_id` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabel: sessions
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabel: personal_access_tokens (Laravel Sanctum)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255) NOT NULL,
  `tokenable_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `abilities` TEXT DEFAULT NULL,
  `last_used_at` TIMESTAMP NULL DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabel: categories (bisa milik sistem/user_id NULL, atau milik user)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) NOT NULL DEFAULT 'fa-tag',
  `type` ENUM('income', 'expense') NOT NULL,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categories_user_id_foreign` (`user_id`),
  CONSTRAINT `categories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabel: transactions
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `transaction_date` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `transactions_user_id_transaction_date_index` (`user_id`, `transaction_date`),
  KEY `transactions_category_id_foreign` (`category_id`),
  CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- DATA: Akun demo + admin (password sama-sama: "password")
-- Hash di bawah adalah bcrypt untuk "password"
-- =====================================================================
INSERT INTO `users` (`name`, `username`, `password`, `role`, `created_at`, `updated_at`) VALUES
('Demo User', 'demo', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW(), NOW()),
('Administrator', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW(), NOW());

-- =====================================================================
-- DATA: Kategori default (system-wide, user_id = NULL) dengan ikon menarik
-- =====================================================================

-- Kategori Pemasukan
INSERT INTO `categories` (`name`, `icon`, `type`, `user_id`, `created_at`) VALUES
('Gaji', 'fa-money-bill-wave', 'income', NULL, NOW()),
('Bonus', 'fa-gift', 'income', NULL, NOW()),
('Investasi', 'fa-chart-line', 'income', NULL, NOW()),
('Tabungan', 'fa-piggy-bank', 'income', NULL, NOW()),
('Hadiah', 'fa-hand-holding-dollar', 'income', NULL, NOW()),
('Freelance', 'fa-laptop', 'income', NULL, NOW()),
('Lainnya', 'fa-circle-plus', 'income', NULL, NOW());

-- Kategori Pengeluaran
INSERT INTO `categories` (`name`, `icon`, `type`, `user_id`, `created_at`) VALUES
('Makanan & Minuman', 'fa-utensils', 'expense', NULL, NOW()),
('Kopi & Ngemil', 'fa-mug-hot', 'expense', NULL, NOW()),
('Transportasi', 'fa-car', 'expense', NULL, NOW()),
('Bensin', 'fa-gas-pump', 'expense', NULL, NOW()),
('Motor', 'fa-motorcycle', 'expense', NULL, NOW()),
('Belanja', 'fa-cart-shopping', 'expense', NULL, NOW()),
('Pakaian', 'fa-shirt', 'expense', NULL, NOW()),
('Tagihan Listrik', 'fa-bolt', 'expense', NULL, NOW()),
('Tagihan Air', 'fa-droplet', 'expense', NULL, NOW()),
('Internet & Pulsa', 'fa-wifi', 'expense', NULL, NOW()),
('Hiburan', 'fa-film', 'expense', NULL, NOW()),
('Game', 'fa-gamepad', 'expense', NULL, NOW()),
('Kesehatan', 'fa-briefcase-medical', 'expense', NULL, NOW()),
('Obat', 'fa-pills', 'expense', NULL, NOW()),
('Pendidikan', 'fa-graduation-cap', 'expense', NULL, NOW()),
('Rumah', 'fa-house', 'expense', NULL, NOW()),
('Hewan Peliharaan', 'fa-paw', 'expense', NULL, NOW()),
('Olahraga', 'fa-dumbbell', 'expense', NULL, NOW()),
('Liburan', 'fa-plane-departure', 'expense', NULL, NOW()),
('Lainnya', 'fa-circle-minus', 'expense', NULL, NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- CATATAN:
-- Login dengan salah satu akun berikut (password sama: "password"):
--   username: demo   -> role user   (belum ada data transaksi di dump ini)
--   username: admin  -> role admin  (bisa akses Admin Panel)
--
-- Untuk transaksi dummy 30 hari otomatis, gunakan seeder Artisan:
--   php artisan db:seed --class=DemoDataSeeder
-- =====================================================================
