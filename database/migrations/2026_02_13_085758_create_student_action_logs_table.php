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
        Schema::create('student_action_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // e.g., 'requirements_updated', 'information_updated', 'registered', 'clearance_updated'
            $table->string('action_type')->default('general'); // 'requirement', 'information', 'clearance', 'enrollment', 'payment', etc.
            $table->text('details')->nullable(); // Brief description of what was done
            $table->text('notes')->nullable(); // Additional notes
            $table->json('changes')->nullable(); // JSON of field changes (old/new values)
            $table->timestamps();
            
            $table->index(['student_id', 'created_at']);
            $table->index('action_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_action_logs');
    }
};
