<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Seed enrollment history from existing students who are enrolled or have a meaningful status
        $students = DB::table('students')
            ->whereNull('deleted_at')
            ->whereNotNull('school_year')
            ->whereIn('enrollment_status', ['enrolled', 'dropped', 'graduated', 'pending-registrar', 'pending-accounting', 'pending-enrollment'])
            ->get(['id', 'school_year', 'enrollment_status', 'program', 'year_level', 'section']);

        foreach ($students as $student) {
            DB::table('student_enrollment_histories')->insertOrIgnore([
                'student_id'  => $student->id,
                'school_year' => $student->school_year,
                'status'      => $student->enrollment_status === 'enrolled' ? 'officially_enrolled' : $student->enrollment_status,
                'enrolled_at' => $student->enrollment_status === 'enrolled' ? now() : null,
                'program'     => $student->program,
                'year_level'  => $student->year_level,
                'section'     => $student->section,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }

    public function down(): void
    {
        // No-op: don't delete seeded data
    }
};
