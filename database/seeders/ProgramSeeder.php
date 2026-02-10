<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        // Get college departments
        $ccs = Department::where('code', 'CCS')->first();
        $cba = Department::where('code', 'CBA')->first();
        $cas = Department::where('code', 'CAS')->first();

        if (!$ccs || !$cba || !$cas) {
            $this->command->warn('⚠️  College departments not found. Run DepartmentSeeder or AcademicStructureSeeder first.');
            return;
        }

        $programs = [
            // Computer Studies Programs
            [
                'department_id' => $ccs->id,
                'name' => 'Bachelor of Science in Information Technology',
                'description' => 'BSIT program focusing on software development and IT infrastructure',
                'duration_years' => 4,
                'is_active' => true,
            ],
            [
                'department_id' => $ccs->id,
                'name' => 'Bachelor of Science in Computer Science',
                'description' => 'BSCS program focusing on programming and algorithms',
                'duration_years' => 4,
                'is_active' => true,
            ],
            
            // Business Administration Programs
            [
                'department_id' => $cba->id,
                'name' => 'Bachelor of Science in Business Administration',
                'description' => 'BSBA program with various major concentrations',
                'duration_years' => 4,
                'is_active' => true,
            ],
            [
                'department_id' => $cba->id,
                'name' => 'Bachelor of Science in Accountancy',
                'description' => 'BSA program for aspiring Certified Public Accountants',
                'duration_years' => 4,
                'is_active' => true,
            ],
            
            // Arts and Sciences Programs
            [
                'department_id' => $cas->id,
                'name' => 'Bachelor of Science in Psychology',
                'description' => 'Psychology program focusing on human behavior',
                'duration_years' => 4,
                'is_active' => true,
            ],
            [
                'department_id' => $cas->id,
                'name' => 'Bachelor of Arts in Communication',
                'description' => 'Communication arts and media studies',
                'duration_years' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($programs as $program) {
            Program::updateOrCreate(
                [
                    'department_id' => $program['department_id'],
                    'name' => $program['name'],
                ],
                $program
            );
        }
    }
}
