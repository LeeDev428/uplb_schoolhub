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

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'lrn' => ['required', 'string', Rule::unique('students', 'lrn')->ignore($studentId), 'max:255'],
            'email' => ['required', 'email', Rule::unique('students', 'email')->ignore($studentId), 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['required', 'date'],
            'gender' => ['required', 'in:male,female,other'],
            'complete_address' => ['required', 'string'],
            'city_municipality' => ['required', 'string', 'max:255'],
            'zip_code' => ['required', 'string', 'max:10'],
            'student_type' => ['required', 'in:new,transferee,returnee'],
            'school_year' => ['required', 'string', 'max:50'],
            'program' => ['required', 'string', 'max:255'],
            'year_level' => ['required', 'string', 'max:50'],
            'section' => ['nullable', 'string', 'max:100'],
            'enrollment_status' => ['nullable', 'in:not-enrolled,pending-registrar,pending-accounting,enrolled,graduated,dropped'],
            'requirements_status' => ['nullable', 'in:incomplete,pending,complete'],
            'requirements_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'guardian_name' => ['required', 'string', 'max:255'],
            'guardian_relationship' => ['required', 'string', 'max:100'],
            'guardian_contact' => ['required', 'string', 'max:20'],
            'guardian_email' => ['nullable', 'email', 'max:255'],
            'student_photo_url' => ['nullable', 'url', 'max:500'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ];
    }
}
