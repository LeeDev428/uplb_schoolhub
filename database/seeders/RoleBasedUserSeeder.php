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
        User::create([
            'name' => 'System Owner',
            'email' => 'owner@schoolhub.local',
            'password' => bcrypt('password'),
            'role' => User::ROLE_OWNER,
            'email_verified_at' => now(),
        ]);

        // Create Registrar
        User::create([
            'name' => 'School Registrar',
            'email' => 'registrar@schoolhub.local',
            'password' => bcrypt('password'),
            'role' => User::ROLE_REGISTRAR,
            'email_verified_at' => now(),
        ]);

        // Create Sample Students
        $students = [
            [
                'name' => 'John Michael Doe Jr.',
                'email' => 'john.doe@student.edu',
                'student_id' => '2023-001',
                'program' => 'BS Information Technology',
                'year_level' => '3',
                'department' => 'College of Computer Studies',
            ],
            [
                'name' => 'Maria Cristina Santos',
                'email' => 'maria.santos@student.edu',
                'student_id' => '2023-002',
                'program' => 'BS Computer Science',
                'year_level' => '2',
                'department' => 'College of Computer Studies',
            ],
            [
                'name' => 'Carlos Antonio Reyes',
                'email' => 'carlos.reyes@student.edu',
                'student_id' => '2023-003',
                'program' => 'BS Business Administration',
                'year_level' => '4',
                'department' => 'College of Business',
            ],
            [
                'name' => 'Ana Marie Cruz',
                'email' => 'ana.cruz@student.edu',
                'student_id' => '2023-004',
                'program' => 'BS Information Technology',
                'year_level' => '1',
                'department' => 'College of Computer Studies',
            ],
        ];

        foreach ($students as $studentData) {
            User::create([
                ...$studentData,
                'password' => bcrypt('password'),
                'role' => User::ROLE_STUDENT,
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('✅ Created 1 Owner, 1 Registrar, and 4 Students');
        $this->command->info('📧 All accounts use password: password');
    }
}
