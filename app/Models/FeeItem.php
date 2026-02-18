<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'fee_category_id',
        'name',
        'code',
        'description',
        'cost_price',
        'selling_price',
        'school_year',
        'program',
        'year_level',
        'classification',
        'department_id',
        'program_id',
        'year_level_id',
        'section_id',
        'assignment_scope',
        'is_required',
        'is_active',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the category this item belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(FeeCategory::class, 'fee_category_id');
    }

    /**
     * Get the department this item is assigned to.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the program this item is assigned to.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the year level this item is assigned to.
     */
    public function yearLevel(): BelongsTo
    {
        return $this->belongsTo(YearLevel::class);
    }

    /**
     * Get the section this item is assigned to.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get the assignments for this fee item.
     */
    public function assignments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(FeeItemAssignment::class);
    }

    /**
     * Get the profit for this item.
     */
    public function getProfitAttribute(): float
    {
        return (float) $this->selling_price - (float) $this->cost_price;
    }

    /**
     * Scope for active items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for required items.
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope for a specific school year.
     */
    public function scopeForSchoolYear($query, string $schoolYear)
    {
        return $query->where(function ($q) use ($schoolYear) {
            $q->where('school_year', $schoolYear)
              ->orWhereNull('school_year');
        });
    }

    /**
     * Scope for a specific program.
     */
    public function scopeForProgram($query, string $program)
    {
        return $query->where(function ($q) use ($program) {
            $q->where('program', $program)
              ->orWhereNull('program');
        });
    }

    /**
     * Scope for a specific year level.
     */
    public function scopeForYearLevel($query, string $yearLevel)
    {
        return $query->where(function ($q) use ($yearLevel) {
            $q->where('year_level', $yearLevel)
              ->orWhereNull('year_level');
        });
    }

    /**
     * Apply this fee to all matching students.
     * Creates/updates StudentFee records based on assignment criteria.
     */
    public function applyToStudents(): int
    {
        if (!$this->school_year) {
            return 0;
        }

        // Build query for matching students
        $studentsQuery = \App\Models\Student::query();

        // For 'specific' scope, apply filters
        if ($this->assignment_scope === 'specific') {
            if ($this->classification) {
                $studentsQuery->whereHas('department', function ($q) {
                    $q->where('classification', $this->classification);
                });
            }

            if ($this->department_id) {
                $studentsQuery->where('department_id', $this->department_id);
            }

            if ($this->program_id) {
                // Match students with this program or text program field
                $program = \App\Models\Program::find($this->program_id);
                if ($program) {
                    $studentsQuery->where(function ($q) use ($program) {
                        $q->where('program', $program->name)
                          ->orWhere('program_id', $program->id);
                    });
                }
            }

            if ($this->year_level_id) {
                $studentsQuery->where('year_level_id', $this->year_level_id);
            }

            if ($this->section_id) {
                $studentsQuery->where('section_id', $this->section_id);
            }
        }
        // For 'all' scope, get all students
        else {
            // Just get all students
        }

        $students = $studentsQuery->get();
        $categoryName = $this->category->name ?? 'Other';
        $affectedCount = 0;

        foreach ($students as $student) {
            // Find or create StudentFee for this student and school year
            $studentFee = \App\Models\StudentFee::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'school_year' => $this->school_year,
                ],
                [
                    'registration_fee' => 0,
                    'tuition_fee' => 0,
                    'misc_fee' => 0,
                    'books_fee' => 0,
                    'other_fees' => 0,
                    'total_amount' => 0,
                    'total_paid' => 0,
                    'balance' => 0,
                ]
            );

            // Map fee category to student fee field
            $feeField = match(strtolower($categoryName)) {
                'registration fee', 'registration' => 'registration_fee',
                'tuition fee', 'tuition' => 'tuition_fee',
                'miscellaneous fee', 'miscellaneous', 'misc' => 'misc_fee',
                'books fee', 'books' => 'books_fee',
                default => 'other_fees',
            };

            // Add this fee item's selling price to the appropriate field
            $studentFee->$feeField = ((float) $studentFee->$feeField) + ((float) $this->selling_price);
            
            // Recalculate total and balance
            $studentFee->total_amount = 
                $studentFee->registration_fee +
                $studentFee->tuition_fee +
                $studentFee->misc_fee +
                $studentFee->books_fee +
                $studentFee->other_fees;
            
            $studentFee->balance = $studentFee->total_amount - $studentFee->total_paid - ($studentFee->grant_discount ?? 0);
            $studentFee->save();

            $affectedCount++;
        }

        return $affectedCount;
    }
}

