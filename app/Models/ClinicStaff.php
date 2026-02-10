<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClinicStaff extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'clinic_staff';

    protected $fillable = [
        'employee_id',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'zip_code',
        'position',
        'license_number',
        'employment_status',
        'hire_date',
        'photo_url',
        'is_active',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'hire_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $appends = ['full_name'];

    /**
     * Get full name attribute.
     */
    public function getFullNameAttribute(): string
    {
        $name = $this->first_name;
        
        if ($this->middle_name) {
            $name .= ' ' . $this->middle_name;
        }
        
        $name .= ' ' . $this->last_name;
        
        if ($this->suffix) {
            $name .= ' ' . $this->suffix;
        }
        
        return $name;
    }

    /**
     * Get the user account for this clinic staff.
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'clinic_staff_id');
    }

    /**
     * Scope a query to only include active clinic staff.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
