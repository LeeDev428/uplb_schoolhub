<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * User role constants
     */
    public const ROLE_OWNER = 'owner';

    public const ROLE_REGISTRAR = 'registrar';

    public const ROLE_ACCOUNTING = 'accounting';

    public const ROLE_STUDENT = 'student';

    public const ROLE_TEACHER = 'teacher';

    public const ROLE_PARENT = 'parent';

    public const ROLE_GUIDANCE = 'guidance';

    public const ROLE_LIBRARIAN = 'librarian';

    public const ROLE_CLINIC = 'clinic';

    public const ROLE_CANTEEN = 'canteen';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'role',
        'student_id',
        'teacher_id',
        'parent_id',
        'clinic_staff_id',
        'canteen_staff_id',
        'phone',
        'department',
        'program',
        'year_level',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Check if user is owner
     */
    public function isOwner(): bool
    {
        return $this->role === self::ROLE_OWNER;
    }

    /**
     * Check if user is registrar
     */
    public function isRegistrar(): bool
    {
        return $this->role === self::ROLE_REGISTRAR;
    }

    /**
     * Check if user is student
     */
    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

    /**
     * Check if user is teacher
     */
    public function isTeacher(): bool
    {
        return $this->role === self::ROLE_TEACHER;
    }

    /**
     * Check if user is parent
     */
    public function isParent(): bool
    {
        return $this->role === self::ROLE_PARENT;
    }

    /**
     * Check if user is guidance counselor
     */
    public function isGuidance(): bool
    {
        return $this->role === self::ROLE_GUIDANCE;
    }

    /**
     * Check if user is librarian
     */
    public function isLibrarian(): bool
    {
        return $this->role === self::ROLE_LIBRARIAN;
    }

    /**
     * Check if user is clinic staff
     */
    public function isClinic(): bool
    {
        return $this->role === self::ROLE_CLINIC;
    }

    /**
     * Check if user is canteen staff
     */
    public function isCanteen(): bool
    {
        return $this->role === self::ROLE_CANTEEN;
    }

    /**
     * Get the enrollment clearance for this user
     */
    public function enrollmentClearance()
    {
        return $this->hasOne(EnrollmentClearance::class);
    }

    /**
     * Get the student record for this user
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get student requirements for this user
     */
    public function studentRequirements()
    {
        return $this->hasMany(StudentRequirement::class);
    }

    /**
     * Get the teacher record for this user
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the parent record for this user
     */
    public function parent()
    {
        return $this->belongsTo(ParentModel::class, 'parent_id');
    }

    /**
     * Get the clinic staff record for this user
     */
    public function clinicStaff()
    {
        return $this->belongsTo(ClinicStaff::class, 'clinic_staff_id');
    }

    /**
     * Get the canteen staff record for this user
     */
    public function canteenStaff()
    {
        return $this->belongsTo(CanteenStaff::class, 'canteen_staff_id');
    }
}
