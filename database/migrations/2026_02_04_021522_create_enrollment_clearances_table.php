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
        Schema::create('enrollment_clearances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('requirements_complete_percentage')->default(0);
            $table->boolean('requirements_complete')->default(false);
            $table->timestamp('requirements_completed_at')->nullable();
            $table->foreignId('requirements_completed_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->boolean('registrar_clearance')->default(false);
            $table->timestamp('registrar_cleared_at')->nullable();
            $table->foreignId('registrar_cleared_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('registrar_notes')->nullable();
            
            $table->boolean('accounting_clearance')->default(false);
            $table->timestamp('accounting_cleared_at')->nullable();
            $table->foreignId('accounting_cleared_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('accounting_notes')->nullable();
            
            $table->boolean('official_enrollment')->default(false);
            $table->timestamp('officially_enrolled_at')->nullable();
            $table->foreignId('officially_enrolled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('enrollment_status')->default('pending'); // pending, in_progress, completed
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('user_id');
            $table->index('enrollment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollment_clearances');
    }
};
