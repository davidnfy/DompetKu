<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Semua request non-API (selain /api/*) diarahkan ke SPA React.
| React Router (BrowserRouter) yang menangani routing halaman
| seperti /login, /dashboard, /income, /expense di sisi client.
|
*/

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
