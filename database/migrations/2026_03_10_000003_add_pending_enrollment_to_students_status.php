<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite does not support ENUM or MODIFY COLUMN; skip on SQLite
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE students MODIFY COLUMN enrollment_status ENUM(
            'not-enrolled',
            'pending-registrar',
            'pending-accounting',
            'pending-enrollment',
            'enrolled',
            'graduated',
            'dropped'
        ) NOT NULL DEFAULT 'not-enrolled'");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Revert pending-enrollment students back to pending-accounting before removing the value
        DB::table('students')
            ->where('enrollment_status', 'pending-enrollment')
            ->update(['enrollment_status' => 'pending-accounting']);

        DB::statement("ALTER TABLE students MODIFY COLUMN enrollment_status ENUM(
            'not-enrolled',
            'pending-registrar',
            'pending-accounting',
            'enrolled',
            'graduated',
            'dropped'
        ) NOT NULL DEFAULT 'not-enrolled'");
    }
    
};
