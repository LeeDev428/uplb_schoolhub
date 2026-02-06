<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\YearLevel;
use App\Models\Program;
use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $currentSchoolYear = date('Y') . '-' . (date('Y') + 1);
        $sectionNames = ['A', 'B', 'C', 'Einstein', 'Newton', 'Rizal'];

        // Elementary, JHS, SHS Sections (without programs)
        $basicEducationDepts = Department::whereIn('level', ['elementary', 'junior_high', 'senior_high'])->get();
        
        foreach ($basicEducationDepts as $dept) {
            $yearLevels = YearLevel::where('department_id', $dept->id)->get();
            
            foreach ($yearLevels as $yearLevel) {
                // Create 3 sections per year level for basic education
                for ($i = 0; $i < 3; $i++) {
                    Section::create([
                        'year_level_id' => $yearLevel->id,
                        'program_id' => null, // No program for basic education
                        'name' => 'Section ' . $sectionNames[$i],
                        'capacity' => 40,
                        'school_year' => $currentSchoolYear,
                        'is_active' => true,
                    ]);
                }
            }
        }

        // College Sections (with programs)
        $collegeDepts = Department::where('level', 'college')->get();
        
        foreach ($collegeDepts as $dept) {
            $programs = Program::where('department_id', $dept->id)->get();
            $yearLevels = YearLevel::where('department_id', $dept->id)->get();
            
            foreach ($programs as $program) {
                foreach ($yearLevels as $yearLevel) {
                    // Create 2 sections per program per year level
                    for ($i = 0; $i < 2; $i++) {
                        Section::create([
                            'year_level_id' => $yearLevel->id,
                            'program_id' => $program->id,
                            'name' => 'Section ' . $sectionNames[$i + 3], // Use different names
                            'capacity' => 45,
                            'school_year' => $currentSchoolYear,
                            'is_active' => true,
                        ]);
                    }
                }
            }
        }
    }
}
