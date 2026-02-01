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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            
            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->string('lrn')->unique()->comment('Learner Reference Number / Student ID');
            $table->string('email')->unique();
            $table->string('phone');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->text('complete_address');
            $table->string('city_municipality');
            $table->string('zip_code');
            
            // Student Classification
            $table->enum('student_type', ['new', 'transferee', 'returnee'])->default('new');
            
            // Academic Information
            $table->string('school_year'); // e.g., "2023-2024"
            $table->string('program');
            $table->string('year_level'); // e.g., "1st Year", "2nd Year"
            $table->string('section')->nullable()->comment('Can be TBD (To Be Determined)');
            
            // Enrollment Status
            $table->enum('enrollment_status', [
                'not-enrolled',
                'pending-registrar',
                'pending-accounting',
                'enrolled',
                'graduated',
                'dropped'
            ])->default('not-enrolled');
            
            // Requirements Status
            $table->enum('requirements_status', [
                'incomplete',
                'pending',
                'complete'
            ])->default('incomplete');
            $table->integer('requirements_percentage')->default(0);
            
            // Guardian Information
            $table->string('guardian_name');
            $table->string('guardian_relationship');
            $table->string('guardian_contact');
            $table->string('guardian_email')->nullable();
            
            // Additional Information
            $table->string('student_photo_url')->nullable();
            $table->string('remarks')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better query performance
            $table->index(['enrollment_status', 'school_year']);
            $table->index(['program', 'year_level']);
            $table->index('student_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
