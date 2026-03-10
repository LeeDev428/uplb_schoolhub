<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $studentId = $this->route('student');

        // Resolve the associated user ID so we can ignore it in the users table
        $studentModel = is_object($studentId) ? $studentId : \App\Models\Student::find($studentId);
        $userId       = $studentModel?->user?->id;

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'lrn' => ['required', 'string', Rule::unique('students', 'lrn')->ignore($studentId), 'max:255'],
            'email' => ['required', 'email', Rule::unique('students', 'email')->ignore($studentId), Rule::unique('users', 'email')->ignore($userId), 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['required', 'in:male,female,other'],
            'religion' => ['nullable', 'string', 'max:255'],
            'mother_tongue' => ['nullable', 'string', 'max:255'],
            'dialects' => ['nullable', 'string', 'max:255'],
            'ethnicities' => ['nullable', 'string', 'max:255'],
            'complete_address' => ['required', 'string'],
            'street_address' => ['nullable', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:255'],
            'city_municipality' => ['required', 'string', 'max:255'],
            'zip_code' => ['required', 'string', 'max:10'],
            'last_school_attended' => ['nullable', 'string', 'max:255'],
            'school_address_attended' => ['nullable', 'string', 'max:255'],
            'student_type' => ['required', 'in:new,transferee,returnee'],
            'school_year' => ['required', 'string', 'max:50'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'program' => ['nullable', 'string', 'max:255'],
            'year_level' => ['required', 'string', 'max:50'],
            'year_level_id' => ['nullable', 'exists:year_levels,id'],
            'section' => ['nullable', 'string', 'max:100'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'enrollment_status' => ['nullable', 'in:not-enrolled,pending-registrar,pending-accounting,pending-enrollment,enrolled,graduated,dropped'],
            'requirements_status' => ['nullable', 'in:incomplete,pending,complete'],
            'requirements_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'guardian_name' => ['required', 'string', 'max:255'],
            'guardian_relationship' => ['required', 'string', 'max:100'],
            'guardian_contact' => ['required', 'string', 'max:20'],
            'guardian_email' => ['nullable', 'email', 'max:255'],
            'guardian_occupation' => ['nullable', 'string', 'max:255'],
            'student_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
