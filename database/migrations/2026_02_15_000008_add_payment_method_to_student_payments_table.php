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
            $table->enum('payment_method', ['cash', 'gcash', 'bank', 'other'])->default('cash')->after('payment_for');
            $table->string('reference_number')->nullable()->after('payment_method'); // For GCash/Bank transfers
            $table->string('bank_name')->nullable()->after('reference_number'); // For bank transfers
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_payments', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'reference_number', 'bank_name']);
        });
    }
};
