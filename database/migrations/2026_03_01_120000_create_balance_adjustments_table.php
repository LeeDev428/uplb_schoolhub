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
        Schema::create('balance_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_fee_id')->constrained()->onDelete('cascade');
            $table->foreignId('adjusted_by')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('reason');
            $table->string('school_year')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'created_at']);
            $table->index('adjusted_by');
        });
    }

    /**