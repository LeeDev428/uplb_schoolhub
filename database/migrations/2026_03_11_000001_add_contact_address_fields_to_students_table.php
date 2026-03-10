<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('street_address')->nullable()->after('complete_address');
            $table->string('barangay')->nullable()->after('street_address');
            $table->string('last_school_attended')->nullable()->after('zip_code');
            $table->string('school_address_attended')->nullable()->after('last_school_attended');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['street_address', 'barangay', 'last_school_attended', 'school_address_attended']);
        });
    }
};
