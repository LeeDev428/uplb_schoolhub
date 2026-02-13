<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            // Add target_roles as JSON column to support multiple role selection
            $table->json('target_roles')->nullable()->after('target_audience');
            
            // Add attachment columns
            $table->string('attachment_path')->nullable()->after('is_active');
            $table->string('attachment_name')->nullable()->after('attachment_path');
            $table->string('attachment_type')->nullable()->after('attachment_name');
        });

        // Migrate existing target_audience data to target_roles
        // Map old values to new role names
        $mappings = [
            'all' => json_encode(['registrar', 'accounting', 'student', 'teacher', 'parent', 'guidance', 'librarian', 'clinic', 'canteen']),
            'students' => json_encode(['student']),
            'teachers' => json_encode(['teacher']),
            'parents' => json_encode(['parent']),
            'staff' => json_encode(['registrar', 'accounting', 'guidance', 'librarian', 'clinic', 'canteen']),
        ];

        foreach ($mappings as $oldValue => $newValue) {
            DB::table('announcements')
                ->where('target_audience', $oldValue)
                ->update(['target_roles' => $newValue]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn(['target_roles', 'attachment_path', 'attachment_name', 'attachment_type']);
        });
    }
};
