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
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique(); // e.g., "MATH101", "ENG101"
            $table->string('name'); // e.g., "College Algebra", "English 101"
            $table->text('description')->nullable();
            $table->enum('classification', ['K-12', 'College']); // Inherited from department
            $table->decimal('units', 3, 1)->default(3.0); // Credit units (e.g., 3.0, 1.5)
            $table->integer('hours_per_week')->nullable(); // Contact hours per week
            $table->enum('type', ['core', 'major', 'elective', 'general'])->default('core');
            $table->foreignId('year_level_id')->nullable()->constrained()->onDelete('set null'); // Optional year level requirement
            $table->integer('semester')->nullable(); // 1 or 2 for college, null for K-12
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Create subject_prerequisites table (subjects that must be

 taken before another subject)
        Schema::create('subject_prerequisites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete(); // The subject
            $table->foreignId('prerequisite_subject_id')->constrained('subjects')->cascadeOnDelete(); // The prerequisite
            $table->timestamps();
            
            $table->unique(['subject_id', 'prerequisite_subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subject_prerequisites');
        Schema::dropIfExists('subjects');
    }
};
