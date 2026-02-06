<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\Department;
use App\Models\Program;
use App\Models\YearLevel;
use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();
        $middleName = $this->faker->lastName();
        
        return [
            'student_id' => 'STU-' . $this->faker->unique()->numerify('######'),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'middle_name' => $middleName,
            'suffix' => $this->faker->optional(0.1)->randomElement(['Jr.', 'Sr.', 'II', 'III']),
            'lrn' => $this->faker->unique()->numerify('############'),
            'email' => strtolower($firstName . '.' . $lastName . '@example.com'),
            'phone' => $this->faker->phoneNumber(),
            'date_of_birth' => $this->faker->dateTimeBetween('-25 years', '-15 years'),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'religion' => $this->faker->optional()->randomElement(['Catholic', 'Protestant', 'Muslim', 'Buddhist', 'Other']),
            'mother_tongue' => $this->faker->optional()->randomElement(['Tagalog', 'Bisaya', 'Ilocano', 'Hiligaynon']),
            'dialects' => $this->faker->optional()->randomElement(['Tagalog', 'Bisaya', 'Ilocano', 'Waray']),
            'ethnicities' => $this->faker->optional()->randomElement(['Filipino', 'Chinese-Filipino', 'Mestizo']),
            'complete_address' => $this->faker->streetAddress() . ', Barangay ' . $this->faker->word(),
            'city_municipality' => $this->faker->city(),
            'zip_code' => $this->faker->postcode(),
            'student_type' => $this->faker->randomElement(['new', 'transferee', 'returnee']),
            'school_year' => '2024-2025',
            'enrollment_status' => $this->faker->randomElement(['pending-registrar', 'pending-accounting', 'enrolled']),
            'requirements_status' => $this->faker->randomElement(['incomplete', 'pending', 'complete']),
            'requirements_percentage' => $this->faker->numberBetween(0, 100),
            'guardian_name' => $this->faker->name(),
            'guardian_relationship' => $this->faker->randomElement(['Mother', 'Father', 'Sibling', 'Grandparent', 'Legal Guardian']),
            'guardian_contact' => $this->faker->phoneNumber(),
            'guardian_email' => $this->faker->optional()->safeEmail(),
            'remarks' => $this->faker->optional()->sentence(),
        ];
    }
}

