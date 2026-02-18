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
        Schema::table('promissory_notes', function (Blueprint $table) {
            // Make amount nullable - promissory notes can just be extension requests
            $table->decimal('amount', 12, 2)->nullable()->change();
            
            // Make student_fee_id nullable - can be a general extension
            $table->foreignId('student_fee_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promissory_notes', function (Blueprint $table) {
            $table->decimal('amount', 12, 2)->nullable(false)->change();
            $table->foreignId('student_fee_id')->nullable(false)->change();
        });
    }
};
