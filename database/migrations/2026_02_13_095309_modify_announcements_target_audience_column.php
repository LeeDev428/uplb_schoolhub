<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Change target_audience from ENUM to VARCHAR to support 'custom' and other values.
     * Since we now use target_roles JSON column for actual targeting, this column
     * is just for backward compatibility and general categorization.
     */
    public function up(): void
    {
        // Change ENUM to VARCHAR(50) to allow any value including 'custom'
        DB::statement("ALTER TABLE announcements MODIFY COLUMN target_audience VARCHAR(50) DEFAULT 'all'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original ENUM (note: this may fail if data contains values not in the enum)
        DB::statement("ALTER TABLE announcements MODIFY COLUMN target_audience ENUM('all', 'students', 'teachers', 'parents', 'staff') DEFAULT 'all'");
    }
};
