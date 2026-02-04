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
        Schema::create('student_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requirement_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'submitted', 'approved', 'rejected', 'overdue'])->default('pending');
            $table->date('submitted_at')->nullable();
            $table->date('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('file_path')->nullable(); // For uploaded documents
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
            
            $table->unique(['student_id', 'requirement_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_requirements');
    }
};
