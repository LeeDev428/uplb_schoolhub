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
        Schema::create('student_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_fee_id')->constrained()->onDelete('cascade');
            $table->date('payment_date');
            $table->string('or_number')->nullable(); // Official Receipt Number
            $table->decimal('amount', 10, 2);
            $table->enum('payment_for', ['registration', 'tuition', 'misc', 'books', 'other'])->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Index for faster queries
            $table->index(['student_id', 'payment_date']);
            $table->index('or_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_payments');
    }
};
