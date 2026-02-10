<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ParentModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'parents';

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'email',
        'phone',
        'relationship',
        'address',
        'occupation',
        'workplace',
        'emergency_contact',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'parent_student')
            ->withPivot('relationship_type', 'is_primary')
            ->withTimestamps();
    }

    public function user()
    {
        return $this->hasOne(User::class, 'parent_id');
    }

    public function getFullNameAttribute(): string
    {
        $name = "{$this->first_name}";
        if ($this->middle_name) {
            $name .= " {$this->middle_name}";
        }
        $name .= " {$this->last_name}";
        return $name;
    }
}
