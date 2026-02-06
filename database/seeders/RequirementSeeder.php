<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RequirementCategory;
use App\Models\Requirement;
use App\Models\Student;
use App\Models\StudentRequirement;

class RequirementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Common Requirements Category
        $commonCategory = RequirementCategory::create([
            'name' => 'Common Requirements',
            'slug' => 'common-requirements',
            'description' => 'Standard requirements for all students',
            'order' => 1,
            'is_active' => true,
        ]);

        // Create the 6 standard requirements
        $requirements = [
            [
                'name' => 'Form 138 (Report Card)',
                'description' => 'Original or certified true copy of Form 138 (Report Card)',
                'order' => 1,
            ],
            [
                'name' => 'Birth Certificate',
                'description' => 'NSO/PSA issued Birth Certificate',
                'order' => 2,
            ],
            [
                'name' => 'Medical Records',
                'description' => 'Medical examination results and health records',
                'order' => 3,
            ],
            [
                'name' => 'Good Moral Certificate',
                'description' => 'Certificate of Good Moral Character from previous school',
                'order' => 4,
            ],
            [
                'name' => 'ID Pictures',
                'description' => '2x2 ID pictures (4 copies, white background)',
                'order' => 5,
            ],
            [
                'name' => 'Registration Form',
                'description' => 'Accomplished registration form',
                'order' => 6,
            ],
        ];

        foreach ($requirements as $req) {
            Requirement::create([
                'requirement_category_id' => $commonCategory->id,
                'name' => $req['name'],
                'description' => $req['description'],
                'deadline_type' => 'during_enrollment',
                'applies_to_new_enrollee' => true,
                'applies_to_transferee' => true,
                'applies_to_returning' => true,
                'is_required' => true,
                'order' => $req['order'],
                'is_active' => true,
            ]);
        }

        // Assign requirements to all existing students
        $allRequirements = Requirement::all();
        $students = Student::all();

        foreach ($students as $student) {
            foreach ($allRequirements as $requirement) {
                StudentRequirement::create([
                    'student_id' => $student->id,
                    'requirement_id' => $requirement->id,
                    'status' => 'pending',
                ]);
            }
        }
    }
}
        ];

        foreach ($requirements as $req) {
            Requirement::create([
                'requirement_category_id' => $req['category_id'],
                'name' => $req['name'],
                'description' => $req['description'],
                'deadline_type' => $req['deadline_type'],
                'applies_to_new_enrollee' => $req['applies_to']['new_enrollee'] ?? false,
                'applies_to_transferee' => $req['applies_to']['transferee'] ?? false,
                'applies_to_returning' => $req['applies_to']['returning'] ?? false,
            ]);
        }

        // Assign requirements to existing students
        $students = Student::all();
        $allRequirements = Requirement::all();

        foreach ($students as $student) {
            // Get applicable requirements based on student type
            $applicableRequirements = $allRequirements->filter(function ($req) use ($student) {
                return match ($student->student_type) {
                    'new' => $req->applies_to_new_enrollee,
                    'transferee' => $req->applies_to_transferee,
                    'returning' => $req->applies_to_returning,
                    default => false,
                };
            });

            foreach ($applicableRequirements as $requirement) {
                // Randomly assign status for demo purposes
                $statuses = ['pending', 'submitted', 'approved', 'pending', 'approved'];
                $status = $statuses[array_rand($statuses)];

                StudentRequirement::create([
                    'student_id' => $student->id,
                    'requirement_id' => $requirement->id,
                    'status' => $status,
                    'submitted_at' => in_array($status, ['submitted', 'approved']) ? now()->subDays(rand(1, 30)) : null,
                    'approved_at' => $status === 'approved' ? now()->subDays(rand(1, 15)) : null,
                ]);
            }
        }
    }
}
