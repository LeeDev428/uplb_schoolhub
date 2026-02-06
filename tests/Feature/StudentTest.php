<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\Department;
use App\Models\Program;
use App\Models\YearLevel;
use App\Models\Section;
use App\Models\Requirement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentTest extends TestCase
{
    use RefreshDatabase;

    protected User $registrar;
    protected Department $department;
    protected Program $program;
    protected YearLevel $yearLevel;
    protected Section $section;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a registrar user
        $this->registrar = User::factory()->create([
            'role' => User::ROLE_REGISTRAR,
            'email_verified_at' => now(),
        ]);

        // Create academic structure
        $this->department = Department::create([
            'name' => 'College of Computer Science',
            'level' => 'college',
            'description' => 'College Department',
        ]);

        $this->program = Program::create([
            'name' => 'Bachelor of Science in Information Technology',
            'department_id' => $this->department->id,
            'description' => 'IT Program',
        ]);

        $this->yearLevel = YearLevel::create([
            'name' => '1st Year',
            'level_number' => 1,
            'department_id' => $this->department->id,
        ]);

        $this->section = Section::create([
            'name' => 'Section A',
            'year_level_id' => $this->yearLevel->id,
            'program_id' => $this->program->id,
            'capacity' => 40,
            'school_year' => '2024-2025',
        ]);

        // Create requirements for auto-assignment
        Requirement::create(['name' => 'Form 138', 'description' => 'Report Card', 'category' => 'Academic Records']);
        Requirement::create(['name' => 'Birth Certificate', 'description' => 'PSA Birth Certificate', 'category' => 'Personal Documents']);
        Requirement::create(['name' => 'Medical Records', 'description' => 'Medical Certificate', 'category' => 'Health Documents']);
    }

    /** @test */
    public function registrar_can_create_a_student()
    {
        $studentData = [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'middle_name' => 'Santos',
            'suffix' => 'Jr.',
            'lrn' => '123456789012',
            'email' => 'juan.delacruz@example.com',
            'phone' => '+63 912 345 6789',
            'date_of_birth' => '2000-05-15',
            'gender' => 'male',
            'religion' => 'Catholic',
            'mother_tongue' => 'Tagalog',
            'dialects' => 'Bisaya',
            'ethnicities' => 'Filipino',
            'complete_address' => '123 Main Street, Barangay Central',
            'city_municipality' => 'Los Baños',
            'zip_code' => '4030',
            'student_type' => 'new',
            'school_year' => '2024-2025',
            'program' => $this->program->name,
            'year_level' => $this->yearLevel->name,
            'section' => $this->section->name,
            'enrollment_status' => 'pending-registrar',
            'requirements_status' => 'incomplete',
            'guardian_name' => 'Maria Dela Cruz',
            'guardian_relationship' => 'Mother',
            'guardian_contact' => '+63 912 345 6780',
            'guardian_email' => 'maria.delacruz@example.com',
            'remarks' => 'New student for SY 2024-2025',
        ];

        $response = $this->actingAs($this->registrar)
            ->post(route('registrar.students.store'), $studentData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Assert student was created in database
        $this->assertDatabaseHas('students', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'lrn' => '123456789012',
            'email' => 'juan.delacruz@example.com',
        ]);

        // Assert student user account was created
        $student = Student::where('lrn', '123456789012')->first();
        $this->assertNotNull($student);
        
        $user = User::where('student_id', $student->id)->first();
        $this->assertNotNull($user);
        $this->assertEquals(User::ROLE_STUDENT, $user->role);
        $this->assertNotNull($user->username);
        $this->assertTrue(strlen($user->username) > 4); // At least firstInitial + lastname + 3 digits

        // Assert requirements were auto-assigned
        $this->assertDatabaseHas('student_requirements', [
            'student_id' => $student->id,
            'status' => 'pending',
        ]);
        $this->assertEquals(3, $student->requirements()->count());
    }

    /** @test */
    public function student_creation_validates_required_fields()
    {
        $response = $this->actingAs($this->registrar)
            ->post(route('registrar.students.store'), []);

        $response->assertSessionHasErrors([
            'first_name',
            'last_name',
            'email',
            'date_of_birth',
            'gender',
        ]);
    }

    /** @test */
    public function student_creation_validates_unique_email()
    {
        $existingStudent = Student::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $studentData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'existing@example.com',
            'phone' => '+63 912 345 6789',
            'date_of_birth' => '2000-01-01',
            'gender' => 'male',
            'complete_address' => '123 Street',
            'city_municipality' => 'Los Baños',
            'zip_code' => '4030',
            'student_type' => 'new',
            'school_year' => '2024-2025',
            'year_level' => $this->yearLevel->name,
            'section' => $this->section->name,
            'enrollment_status' => 'pending-registrar',
            'guardian_name' => 'Jane Doe',
            'guardian_relationship' => 'Mother',
            'guardian_contact' => '+63 912 345 6780',
        ];

        $response = $this->actingAs($this->registrar)
            ->post(route('registrar.students.store'), $studentData);

        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function registrar_can_update_a_student()
    {
        $student = Student::factory()->create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
            'program_id' => $this->program->id,
            'year_level_id' => $this->yearLevel->id,
            'section_id' => $this->section->id,
        ]);

        $updatedData = [
            'first_name' => 'Jane Updated',
            'last_name' => 'Smith Updated',
            'middle_name' => 'Middle',
            'suffix' => 'Sr.',
            'lrn' => $student->lrn,
            'email' => 'jane.updated@example.com',
            'phone' => $student->phone,
            'date_of_birth' => $student->date_of_birth->format('Y-m-d'),
            'gender' => $student->gender,
            'complete_address' => 'Updated Address',
            'city_municipality' => 'Updated City',
            'zip_code' => '4031',
            'student_type' => $student->student_type,
            'school_year' => $student->school_year,
            'program' => $this->program->name,
            'year_level' => $this->yearLevel->name,
            'section' => $this->section->name,
            'enrollment_status' => 'enrolled',
            'requirements_status' => 'complete',
            'guardian_name' => $student->guardian_name,
            'guardian_relationship' => $student->guardian_relationship,
            'guardian_contact' => $student->guardian_contact,
        ];

        $response = $this->actingAs($this->registrar)
            ->put(route('registrar.students.update', $student), $updatedData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Assert student was updated
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'first_name' => 'Jane Updated',
            'last_name' => 'Smith Updated',
            'email' => 'jane.updated@example.com',
            'complete_address' => 'Updated Address',
            'enrollment_status' => 'enrolled',
        ]);
    }

    /** @test */
    public function registrar_can_view_student_details()
    {
        $student = Student::factory()->create([
            'program_id' => $this->program->id,
            'year_level_id' => $this->yearLevel->id,
            'section_id' => $this->section->id,
        ]);

        $response = $this->actingAs($this->registrar)
            ->get(route('registrar.students.show', $student));

        $response->assertOk();
        $response->assertInertia(fn($page) => 
            $page->component('registrar/students/show')
                ->has('student', fn($student) => 
                    $student->where('id', $student->id)
                        ->etc()
                )
        );
    }

    /** @test */
    public function registrar_can_delete_a_student()
    {
        $student = Student::factory()->create();

        $response = $this->actingAs($this->registrar)
            ->delete(route('registrar.students.destroy', $student));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('students', [
            'id' => $student->id,
        ]);
    }

    /** @test */
    public function registrar_can_drop_a_student()
    {
        $student = Student::factory()->create([
            'enrollment_status' => 'enrolled',
        ]);

        $response = $this->actingAs($this->registrar)
            ->put(route('registrar.students.drop', $student));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'enrollment_status' => 'dropped',
        ]);
    }

    /** @test */
    public function student_cannot_access_registrar_routes()
    {
        $student = Student::factory()->create();
        $studentUser = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($studentUser)
            ->get(route('registrar.students.index'));

        $response->assertForbidden();
    }

    /** @test */
    public function guest_cannot_access_student_routes()
    {
        $response = $this->get(route('registrar.students.index'));

        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function date_of_birth_must_be_valid_date()
    {
        $studentData = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '+63 912 345 6789',
            'date_of_birth' => 'invalid-date',
            'gender' => 'male',
            'complete_address' => '123 Street',
            'city_municipality' => 'Los Baños',
            'zip_code' => '4030',
            'student_type' => 'new',
            'school_year' => '2024-2025',
            'year_level' => $this->yearLevel->name,
            'section' => $this->section->name,
            'enrollment_status' => 'pending-registrar',
            'guardian_name' => 'Guardian Name',
            'guardian_relationship' => 'Mother',
            'guardian_contact' => '+63 912 345 6780',
        ];

        $response = $this->actingAs($this->registrar)
            ->post(route('registrar.students.store'), $studentData);

        $response->assertSessionHasErrors(['date_of_birth']);
    }

    /** @test */
    public function date_of_birth_can_be_manually_entered()
    {
        $studentData = [
            'first_name' => 'Manual',
            'last_name' => 'Entry',
            'middle_name' => 'Test',
            'lrn' => '987654321012',
            'email' => 'manual.entry@example.com',
            'phone' => '+63 912 345 6789',
            'date_of_birth' => '1995-08-25', // Manually entered date
            'gender' => 'female',
            'complete_address' => '456 Test Street',
            'city_municipality' => 'Los Baños',
            'zip_code' => '4030',
            'student_type' => 'new',
            'school_year' => '2024-2025',
            'program' => $this->program->name,
            'year_level' => $this->yearLevel->name,
            'section' => $this->section->name,
            'enrollment_status' => 'pending-registrar',
            'guardian_name' => 'Test Guardian',
            'guardian_relationship' => 'Father',
            'guardian_contact' => '+63 912 345 6780',
        ];

        $response = $this->actingAs($this->registrar)
            ->post(route('registrar.students.store'), $studentData);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('students', [
            'first_name' => 'Manual',
            'last_name' => 'Entry',
            'date_of_birth' => '1995-08-25',
        ]);
    }
}
