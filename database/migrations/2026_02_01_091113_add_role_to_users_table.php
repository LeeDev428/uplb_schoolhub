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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->after('email');
            $table->string('student_id')->nullable()->after('role');
            $table->string('phone')->nullable()->after('student_id');
            $table->string('department')->nullable()->after('phone');
            $table->string('program')->nullable()->after('department');
            $table->string('year_level')->nullable()->after('program');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'student_id', 'phone', 'department', 'program', 'year_level']);
        });
    }
};
