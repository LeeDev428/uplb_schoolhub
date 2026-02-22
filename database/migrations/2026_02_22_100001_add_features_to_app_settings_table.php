<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_settings', function (Blueprint $table) {
            $table->string('features_section_title', 200)->nullable()->after('nav_links');
            $table->string('features_section_subtitle', 400)->nullable()->after('features_section_title');
            $table->boolean('features_show')->default(true)->after('features_section_subtitle');
            $table->json('features_items')->nullable()->after('features_show');
        });
    }

    public function down(): void
    {
        Schema::table('app_settings', function (Blueprint $table) {
            $table->dropColumn(['features_section_title', 'features_section_subtitle', 'features_show', 'features_items']);
        });
    }
};
