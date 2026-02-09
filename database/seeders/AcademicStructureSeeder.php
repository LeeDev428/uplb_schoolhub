<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\YearLevel;
use App\Models\Section;
use App\Models\Strand;

class AcademicStructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create SHS Strands first
        $strands = [
            ['name' => 'Science, Technology, Engineering and Mathematics', 'code' => 'STEM', 'description' => 'STEM Strand'],
            ['name' => 'Accountancy, Business and Management', 'code' => 'ABM', 'description' => 'ABM Strand'],
            ['name' => 'Humanities and Social Sciences', 'code' => 'HUMSS', 'description' => 'HUMSS Strand'],
            ['name' => 'General Academic Strand', 'code' => 'GAS', 'description' => 'GAS Strand'],
            ['name' => 'Technical-Vocational-Livelihood', 'code' => 'TVL', 'description' => 'TVL Strand'],
        ];

        foreach ($strands as $strandData) {
            Strand::firstOrCreate(
                ['code' => $strandData['code']],
                $strandData
            );
        }

        // K-12 Departments
        $preschool = Department::firstOrCreate(
            ['code' => 'PRESCHOOL'],
            [
                'classification' => 'K-12',
                'name' => 'Preschool',
                'description' => 'Preschool Department',
                'is_active' => true,
            ]
        );

        $elementary = Department::firstOrCreate(
            ['code' => 'ELEM'],
            [
                'classification' => 'K-12',
                'name' => 'Elementary',
                'description' => 'Elementary Department',
                'is_active' => true,
            ]
        );

        $jhs = Department::firstOrCreate(
            ['code' => 'JHS'],
            [
                'classification' => 'K-12',
                'name' => 'Junior High School',
                'description' => 'Junior High School Department',
                'is_active' => true,
            ]
        );

        $shs = Department::firstOrCreate(
            ['code' => 'SHS'],
            [
                'classification' => 'K-12',
                'name' => 'Senior High School',
                'description' => 'Senior High School Department',
                'is_active' => true,
            ]
        );

        // College Department
        $bsit = Department::firstOrCreate(
            ['code' => 'BSIT'],
            [
                'classification' => 'College',
                'name' => 'BS Information Technology',
                'description' => 'Bachelor of Science in Information Technology',
                'is_active' => true,
            ]
        );

        // Preschool Year Levels
        $preschoolYearLevels = [
            ['name' => 'Nursery', 'level_number' => 1],
            ['name' => 'Kinder', 'level_number' => 2],
        ];

        foreach ($preschoolYearLevels as $ylData) {
            $yl = YearLevel::firstOrCreate(
                [
                    'department_id' => $preschool->id,
                    'level_number' => $ylData['level_number']
                ],
                [
                    'classification' => 'K-12',
                    'name' => $ylData['name'],
                    'is_active' => true,
                ]
            );

            // Create sample sections
            Section::firstOrCreate(
                ['year_level_id' => $yl->id, 'code' => 'A'],
                [
                    'department_id' => $preschool->id,
                    'name' => 'Section A',
                    'capacity' => 30,
                    'school_year' => '2025-2026',
                    'is_active' => true,
                ]
            );
        }

        // Elementary Year Levels (Grades 1-6)
        for ($i = 1; $i <= 6; $i++) {
            $yl = YearLevel::firstOrCreate(
                [
                    'department_id' => $elementary->id,
                    'level_number' => $i
                ],
                [
                    'classification' => 'K-12',
                    'name' => 'Grade ' . $i,
                    'is_active' => true,
                ]
            );

            // Create sections A and B
            foreach (['A', 'B'] as $section) {
                Section::firstOrCreate(
                    ['year_level_id' => $yl->id, 'code' => $section],
                    [
                        'department_id' => $elementary->id,
                        'name' => 'Section ' . $section,
                        'capacity' => 35,
                        'school_year' => '2025-2026',
                        'is_active' => true,
                    ]
                );
            }
        }

        // JHS Year Levels (Grades 7-10)
        for ($i = 7; $i <= 10; $i++) {
            $yl = YearLevel::firstOrCreate(
                [
                    'department_id' => $jhs->id,
                    'level_number' => $i
                ],
                [
                    'classification' => 'K-12',
                    'name' => 'Grade ' . $i,
                    'is_active' => true,
                ]
            );

            // Create sections
            foreach (['A', 'B', 'C'] as $section) {
                Section::firstOrCreate(
                    ['year_level_id' => $yl->id, 'code' => $section],
                    [
                        'department_id' => $jhs->id,
                        'name' => 'Section ' . $section,
                        'capacity' => 40,
                        'school_year' => '2025-2026',
                        'is_active' => true,
                    ]
                );
            }
        }

        // SHS Year Levels (Grades 11-12)
        for ($i = 11; $i <= 12; $i++) {
            $yl = YearLevel::firstOrCreate(
                [
                    'department_id' => $shs->id,
                    'level_number' => $i
                ],
                [
                    'classification' => 'K-12',
                    'name' => 'Grade ' . $i,
                    'is_active' => true,
                ]
            );

            // Attach all strands to SHS year levels
            $allStrands = Strand::all();
            $yl->strands()->syncWithoutDetaching($allStrands->pluck('id')->toArray());

            // Create sections for each strand
            foreach ($allStrands as $strand) {
                foreach (['A', 'B'] as $section) {
                    Section::firstOrCreate(
                        [
                            'year_level_id' => $yl->id,
                            'strand_id' => $strand->id,
                            'code' => $strand->code . '-' . $section
                        ],
                        [
                            'department_id' => $shs->id,
                            'name' => $strand->code . ' - Section ' . $section,
                            'capacity' => 40,
                            'school_year' => '2025-2026',
                            'is_active' => true,
                        ]
                    );
                }
            }
        }

        // College Year Levels (1st - 4th Year)
        $collegeYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        foreach ($collegeYears as $index => $yearName) {
            $yl = YearLevel::firstOrCreate(
                [
                    'department_id' => $bsit->id,
                    'level_number' => $index + 1
                ],
                [
                    'classification' => 'College',
                    'name' => $yearName,
                    'is_active' => true,
                ]
            );

            // Create sections
            foreach (['A', 'B'] as $section) {
                Section::firstOrCreate(
                    ['year_level_id' => $yl->id, 'code' => $section],
                    [
                        'department_id' => $bsit->id,
                        'name' => 'Section ' . $section,
                        'capacity' => 45,
                        'school_year' => '2025-2026',
                        'is_active' => true,
                    ]
                );
            }
        }

        $this->command->info('Academic structure seeded successfully!');
    }
}
