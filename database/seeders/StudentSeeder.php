<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentSeeder extends Seeder
{
    /**
     * Generate a unique username for a student
     */
    private function generateUniqueUsername(string $firstName, string $lastName): string
    {
        // Get first letter of first name
        $firstInitial = strtolower(substr($firstName, 0, 1));
        
        // Clean last name (remove special characters and spaces)
        $cleanLastName = strtolower(preg_replace('/[^a-zA-Z]/', '', $lastName));
        
        // Generate unique username with random 3-digit number
        do {
            $randomDigits = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
            $username = $firstInitial . $cleanLastName . $randomDigits;
        } while (User::where('username', $username)->exists());
        
        return $username;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = [
            [
                'first_name' => 'John',
                'middle_name' => 'Michael',
                'last_name' => 'Doe',
                'suffix' => 'Jr.',
                'lrn' => '123456789012',
                'email' => 'john.doe@student.edu',
                'phone' => '+63 912 345 6789',
                'date_of_birth' => '2005-03-15',
                'gender' => 'male',
                'complete_address' => '123 Main Street, Barangay San Jose',
                'city_municipality' => 'Manila',
                'zip_code' => '1000',
                'student_type' => 'new',
                'school_year' => '2024-2025',
                'program' => 'BS Information Technology',
                'year_level' => '3rd Year',
                'section' => 'Section A',
                'enrollment_status' => 'enrolled',
                'requirements_status' => 'complete',
                'requirements_percentage' => 100,
                'guardian_name' => 'John Doe Sr.',
                'guardian_relationship' => 'Father',
                'guardian_contact' => '+63 912 345 6788',
                'guardian_email' => 'john.sr@example.com',
                'remarks' => 'graduating',
            ],
            [
                'first_name' => 'Maria',
                'middle_name' => 'Cristina',
                'last_name' => 'Santos',
                'suffix' => null,
                'lrn' => '234567890123',
                'email' => 'maria.santos@student.edu',
                'phone' => '+63 923 456 7890',
                'date_of_birth' => '2006-07-20',
                'gender' => 'female',
                'complete_address' => '456 Second Avenue, Barangay Santa Cruz',
                'city_municipality' => 'Quezon City',
                'zip_code' => '1100',
                'student_type' => 'transferee',
                'school_year' => '2024-2025',
                'program' => 'BS Computer Science',
                'year_level' => '2nd Year',
                'section' => 'Section B',
                'enrollment_status' => 'pending-accounting',
                'requirements_status' => 'pending',
                'requirements_percentage' => 75,
                'guardian_name' => 'Rosa Santos',
                'guardian_relationship' => 'Mother',
                'guardian_contact' => '+63 923 456 7891',
                'guardian_email' => 'rosa.santos@example.com',
                'remarks' => 'part-time',
            ],
            [
                'first_name' => 'Carlos',
                'middle_name' => 'Antonio',
                'last_name' => 'Reyes',
                'suffix' => null,
                'lrn' => '345678901234',
                'email' => 'carlos.reyes@student.edu',
                'phone' => '+63 934 567 8901',
                'date_of_birth' => '2004-11-08',
                'gender' => 'male',
                'complete_address' => '789 Third Street, Barangay Poblacion',
                'city_municipality' => 'Makati',
                'zip_code' => '1200',
                'student_type' => 'returnee',
                'school_year' => '2024-2025',
                'program' => 'BS Business Administration',
                'year_level' => '4th Year',
                'section' => 'Section A',
                'enrollment_status' => 'pending-registrar',
                'requirements_status' => 'incomplete',
                'requirements_percentage' => 45,
                'guardian_name' => 'Pedro Reyes',
                'guardian_relationship' => 'Father',
                'guardian_contact' => '+63 934 567 8902',
                'guardian_email' => null,
                'remarks' => 'full-time',
            ],
            [
                'first_name' => 'Ana',
                'middle_name' => 'Marie',
                'last_name' => 'Cruz',
                'suffix' => null,
                'lrn' => '456789012345',
                'email' => 'ana.cruz@student.edu',
                'phone' => '+63 945 678 9012',
                'date_of_birth' => '2007-01-25',
                'gender' => 'female',
                'complete_address' => '321 Fourth Road, Barangay Bagong Silang',
                'city_municipality' => 'Caloocan',
                'zip_code' => '1400',
                'student_type' => 'new',
                'school_year' => '2024-2025',
                'program' => 'BS Information Technology',
                'year_level' => '1st Year',
                'section' => 'Section C',
                'enrollment_status' => 'not-enrolled',
                'requirements_status' => 'pending',
                'requirements_percentage' => 60,
                'guardian_name' => 'Carmen Cruz',
                'guardian_relationship' => 'Mother',
                'guardian_contact' => '+63 945 678 9013',
                'guardian_email' => 'carmen.cruz@example.com',
                'remarks' => null,
            ],
            [
                'first_name' => 'Luis',
                'middle_name' => 'Gabriel',
                'last_name' => 'Torres',
                'suffix' => null,
                'lrn' => '567890123456',
                'email' => 'luis.torres@student.edu',
                'phone' => '+63 956 789 0123',
                'date_of_birth' => '2005-09-12',
                'gender' => 'male',
                'complete_address' => '654 Fifth Lane, Barangay Tondo',
                'city_municipality' => 'Manila',
                'zip_code' => '1000',
                'student_type' => 'new',
                'school_year' => '2024-2025',
                'program' => 'BS Accountancy',
                'year_level' => '2nd Year',
                'section' => 'TBD',
                'enrollment_status' => 'pending-registrar',
                'requirements_status' => 'incomplete',
                'requirements_percentage' => 30,
                'guardian_name' => 'Eduardo Torres',
                'guardian_relationship' => 'Father',
                'guardian_contact' => '+63 956 789 0124',
                'guardian_email' => 'eduardo.torres@example.com',
                'remarks' => null,
            ],
        ];

        foreach ($students as $student) {
            // Create or update student record
            $createdStudent = Student::updateOrCreate(
                ['lrn' => $student['lrn']],
                $student
            );
            
            // Check if User already exists
            $existingUser = User::where('email', $student['email'])->first();
            
            if ($existingUser) {
                // Update existing user
                $existingUser->update([
                    'name' => trim($student['first_name'] . ' ' . ($student['middle_name'] ?? '') . ' ' . $student['last_name'] . ($student['suffix'] ? ' ' . $student['suffix'] : '')),
                    'student_id' => $createdStudent->id,
                    'role' => User::ROLE_STUDENT,
                ]);
                $this->command->info("Updated student: {$existingUser->username} (password: password)");
            } else {
                // Generate unique username
                $username = $this->generateUniqueUsername($student['first_name'], $student['last_name']);
                
                // Create new User account
                User::create([
                    'name' => trim($student['first_name'] . ' ' . ($student['middle_name'] ?? '') . ' ' . $student['last_name'] . ($student['suffix'] ? ' ' . $student['suffix'] : '')),
                    'username' => $username,
                    'email' => $student['email'],
                    'password' => Hash::make('password'),
                    'student_id' => $createdStudent->id,
                    'role' => User::ROLE_STUDENT,
                    'email_verified_at' => now(),
                ]);
                
                $this->command->info("Created student: {$username} (password: password)");
            }
        }
    }
}
