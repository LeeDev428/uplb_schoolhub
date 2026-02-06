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
        Schema::table('students', function (Blueprint $table) {
            $table->string('religion')->nullable()->after('gender');
            $table->string('mother_tongue')->nullable()->after('religion');
            $table->string('dialects')->nullable()->after('mother_tongue');
            $table->string('ethnicities')->nullable()->after('dialects');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['religion', 'mother_tongue', 'dialects', 'ethnicities']);
        });
    }
};
