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
        'is_active',
        'requirements_status',
        'requirements_percentage',
        'guardian_name',
        'guardian_relationship',
        'guardian_contact',
        'guardian_email',
        'guardian_occupation',
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
        'is_active' => 'boolean',
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
     * Resolve the student's department classification.
     * Falls back to looking up via the program name when department_id is null.
     */
    public function resolveDepartmentClassification(): ?string
    {
        // Direct relation
        if ($this->department_id) {
            return $this->department?->classification;
        }

        // Fallback: look up via program name
        if ($this->program) {
            return Program::where('programs.name', $this->program)
                ->join('departments', 'programs.department_id', '=', 'departments.id')
                ->value('departments.classification');
        }

        return null;
    }

    /**
     * Resolve the student's department ID.
     * Falls back to looking up via the program name when department_id is null.
     */
    public function resolveDepartmentId(): ?int
    {
        if ($this->department_id) {
            return $this->department_id;
        }

        if ($this->program) {
            return Program::where('programs.name', $this->program)->value('department_id');
        }

        return null;
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
        // enrollment_clearances.user_id FK references users.id, not students.id.
        // Use hasOneThrough to correctly join: students → users (via student_id) → enrollment_clearances (via user_id).
        return $this->hasOneThrough(
            EnrollmentClearance::class,
            \App\Models\User::class,
            'student_id', // FK on users referencing students.id
            'user_id',    // FK on enrollment_clearances referencing users.id
            'id',         // local key on students
            'id'          // local key on users
        );
    }

    /**
     * Get the user account linked to this student
     */
    public function user()
    {
        return $this->hasOne(\App\Models\User::class, 'student_id');
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
     * Get all enrolled subjects for this student (student_subjects table)
     */
    public function studentSubjects()
    {
        return $this->hasMany(StudentSubject::class);
    }

    /**
     * Get all attendance records for this student
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get all promissory notes for this student
     */
    public function promissoryNotes()
    {
        return $this->hasMany(PromissoryNote::class);
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

    /**
     * Get subjects available to this student.
     * Based on student's department and year level.
     * Returns a query builder - call get() to retrieve results.
     */
    public function subjectsQuery()
    {
        $query = Subject::where('department_id', $this->department_id)
            ->where('is_active', true);
        
        // Filter by year level if student has one
        if ($this->year_level_id) {
            $query->where(function($q) {
                $q->where('year_level_id', $this->year_level_id)
                  ->orWhereNull('year_level_id');
            });
        }
        
        return $query;
    }

    /**
     * Get subjects collection (for convenient access).
     */
    public function getSubjectsAttribute()
    {
        return $this->subjectsQuery()->get();
    }

    /**
     * Get all guidance records for this student.
     */
    public function guidanceRecords()
    {
        return $this->hasMany(GuidanceRecord::class);
    }

    /**
     * Get all drop requests for this student.
     */
    public function dropRequests()
    {
        return $this->hasMany(DropRequest::class);
    }

    /**
     * Get all refund requests for this student.
     */
    public function refundRequests()
    {
        return $this->hasMany(RefundRequest::class);
    }

    /**
     * Check if the student has a pending drop request.
     */
    public function hasPendingDropRequest(): bool
    {
        return $this->dropRequests()->pending()->exists();
    }

    /**
     * Check if the student has an approved drop request.
     */
    public function hasApprovedDropRequest(): bool
    {
        return $this->dropRequests()->approved()->exists();
    }

    /**
     * Check if the student can request a refund (only after drop approved).
     */
    public function canRequestRefund(): bool
    {
        return $this->enrollment_status === 'dropped' && $this->hasApprovedDropRequest();
    }
}
