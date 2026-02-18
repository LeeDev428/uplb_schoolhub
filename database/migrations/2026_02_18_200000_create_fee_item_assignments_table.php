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
        Schema::create('fee_item_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fee_item_id')->constrained()->onDelete('cascade');
            $table->string('classification'); // K-12, College
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->foreignId('year_level_id')->constrained()->onDelete('cascade');
            $table->string('school_year')->default('2024-2025');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Each fee item can only be assigned once per classification/department/year_level combination
            $table->unique(['fee_item_id', 'classification', 'department_id', 'year_level_id'], 'fee_assignment_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_item_assignments');
    }
};
