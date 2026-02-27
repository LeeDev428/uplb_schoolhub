<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add program_id to year_levels (for college year levels linked to a program)
        if (!Schema::hasColumn('year_levels', 'program_id')) {
            Schema::table('year_levels', function (Blueprint $table) {
                $table->foreignId('program_id')->nullable()->after('department_id')
                      ->constrained()->nullOnDelete();
            });
        }

        // Make department_id nullable on subjects (to support pivot-based multi-department assignment)
        if (Schema::hasColumn('subjects', 'department_id')) {
            Schema::table('subjects', function (Blueprint $table) {
                $table->foreignId('department_id')->nullable()->change();
            });
        }

        // Make year_level_id nullable on subjects (already nullable, but ensure)
        // Pivot table: subject <-> departments (many-to-many)
        if (!Schema::hasTable('subject_departments')) {
            Schema::create('subject_departments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
                $table->foreignId('department_id')->constrained()->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['subject_id', 'department_id']);
            });
        }

        // Pivot table: subject <-> programs (many-to-many, college only)
        if (!Schema::hasTable('subject_programs')) {
            Schema::create('subject_programs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
                $table->foreignId('program_id')->constrained()->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['subject_id', 'program_id']);
            });
        }

        // Pivot table: subject <-> year_levels (many-to-many)
        if (!Schema::hasTable('subject_year_levels')) {
            Schema::create('subject_year_levels', function (Blueprint $table) {
                $table->id();
                $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
                $table->foreignId('year_level_id')->constrained()->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['subject_id', 'year_level_id']);
            });
        }

        // Pivot table: subject <-> sections (many-to-many)
        if (!Schema::hasTable('subject_sections')) {
            Schema::create('subject_sections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
                $table->foreignId('section_id')->constrained()->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['subject_id', 'section_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_sections');
        Schema::dropIfExists('subject_year_levels');
        Schema::dropIfExists('subject_programs');
        Schema::dropIfExists('subject_departments');

        if (Schema::hasColumn('year_levels', 'program_id')) {
            Schema::table('year_levels', function (Blueprint $table) {
                $table->dropForeign(['program_id']);
                $table->dropColumn('program_id');
            });
        }
    }
};
