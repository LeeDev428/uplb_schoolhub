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
        // Update Departments table (add classification and code if not exists)
        if (!Schema::hasColumn('departments', 'classification')) {
            Schema::table('departments', function (Blueprint $table) {
                $table->enum('classification', ['K-12', 'College'])->default('K-12')->after('id');
            });
        }
        
        if (!Schema::hasColumn('departments', 'code')) {
            Schema::table('departments', function (Blueprint $table) {
                $table->string('code')->unique()->after('name');
            });
        }

        // Create Strands table (for Senior High School)
        Schema::create('strands', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // STEM, ABM, HUMSS, GAS, TVL, etc.
            $table->string('code')->unique(); // STEM, ABM, etc.
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Update Year Levels table
        if (!Schema::hasColumn('year_levels', 'classification')) {
            Schema::table('year_levels', function (Blueprint $table) {
                $table->enum('classification', ['K-12', 'College'])->default('K-12')->after('department_id');
            });
        }

        // Create Year Level Strands (pivot for SHS strands)
        Schema::create('year_level_strand', function (Blueprint $table) {
            $table->id();
            $table->foreignId('year_level_id')->constrained()->onDelete('cascade');
            $table->foreignId('strand_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['year_level_id', 'strand_id']);
        });

        // Update Sections table
        if (!Schema::hasColumn('sections', 'department_id')) {
            Schema::table('sections', function (Blueprint $table) {
                $table->foreignId('department_id')->nullable()->after('id')->constrained()->onDelete('cascade');
            });
        }

        if (!Schema::hasColumn('sections', 'strand_id')) {
            Schema::table('sections', function (Blueprint $table) {
                $table->foreignId('strand_id')->nullable()->after('year_level_id')->constrained()->onDelete('set null');
            });
        }

        if (!Schema::hasColumn('sections', 'code')) {
            Schema::table('sections', function (Blueprint $table) {
                $table->string('code')->nullable()->after('name');
            });
        }

        // Add additional columns to students table for the new structure
        if (!Schema::hasColumn('students', 'classification')) {
            Schema::table('students', function (Blueprint $table) {
                $table->enum('classification', ['K-12', 'College'])->nullable()->after('student_type');
            });
        }

        if (!Schema::hasColumn('students', 'department_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->foreignId('department_id')->nullable()->after('classification')->constrained()->onDelete('set null');
            });
        }

        if (!Schema::hasColumn('students', 'year_level_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->foreignId('year_level_id')->nullable()->after('department_id')->constrained()->onDelete('set null');
            });
        }

        if (!Schema::hasColumn('students', 'section_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->foreignId('section_id')->nullable()->after('year_level_id')->constrained()->onDelete('set null');
            });
        }

        if (!Schema::hasColumn('students', 'strand_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->foreignId('strand_id')->nullable()->after('section_id')->constrained()->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['year_level_id']);
            $table->dropForeign(['section_id']);
            $table->dropForeign(['strand_id']);
            $table->dropColumn(['department_id', 'year_level_id', 'section_id', 'strand_id', 'classification']);
        });

        Schema::dropIfExists('sections');
        Schema::dropIfExists('year_level_strand');
        Schema::dropIfExists('year_levels');
        Schema::dropIfExists('strands');
        Schema::dropIfExists('departments');
    }
};
