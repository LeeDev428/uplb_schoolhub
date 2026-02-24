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
        Schema::create('drop_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('semester')->nullable();
            $table->string('school_year')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->text('registrar_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Index for faster lookups
            $table->index(['student_id', 'status']);
        });

        // Add is_active/can_login field to students table
        Schema::table('students', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('enrollment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drop_requests');
        
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
