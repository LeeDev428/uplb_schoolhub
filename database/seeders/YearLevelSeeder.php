<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\YearLevel;
use Illuminate\Database\Seeder;

class YearLevelSeeder extends Seeder
{
    public function run(): void
    {
        // Elementary Department (Grades 1-6)
        $elementary = Department::where('code', 'ELEM')->first();
        
        if ($elementary) {
            for ($i = 1; $i <= 6; $i++) {
                YearLevel::updateOrCreate(
                    [
                        'department_id' => $elementary->id,
                        'level_number' => $i,
                    ],
                    [
                        'name' => "Grade {$i}",
                        'is_active' => true,
                    ]
                );
            }
        }

        // Junior High School (Grades 7-10)
        $juniorHigh = Department::where('code', 'JHS')->first();
        
        if ($juniorHigh) {
            for ($i = 7; $i <= 10; $i++) {
                YearLevel::updateOrCreate(
                    [
                        'department_id' => $juniorHigh->id,
                        'level_number' => $i,
                    ],
                    [
                        'name' => "Grade {$i}",
                        'is_active' => true,
                    ]
                );
            }
        }

        // Senior High School (Grades 11-12)
        $seniorHigh = Department::where('code', 'SHS')->first();
        
        if ($seniorHigh) {
            for ($i = 11; $i <= 12; $i++) {
                YearLevel::updateOrCreate(
                    [
                        'department_id' => $seniorHigh->id,
                        'level_number' => $i,
                    ],
                    [
                        'name' => "Grade {$i}",
                        'is_active' => true,
                    ]
                );
            }
        }

        // College Departments (1st Year to 4th Year)
        $collegeDepartments = Department::where('classification', 'College')->get();
        
        $yearNames = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        
        foreach ($collegeDepartments as $college) {
            for ($i = 1; $i <= 4; $i++) {
                YearLevel::updateOrCreate(
                    [
                        'department_id' => $college->id,
                        'level_number' => $i,
                    ],
                    [
                        'name' => $yearNames[$i - 1],
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
