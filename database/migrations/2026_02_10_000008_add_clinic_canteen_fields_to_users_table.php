<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('clinic_staff_id')->nullable()->constrained('clinic_staff')->onDelete('cascade');
            $table->foreignId('canteen_staff_id')->nullable()->constrained('canteen_staff')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['clinic_staff_id']);
            $table->dropForeign(['canteen_staff_id']);
            $table->dropColumn(['clinic_staff_id', 'canteen_staff_id']);
        });
    }
};
