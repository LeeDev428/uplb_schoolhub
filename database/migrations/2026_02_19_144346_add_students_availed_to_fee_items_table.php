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
        Schema::table('fee_items', function (Blueprint $table) {
            $table->unsignedInteger('students_availed')->default(0)->after('selling_price');
        });

        Schema::table('document_fee_items', function (Blueprint $table) {
            $table->unsignedInteger('students_availed')->default(0)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('fee_items', function (Blueprint $table) {
            $table->dropColumn('students_availed');
        });

        Schema::table('document_fee_items', function (Blueprint $table) {
            $table->dropColumn('students_availed');
        });
    }
};
