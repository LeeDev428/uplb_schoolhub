<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add K-12 / College enable flags to app_settings
        Schema::table('app_settings', function (Blueprint $table) {
            $table->boolean('has_k12')->default(true)->after('secondary_color');
            $table->boolean('has_college')->default(true)->after('has_k12');
        });

        // Make subjects.units nullable (some schools use K-12 which has no credit units)
        Schema::table('subjects', function (Blueprint $table) {
            $table->decimal('units', 3, 1)->nullable()->default(null)->change();
        });
    }

    public function down(): void
    {
        Schema::table('app_settings', function (Blueprint $table) {
            $table->dropColumn(['has_k12', 'has_college']);
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->decimal('units', 3, 1)->default(3.0)->change();
        });
    }
};
