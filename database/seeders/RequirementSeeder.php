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
        // Create Categories
        $newEnrollee = RequirementCategory::create([
            'name' => 'New Enrollee Requirements',
            'slug' => 'new-enrollee',
            'description' => 'Requirements for first-time enrollees',
            'order' => 1,
        ]);

        $transferee = RequirementCategory::create([
            'name' => 'Transferee Requirements',
            'slug' => 'transferee',
            'description' => 'Additional requirements for transfer students',
            'order' => 2,
        ]);

        $common = RequirementCategory::create([
            'name' => 'Common Requirements',
            'slug' => 'common',
            'description' => 'Requirements for all student types',
            'order' => 3,
        ]);

        // New Enrollee Requirements
        $requirements = [
            [
                'category_id' => $newEnrollee->id,
                'name' => 'Form 138 (Report Card)',
                'description' => 'Original copy of high school report card',
                'deadline_type' => 'during_enrollment',
                'applies_to' => ['new_enrollee' => true, 'transferee' => true],
            ],
            [
                'category_id' => $newEnrollee->id,
                'name' => 'Birth Certificate',
                'description' => 'PSA/NSO authenticated birth certificate',
                'deadline_type' => 'during_enrollment',
                'applies_to' => ['new_enrollee' => true, 'transferee' => false, 'returning' => false],
            ],
            [
                'category_id' => $newEnrollee->id,
                'name' => 'Good Moral Certificate',
                'description' => 'Certificate of good moral character',
                'deadline_type' => 'during_enrollment',
                'applies_to' => ['new_enrollee' => true, 'transferee' => true],
            ],
            [
                'category_id' => $newEnrollee->id,
                'name' => 'ID Pictures',
                'description' => 'One set of 1x1 inch ID pictures',
                'deadline_type' => 'before_classes',
                'applies_to' => ['new_enrollee' => true, 'transferee' => true, 'returning' => true],
            ],

            // Transferee Requirements
            [
                'category_id' => $transferee->id,
                'name' => 'Transfer Credential/Honorable Dismissal',
                'description' => 'Transfer credential from previous school',
                'deadline_type' => 'during_enrollment',
                'applies_to' => ['new_enrollee' => false, 'transferee' => true],
            ],
            [
                'category_id' => $transferee->id,
                'name' => 'Transcript of Records (Previous School)',
                'description' => 'Official transcript of records',
                'deadline_type' => 'during_enrollment',
                'applies_to' => ['new_enrollee' => false, 'transferee' => true],
            ],

            // Common Requirements
            [
                'category_id' => $common->id,
                'name' => 'Medical Records',
                'description' => 'Complete medical examination results',
                'deadline_type' => 'before_classes',
                'applies_to' => ['new_enrollee' => true, 'transferee' => true, 'returning' => true],
            ],
            [
                'category_id' => $common->id,
                'name' => 'Registration Form',
                'description' => 'Completed and signed registration form',
                'deadline_type' => 'during_enrollment',
                'applies_to' => ['new_enrollee' => true, 'transferee' => true, 'returning' => true],
            ],
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
