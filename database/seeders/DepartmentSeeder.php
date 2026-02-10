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
                'code' => 'ELEM',
                'name' => 'Elementary Department',
                'description' => 'Elementary education (Grades 1-6)',
                'classification' => 'K-12',
                'is_active' => true,
            ],
            [
                'code' => 'JHS',
                'name' => 'Junior High School Department',
                'description' => 'Junior high school education (Grades 7-10)',
                'classification' => 'K-12',
                'is_active' => true,
            ],
            [
                'code' => 'SHS',
                'name' => 'Senior High School Department',
                'description' => 'Senior high school education (Grades 11-12)',
                'classification' => 'K-12',
                'is_active' => true,
            ],
            [
                'code' => 'CCS',
                'name' => 'College of Computer Studies',
                'description' => 'Computer Science, Information Technology, and related programs',
                'classification' => 'College',
                'is_active' => true,
            ],
            [
                'code' => 'CBA',
                'name' => 'College of Business Administration',
                'description' => 'Business, Accountancy, and Management programs',
                'classification' => 'College',
                'is_active' => true,
            ],
            [
                'code' => 'CAS',
                'name' => 'College of Arts and Sciences',
                'description' => 'Liberal arts and science programs',
                'classification' => 'College',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(
                ['code' => $department['code']],
                $department
            );
        }
    }
}
