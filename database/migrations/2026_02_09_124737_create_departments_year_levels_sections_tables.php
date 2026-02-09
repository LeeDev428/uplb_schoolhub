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
        // Departments table (Preschool, Elementary, JHS, SHS, BSIT, etc.)
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->enum('classification', ['K-12', 'College'])->default('K-12');
            $table->string('name'); // e.g., "Junior High School", "BSIT"
            $table->string('code')->unique(); // e.g., "JHS", "BSIT"
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Strands table (for Senior High School)
        Schema::create('strands', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // STEM, ABM, HUMSS, GAS, TVL, etc.
            $table->string('code')->unique(); // STEM, ABM, etc.
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Year Levels table (Nursery, Kinder, Grade 1-12, 1st Year, etc.)
        Schema::create('year_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->enum('classification', ['K-12', 'College'])->default('K-12');
            $table->string('name'); // "Nursery", "Grade 7", "1st Year"
            $table->integer('level_number'); // For sorting: 1, 2, 3... or 7, 8, 9, 10
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Year Level Strands (pivot for SHS strands)
        Schema::create('year_level_strand', function (Blueprint $table) {
            $table->id();
            $table->foreignId('year_level_id')->constrained()->onDelete('cascade');
            $table->foreignId('strand_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['year_level_id', 'strand_id']);
        });

        // Sections table
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->foreignId('year_level_id')->constrained()->onDelete('cascade');
            $table->foreignId('strand_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name'); // "Section A", "Section B", "St. Peter"
            $table->string('code')->nullable(); // "A", "B", "PETER"
            $table->integer('capacity')->nullable(); // Maximum number of students
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Add additional columns to students table for the new structure
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('section')->constrained()->onDelete('set null');
            $table->foreignId('year_level_id')->nullable()->after('department_id')->constrained()->onDelete('set null');
            $table->foreignId('section_id')->nullable()->after('year_level_id')->constrained()->onDelete('set null');
            $table->foreignId('strand_id')->nullable()->after('section_id')->constrained()->onDelete('set null');
            $table->enum('classification', ['K-12', 'College'])->nullable()->after('student_type');
        });
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
