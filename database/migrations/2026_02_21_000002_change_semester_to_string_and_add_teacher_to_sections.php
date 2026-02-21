<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Change subjects.semester from integer to string to allow 'summer', 'q1'-'q4'
        Schema::table('subjects', function (Blueprint $table) {
            $table->string('semester', 20)->nullable()->change();
        });

        // Add teacher_id to sections so registrar can assign a teacher (adviser/homeroom)
        Schema::table('sections', function (Blueprint $table) {
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->nullOnDelete()->after('strand_id');
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->integer('semester')->nullable()->change();
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->dropColumn('teacher_id');
        });
    }
};
