<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'lrn',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'religion',
        'mother_tongue',
        'dialects',
        'ethnicities',
        'complete_address',
        'city_municipality',
        'zip_code',
        'student_type',
        'school_year',
        'program',
        'year_level',
        'section',
        'department_id',
        'year_level_id',
        'section_id',
        'enrollment_status',
        'requirements_status',
        'requirements_percentage',
        'guardian_name',
        'guardian_relationship',
        'guardian_contact',
        'guardian_email',
        'student_photo_url',
        'remarks',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
        'requirements_percentage' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['requirements_completion_percentage'];

    /**
     * Get the student's full name.
     */
    public function getFullNameAttribute(): string
    {
        $name = "{$this->first_name}";
        
        if ($this->middle_name) {
            $name .= " {$this->middle_name}";
        }
        
        $name .= " {$this->last_name}";
        
        if ($this->suffix && !in_array(strtolower($this->suffix), ['none', ''])) {
            $name .= " {$this->suffix}";
        }
        
        return $name;
    }

    /**
     * Get the student's year and section.
     */
    public function getYearSectionAttribute(): string
    {
        $yearSection = $this->year_level;
        
        if ($this->section) {
            $yearSection .= " - {$this->section}";
        }
        
        return $yearSection;
    }

    /**
     * Scope a query to only include students with a specific enrollment status.
     */
    public function scopeWithEnrollmentStatus($query, string $status)
    {
        return $query->where('enrollment_status', $status);
    }

    /**
     * Scope a query to only include students from a specific school year.
     */
    public function scopeForSchoolYear($query, string $schoolYear)
    {
        return $query->where('school_year', $schoolYear);
    }

    /**
     * Scope a query to only include students of a specific type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('student_type', $type);
    }

    /**
     * Get the section this student is assigned to
     */
    public function sectionModel()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    /**
     * Get the department this student belongs to
     */
    public function departmentModel()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the department (alias for departmentModel)
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the year level of this student
     */
    public function yearLevelModel()
    {
        return $this->belongsTo(YearLevel::class, 'year_level_id');
    }

    /**
     * Get the requirements for this student
     */
    public function requirements()
    {
        return $this->hasMany(StudentRequirement::class);
    }

    /**
     * Get action logs for this student
     */
    public function actionLogs()
    {
        return $this->hasMany(StudentActionLog::class)->orderByDesc('created_at');
    }

    /**
     * Get enrollment history for this student
     */
    public function enrollmentHistories()
    {
        return $this->hasMany(StudentEnrollmentHistory::class)->orderByDesc('school_year');
    }

    /**
     * Get the enrollment clearance for this student
     */
    public function enrollmentClearance()
    {
        return $this->hasOne(EnrollmentClearance::class, 'user_id');
    }

    /**
     * Get all fee records for this student
     */
    public function fees()
    {
        return $this->hasMany(StudentFee::class);
    }

    /**
     * Get all payment records for this student
     */
    public function payments()
    {
        return $this->hasMany(StudentPayment::class);
    }

    /**
     * Get the current school year fee record
     */
    public function currentFee()
    {
        return $this->hasOne(StudentFee::class)->where('school_year', $this->school_year);
    }

    /**
     * Get completion percentage for requirements
     */
    public function getRequirementsCompletionPercentageAttribute(): int
    {
        $total = $this->requirements()->count();
        if ($total === 0) return 0;
        
        $completed = $this->requirements()->where('status', 'approved')->count();
        return (int) round(($completed / $total) * 100);
    }
}
