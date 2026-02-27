<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Teacher;
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

        // Create Teacher record first, then User
        $teacher = Teacher::updateOrCreate(
            ['email' => 'teacher@gmail.com'],
            [
                'employee_id' => 'TCH-001',
                'first_name' => 'Sample',
                'last_name' => 'Teacher',
                'phone' => '09123456789',
                'gender' => 'male',
                'employment_status' => 'full-time',
                'hire_date' => now()->subYears(2),
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'teacher@gmail.com'],
            [
                'name' => 'Sample Teacher',
                'username' => 'teacher',
                'password' => bcrypt('password'),
                'role' => User::ROLE_TEACHER,
                'teacher_id' => $teacher->id,
                'email_verified_at' => now(),
            ]
        );

        // Create Parent
        User::updateOrCreate(
            ['email' => 'parent@gmail.com'],
            [
                'name' => 'Sample Parent',
                'password' => bcrypt('password'),
                'role' => User::ROLE_PARENT,
                'email_verified_at' => now(),
            ]
        );

        // Create Guidance Counselor
        User::updateOrCreate(
            ['email' => 'guidance@gmail.com'],
            [
                'name' => 'Guidance Counselor',
                'username' => 'guidance',
                'password' => bcrypt('password'),
                'role' => User::ROLE_GUIDANCE,
                'email_verified_at' => now(),
            ]
        );

        // Create Librarian
        User::updateOrCreate(
            ['email' => 'librarian@gmail.com'],
            [
                'name' => 'School Librarian',
                'username' => 'librarian',
                'password' => bcrypt('password'),
                'role' => User::ROLE_LIBRARIAN,
                'email_verified_at' => now(),
            ]
        );

        // Create Clinic Staff
        User::updateOrCreate(
            ['email' => 'clinic@gmail.com'],
            [
                'name' => 'Clinic Nurse',
                'username' => 'clinic',
                'password' => bcrypt('password'),
                'role' => User::ROLE_CLINIC,
                'email_verified_at' => now(),
            ]
        );

        // Create Canteen Staff
        User::updateOrCreate(
            ['email' => 'canteen@gmail.com'],
            [
                'name' => 'Canteen Manager',
                'username' => 'canteen',
                'password' => bcrypt('password'),
                'role' => User::ROLE_CANTEEN,
                'email_verified_at' => now(),
            ]
        );

        // Create Super Accounting
        User::updateOrCreate(
            ['email' => 'super.accounting@gmail.com'],
            [
                'name' => 'Super Accountant',
                'username' => 'super.accounting',
                'password' => bcrypt('password'),
                'role' => User::ROLE_SUPER_ACCOUNTING,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Created accounts for all 11 roles:');
        $this->command->info('   👑 Owner: owner@gmail.com');
        $this->command->info('   📋 Registrar: registrar@gmail.com');
        $this->command->info('   💰 Accounting: accounting@gmail.com');
        $this->command->info('   🏦 Super Accounting: super.accounting@gmail.com');
        $this->command->info('   🎓 Students: john.doe@gmail.com, student@gmail.com, carlos.reyes@gmail.com, ana.cruz@gmail.com');
        $this->command->info('   👨‍🏫 Teacher: teacher@gmail.com');
        $this->command->info('   👨‍👩‍👧 Parent: parent@gmail.com');
        $this->command->info('   🧑‍⚕️ Guidance: guidance@gmail.com');
        $this->command->info('   📚 Librarian: librarian@gmail.com');
        $this->command->info('   🏥 Clinic: clinic@gmail.com');
        $this->command->info('   🍽️ Canteen: canteen@gmail.com');
        $this->command->info('');
        $this->command->info('📧 All accounts use password: password');
    }
}
