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
        $sectionNames = ['A', 'B', 'C', 'Einstein', 'Newton', 'Rizal'];

        // Elementary, JHS, SHS Sections (without programs)
        $basicEducationDepts = Department::where('classification', 'K-12')->get();
        
        foreach ($basicEducationDepts as $dept) {
            $yearLevels = YearLevel::where('department_id', $dept->id)->get();
            
            foreach ($yearLevels as $yearLevel) {
                // Create 3 sections per year level for basic education
                for ($i = 0; $i < 3; $i++) {
                    Section::updateOrCreate(
                        [
                            'year_level_id' => $yearLevel->id,
                            'name' => 'Section ' . $sectionNames[$i],
                        ],
                        [
                            'program_id' => null, // No program for basic education
                            'capacity' => 40,
                            'room_number' => null,
                            'is_active' => true,
                        ]
                    );
                }
            }
        }

        // College Sections (with programs)
        $collegeDepts = Department::where('classification', 'College')->get();
        
        foreach ($collegeDepts as $dept) {
            $programs = Program::where('department_id', $dept->id)->get();
            $yearLevels = YearLevel::where('department_id', $dept->id)->get();
            
            foreach ($programs as $program) {
                foreach ($yearLevels as $yearLevel) {
                    // Create 2 sections per program per year level
                    for ($i = 0; $i < 2; $i++) {
                        Section::updateOrCreate(
                            [
                                'year_level_id' => $yearLevel->id,
                                'program_id' => $program->id,
                                'name' => 'Section ' . $sectionNames[$i + 3],
                            ],
                            [
                                'capacity' => 45,
                                'room_number' => null,
                                'is_active' => true,
                            ]
                        );
                    }
                }
            }
        }
    }
}
