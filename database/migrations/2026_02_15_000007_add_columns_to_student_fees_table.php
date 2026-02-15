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
        Schema::table('student_fees', function (Blueprint $table) {
            $table->boolean('is_overdue')->default(false)->after('balance');
            $table->date('due_date')->nullable()->after('is_overdue');
            $table->decimal('grant_discount', 10, 2)->default(0)->after('due_date');
            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'overdue'])->default('unpaid')->after('grant_discount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_fees', function (Blueprint $table) {
            $table->dropColumn(['is_overdue', 'due_date', 'grant_discount', 'payment_status']);
        });
    }
};
