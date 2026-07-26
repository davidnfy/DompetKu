<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $startDateStr = $request->query('start_date');
        $endDateStr = $request->query('end_date');

        if ($startDateStr && $endDateStr) {
            try {
                $startDate = Carbon::parse($startDateStr)->startOfDay();
                $endDate = Carbon::parse($endDateStr)->endOfDay();
                $days = (int) $startDate->diffInDays($endDate) + 1;
                if ($days <= 0) {
                    $days = 1;
                }
            } catch (\Exception $e) {
                $days = 7;
                $endDate = Carbon::now()->endOfDay();
                $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
            }
        } else {
            $days = (int) $request->query('days', 7);
            $allowedDays = [7, 14, 21, 30];
            if (! in_array($days, $allowedDays, true)) {
                $days = 7;
            }
            $endDate = Carbon::now()->endOfDay();
            $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        }

        $transactions = Transaction::with('category')
            ->where('user_id', $userId)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->get();

        $incomeTransactions = $transactions->filter(fn ($t) => $t->category->type === 'income');
        $expenseTransactions = $transactions->filter(fn ($t) => $t->category->type === 'expense');

        $totalIncome = (float) $incomeTransactions->sum('amount');
        $totalExpense = (float) $expenseTransactions->sum('amount');
        $balance = $totalIncome - $totalExpense;

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

        return $breakdown->sortByDesc('total_amount')->values()->all();
    }

    private function buildDailyTrend($transactions, Carbon $startDate, Carbon $endDate): array
    {
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

        foreach ($transactions as $transaction) {
            $dateKey = Carbon::parse($transaction->transaction_date)->toDateString();

            if (! isset($trend[$dateKey])) {
                continue;
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
