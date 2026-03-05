<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use App\Models\Teacher;
use App\Models\YearLevel;
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

        // Create Sample Students — create actual Student records first, then link User
        $students = [
            [
                'name'       => 'John Michael Doe Jr.',
                'first_name' => 'John',
                'middle_name'=> 'Michael',
                'last_name'  => 'Doe',
                'suffix'     => 'Jr.',
                'email'      => 'john.doe@gmail.com',
                'lrn'        => '2023-001',
                'program'    => 'BS Information Technology',
                'year_level' => '3rd Year',
                'classification' => 'College',
            ],
            [
                'name'       => 'Maria Cristina Santos',
                'first_name' => 'Maria',
                'middle_name'=> 'Cristina',
                'last_name'  => 'Santos',
                'suffix'     => null,
                'email'      => 'student@gmail.com',
                'lrn'        => '2023-002',
                'program'    => 'BS Computer Science',
                'year_level' => '2nd Year',
                'classification' => 'College',
            ],
            [
                'name'       => 'Carlos Antonio Reyes',
                'first_name' => 'Carlos',
                'middle_name'=> 'Antonio',
                'last_name'  => 'Reyes',
                'suffix'     => null,
                'email'      => 'carlos.reyes@gmail.com',
                'lrn'        => '2023-003',
                'program'    => 'BS Business Administration',
                'year_level' => '4th Year',
                'classification' => 'College',
            ],
            [
                'name'       => 'Ana Marie Cruz',
                'first_name' => 'Ana',
                'middle_name'=> 'Marie',
                'last_name'  => 'Cruz',
                'suffix'     => null,
                'email'      => 'ana.cruz@gmail.com',
                'lrn'        => '2023-004',
                'program'    => 'BS Information Technology',
                'year_level' => '1st Year',
                'classification' => 'College',
            ],
        ];

        foreach ($students as $data) {
            // Create (or update) the Student record in the students table
            // Resolve department_id from program name, year_level_id from year_level string
            $departmentId  = Program::where('name', $data['program'])->value('department_id');
            $yearLevelId   = $departmentId
                ? YearLevel::where('department_id', $departmentId)
                            ->where('name', $data['year_level'])
                            ->value('id')
                : null;

            $student = Student::updateOrCreate(
                ['email' => $data['email']],
                [
                    'first_name'            => $data['first_name'],
                    'last_name'             => $data['last_name'],
                    'middle_name'           => $data['middle_name'],
                    'suffix'                => $data['suffix'],
                    'lrn'                   => $data['lrn'],
                    'phone'                 => '09000000000',
                    'date_of_birth'         => '2000-01-01',
                    'gender'                => 'male',
                    'complete_address'      => 'Sample Address, Barangay Sample',
                    'city_municipality'     => 'Sample City',
                    'zip_code'              => '0000',
                    'student_type'          => 'new',
                    'school_year'           => '2024-2025',
                    'program'               => $data['program'],
                    'year_level'            => $data['year_level'],
                    'department_id'         => $departmentId,
                    'year_level_id'         => $yearLevelId,
                    'section'               => 'A',
                    'classification'        => $data['classification'],
                    'enrollment_status'     => 'enrolled',
                    'is_active'             => true,
                    'requirements_status'   => 'complete',
                    'requirements_percentage' => 100,
                    'guardian_name'         => 'Sample Guardian',
                    'guardian_relationship' => 'Parent',
                    'guardian_contact'      => '09000000000',
                ]
            );

            // Now create/link the User account using the Student's actual PK
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'password'          => bcrypt('password'),
                    'role'              => User::ROLE_STUDENT,
                    'student_id'        => $student->id,   // correct FK to students.id
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
