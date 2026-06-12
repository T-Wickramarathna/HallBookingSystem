<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Payment\StripePaymentGateway;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, StripePaymentGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
