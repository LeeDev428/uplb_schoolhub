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

    public const ROLE_STUDENT = 'student';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'student_id',
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
}
