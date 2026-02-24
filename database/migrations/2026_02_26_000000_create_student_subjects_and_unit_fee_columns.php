<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── student_subjects ──────────────────────────────────────────────
        Schema::create('student_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->string('school_year', 20);
            $table->unsignedTinyInteger('semester')->nullable(); // 1 | 2 | null (summer)
            // enrolled = currently taking | completed = passed | failed | dropped
            $table->enum('status', ['enrolled', 'completed', 'failed', 'dropped'])->default('enrolled');
            $table->decimal('grade', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'school_year', 'semester'], 'student_subjects_unique');
            $table->index(['student_id', 'school_year'], 'student_subjects_student_year_idx');
        });

        // ── fee_items: per-unit tuition columns ───────────────────────────
        Schema::table('fee_items', function (Blueprint $table) {
            $table->boolean('is_per_unit')->default(false)->after('is_required');
            $table->decimal('unit_price', 10, 2)->default(0)->after('is_per_unit');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_subjects');

        Schema::table('fee_items', function (Blueprint $table) {
            $table->dropColumn(['is_per_unit', 'unit_price']);
        });
    }
};
