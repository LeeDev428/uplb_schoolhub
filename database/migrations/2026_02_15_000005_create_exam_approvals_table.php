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
        Schema::create('exam_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('school_year');
            $table->string('exam_type'); // e.g., midterm, finals, quarterly
            $table->string('term')->nullable(); // e.g., 1st Quarter, 2nd Semester
            $table->enum('status', ['pending', 'approved', 'denied'])->default('pending');
            $table->decimal('required_amount', 10, 2)->default(0); // Amount required for approval
            $table->decimal('paid_amount', 10, 2)->default(0); // Amount actually paid
            $table->text('remarks')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            // One approval record per student per exam type per term
            $table->unique(['student_id', 'school_year', 'exam_type', 'term']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_approvals');
    }
};
