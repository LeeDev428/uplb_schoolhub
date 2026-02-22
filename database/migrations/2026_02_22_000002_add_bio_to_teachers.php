<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add bio/description to teachers for landing page faculty cards
        Schema::table('teachers', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('specialization');
            $table->boolean('show_on_landing')->default(true)->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['bio', 'show_on_landing']);
        });
    }
};
