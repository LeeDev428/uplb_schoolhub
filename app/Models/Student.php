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
        'complete_address',
        'city_municipality',
        'zip_code',
        'student_type',
        'school_year',
        'program',
        'year_level',
        'section',
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
     * Get the student's full name.
     */
    public function getFullNameAttribute(): string
    {
        $name = "{$this->first_name}";
        
        if ($this->middle_name) {
            $name .= " {$this->middle_name}";
        }
        
        $name .= " {$this->last_name}";
        
        if ($this->suffix) {
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
     * Get the requirements for this student
     */
    public function requirements()
    {
        return $this->hasMany(StudentRequirement::class);
    }

    /**
     * Get the enrollment clearance for this student
     */
    public function enrollmentClearance()
    {
        return $this->hasOne(EnrollmentClearance::class, 'user_id');
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
