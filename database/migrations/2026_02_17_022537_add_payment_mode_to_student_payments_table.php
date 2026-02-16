<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('student_payments', function (Blueprint $table) {
            $table->enum('payment_mode', ['CASH', 'GCASH', 'BANK'])->default('CASH')->after('payment_for');
            $table->string('reference_number')->nullable()->after('payment_mode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_payments', function (Blueprint $table) {
            $table->dropColumn(['payment_mode', 'reference_number']);
        });
    }
};
