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
        // Create academic_deadlines table
        Schema::create('academic_deadlines', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Enrollment Deadline", "Document Submission Deadline"
            $table->text('description')->nullable();
            $table->enum('classification', ['K-12', 'College'])->nullable(); // Can apply to specific classification or both (null = all)
            $table->date('deadline_date');
            $table->time('deadline_time')->nullable();
            $table->enum('applies_to', ['all', 'new_enrollee', 'transferee', 'returning'])->default('all');
            $table->boolean('is_active')->default(true);
            $table->boolean('send_reminder')->default(false);
            $table->integer('reminder_days_before')->nullable(); // Days before deadline to send reminder
            $table->timestamps();
        });

        // Add deadline_id to requirements table (if not exists)
        if (!Schema::hasColumn('requirements', 'deadline_id')) {
            Schema::table('requirements', function (Blueprint $table) {
                $table->foreignId('deadline_id')->nullable()->after('custom_deadline')->constrained('academic_deadlines')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove deadline_id from requirements table
        if (Schema::hasColumn('requirements', 'deadline_id')) {
            Schema::table('requirements', function (Blueprint $table) {
                $table->dropForeign(['deadline_id']);
                $table->dropColumn('deadline_id');
            });
        }

        Schema::dropIfExists('academic_deadlines');
    }
};
