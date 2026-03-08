<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Alter the enum to include paymaya and bank_transfer used by the student payment form
        DB::statement("ALTER TABLE online_transactions MODIFY COLUMN payment_method ENUM('gcash','paymaya','bank_transfer','bank','card','other') NOT NULL DEFAULT 'gcash'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values (existing paymaya/bank_transfer rows will need cleanup first)
        DB::statement("ALTER TABLE online_transactions MODIFY COLUMN payment_method ENUM('gcash','bank','card','other') NOT NULL DEFAULT 'gcash'");
    }
};
