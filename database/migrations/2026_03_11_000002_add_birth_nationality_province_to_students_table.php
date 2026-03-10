<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('place_of_birth')->nullable()->after('date_of_birth');
            $table->string('nationality')->nullable()->after('religion');
            $table->string('province')->nullable()->after('city_municipality');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['place_of_birth', 'nationality', 'province']);
        });
    }
};
