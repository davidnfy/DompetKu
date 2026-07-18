<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard?days=7|14|21|30
     *
     * Mengembalikan ringkasan keuangan untuk periode N hari terakhir
     * (termasuk hari ini), dipakai untuk mengisi seluruh widget dashboard.
     */
    public function index(Request $request)
    {
        $allowedDays = [7, 14, 21, 30];
        $days = (int) $request->query('days', 7);

        if (! in_array($days, $allowedDays, true)) {
            $days = 7;
        }

        $userId = $request->user()->id;

        // Periode: dari (hari ini - (days-1)) jam 00:00:00 s/d hari ini jam 23:59:59
        // Sehingga "7 Hari" benar-benar mencakup 7 hari kalender termasuk hari ini.
        $endDate = Carbon::now()->endOfDay();
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();

        $transactions = Transaction::with('category')
            ->where('user_id', $userId)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->get();

        $incomeTransactions = $transactions->filter(fn ($t) => $t->category->type === 'income');
        $expenseTransactions = $transactions->filter(fn ($t) => $t->category->type === 'expense');

        $totalIncome = (float) $incomeTransactions->sum('amount');
        $totalExpense = (float) $expenseTransactions->sum('amount');
        $balance = $totalIncome - $totalExpense;

        // Hindari division by zero: jika tidak ada pemasukan, persentase = 0
        $remainingPercentage = $totalIncome > 0 ? round(($balance / $totalIncome) * 100, 2) : 0;
        $expensePercentage = $totalIncome > 0 ? round(($totalExpense / $totalIncome) * 100, 2) : 0;

        return response()->json([
            'period_days' => $days,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'balance' => $balance,
            'remaining_percentage' => $remainingPercentage,
            'expense_percentage' => $expensePercentage,
            'average_daily_expense' => round($totalExpense / $days, 2),
            'average_daily_income' => round($totalIncome / $days, 2),
            'category_breakdown' => $this->buildCategoryBreakdown($expenseTransactions, $totalExpense),
            'daily_trend' => $this->buildDailyTrend($transactions, $startDate, $endDate),
        ]);
    }

    /**
     * Rincian per kategori pengeluaran untuk donut chart.
     */
    private function buildCategoryBreakdown($expenseTransactions, float $totalExpense): array
    {
        $grouped = $expenseTransactions->groupBy('category_id');

        $breakdown = $grouped->map(function ($items) use ($totalExpense) {
            $category = $items->first()->category;
            $categoryTotal = (float) $items->sum('amount');

            return [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'icon' => $category->icon,
                'total_amount' => $categoryTotal,
                'percentage' => $totalExpense > 0 ? round(($categoryTotal / $totalExpense) * 100, 2) : 0,
            ];
        })->values();

        // Urutkan dari pengeluaran terbesar
        return $breakdown->sortByDesc('total_amount')->values()->all();
    }

    /**
     * Tren harian income vs expense untuk line chart.
     * Memastikan setiap hari dalam periode muncul walau nilainya 0 (tidak ada transaksi).
     */
    private function buildDailyTrend($transactions, Carbon $startDate, Carbon $endDate): array
    {
        // Inisialisasi semua tanggal dalam periode dengan nilai 0
        $trend = [];
        $cursor = $startDate->copy();
        while ($cursor->lte($endDate)) {
            $dateKey = $cursor->toDateString();
            $trend[$dateKey] = [
                'date' => $dateKey,
                'income' => 0.0,
                'expense' => 0.0,
            ];
            $cursor->addDay();
        }

        // Akumulasi transaksi ke tanggal masing-masing (berdasarkan tanggal, jam diabaikan)
        foreach ($transactions as $transaction) {
            $dateKey = Carbon::parse($transaction->transaction_date)->toDateString();

            if (! isset($trend[$dateKey])) {
                continue; // safety, seharusnya tidak terjadi karena sudah difilter whereBetween
            }

            if ($transaction->category->type === 'income') {
                $trend[$dateKey]['income'] += (float) $transaction->amount;
            } else {
                $trend[$dateKey]['expense'] += (float) $transaction->amount;
            }
        }

        return array_values($trend);
    }
}
