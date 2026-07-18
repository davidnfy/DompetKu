<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Catatan: Kita TIDAK memakai $middleware->statefulApi() di sini.
        // Autentikasi API pada project ini memakai Bearer Token (Sanctum
        // Personal Access Token), bukan cookie-based SPA session.
        // Mengaktifkan statefulApi() akan memaksa request /api/* dari
        // domain yang sama untuk lewat middleware 'web' (session + CSRF),
        // yang menyebabkan error "CSRF token mismatch" saat login/register.

        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
