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
        Schema::table('fee_items', function (Blueprint $table) {
            // Add assignment fields for automatic StudentFee creation
            $table->string('classification')->nullable()->after('school_year'); // K-12, College, etc.
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete()->after('classification');
            $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete()->after('department_id');
            $table->foreignId('year_level_id')->nullable()->constrained()->nullOnDelete()->after('program_id');
            $table->foreignId('section_id')->nullable()->constrained()->nullOnDelete()->after('year_level_id');
            
            // Add applicability scope
            $table->enum('assignment_scope', ['all', 'specific'])->default('all')->after('section_id');
            // 'all' = applies to everyone of that category/dept/year level
            // 'specific' = only applies to selected classification/dept/program/level/section
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fee_items', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['program_id']);
            $table->dropForeign(['year_level_id']);
            $table->dropForeign(['section_id']);
            $table->dropColumn([
                'classification',
                'department_id',
                'program_id',
                'year_level_id',
                'section_id',
                'assignment_scope',
            ]);
        });
    }
};
