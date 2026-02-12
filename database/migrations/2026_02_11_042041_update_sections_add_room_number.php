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
        // Add room_number if it doesn't exist yet
        if (!Schema::hasColumn('sections', 'room_number')) {
            Schema::table('sections', function (Blueprint $table) {
                $table->string('room_number')->nullable()->after('capacity');
            });
        }

        // Remove school_year if it exists
        if (Schema::hasColumn('sections', 'school_year')) {
            Schema::table('sections', function (Blueprint $table) {
                $table->dropColumn('school_year');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->string('school_year')->nullable();
            $table->dropColumn('room_number');
        });
    }
};
