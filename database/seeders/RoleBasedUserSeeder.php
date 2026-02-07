<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class RoleBasedUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Owner
        User::updateOrCreate(
            ['email' => 'owner@gmail.com'],
            [
                'name' => 'System Owner',
                'password' => bcrypt('password'),
                'role' => User::ROLE_OWNER,
                'email_verified_at' => now(),
            ]
        );

        // Create Registrar
        User::updateOrCreate(
            ['email' => 'registrar@gmail.com'],
            [
                'name' => 'School Registrar',
                'password' => bcrypt('password'),
                'role' => User::ROLE_REGISTRAR,
                'email_verified_at' => now(),
            ]
        );

        // Create Accounting User
        User::updateOrCreate(
            ['email' => 'accounting@gmail.com'],
            [
                'name' => 'School Accountant',
                'password' => bcrypt('password'),
                'role' => User::ROLE_ACCOUNTING,
                'email_verified_at' => now(),
            ]
        );

        // Create Sample Students
        $students = [
            [
                'name' => 'John Michael Doe Jr.',
                'email' => 'john.doe@gmail.com',
                'student_id' => '2023-001',
                'program' => 'BS Information Technology',
                'year_level' => '3',
                'department' => 'College of Computer Studies',
            ],
            [
                'name' => 'Maria Cristina Santos',
                'email' => 'student@gmail.com',
                'student_id' => '2023-002',
                'program' => 'BS Computer Science',
                'year_level' => '2',
                'department' => 'College of Computer Studies',
            ],
            [
                'name' => 'Carlos Antonio Reyes',
                'email' => 'carlos.reyes@gmail.com',
                'student_id' => '2023-003',
                'program' => 'BS Business Administration',
                'year_level' => '4',
                'department' => 'College of Business',
            ],
            [
                'name' => 'Ana Marie Cruz',
                'email' => 'ana.cruz@gmail.com',
                'student_id' => '2023-004',
                'program' => 'BS Information Technology',
                'year_level' => '1',
                'department' => 'College of Computer Studies',
            ],
        ];

        foreach ($students as $studentData) {
            User::updateOrCreate(
                ['email' => $studentData['email']],
                [
                    ...$studentData,
                    'password' => bcrypt('password'),
                    'role' => User::ROLE_STUDENT,
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command->info('✅ Created 1 Owner, 1 Registrar, 1 Accounting, and 4 Students');
        $this->command->info('📧 All accounts use password: password');
    }
}
