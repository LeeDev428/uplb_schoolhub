<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
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

    protected $appends = ['profile_photo_url'];

    /**
     * Get the URL of the user's profile photo based on their role.
     */
    public function getProfilePhotoUrlAttribute(): ?string
    {
        if ($this->student_id && $this->student) {
            return $this->student->student_photo_url;
        }
        
        if ($this->teacher_id && $this->teacher) {
            return $this->teacher->photo_url;
        }
        
        if ($this->parent_id && $this->parent) {
            return $this->parent->photo_url ?? null;
        }
        
        return null;
    }

    /**
     * Check if user is owner
     */
    public function isOwner(): bool
    {
        return $this->role === self::ROLE_OWNER;
    }

    /**
     * Only enforce email verification for student and parent roles.
     * All other roles are treated as already verified.
     */
    public function hasVerifiedEmail(): bool
    {
        if (!in_array($this->role, [self::ROLE_STUDENT, self::ROLE_PARENT])) {
            return true;
        }

        return parent::hasVerifiedEmail();
    }

    /**
     * Send the account-created notification with credentials + verify link.
     * Only sent for student and parent roles.
     */
    public function sendEmailVerificationNotification(): void
    {
        if (!in_array($this->role, [self::ROLE_STUDENT, self::ROLE_PARENT])) {
            return;
        }

        $loginId = $this->username ?? $this->email;
        $this->notify(new \App\Notifications\AccountCreatedNotification($loginId));
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
