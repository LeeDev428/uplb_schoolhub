<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Elementary Department',
                'description' => 'Elementary education (Grades 1-6)',
                'level' => 'elementary',
                'is_active' => true,
            ],
            [
                'name' => 'Junior High School Department',
                'description' => 'Junior high school education (Grades 7-10)',
                'level' => 'junior_high',
                'is_active' => true,
            ],
            [
                'name' => 'Senior High School Department',
                'description' => 'Senior high school education (Grades 11-12)',
                'level' => 'senior_high',
                'is_active' => true,
            ],
            [
                'name' => 'College of Computer Studies',
                'description' => 'Computer Science, Information Technology, and related programs',
                'level' => 'college',
                'is_active' => true,
            ],
            [
                'name' => 'College of Business Administration',
                'description' => 'Business, Accountancy, and Management programs',
                'level' => 'college',
                'is_active' => true,
            ],
            [
                'name' => 'College of Arts and Sciences',
                'description' => 'Liberal arts and science programs',
                'level' => 'college',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }
    }
}
