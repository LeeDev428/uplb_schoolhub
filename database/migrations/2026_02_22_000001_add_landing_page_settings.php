<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_settings', function (Blueprint $table) {
            // Hero/Banner section
            $table->string('hero_title')->nullable()->after('has_college');
            $table->string('hero_subtitle')->nullable()->after('hero_title');
            $table->json('hero_images')->nullable()->after('hero_subtitle'); // array of stored paths

            // Faculties section
            $table->string('faculty_section_title')->nullable()->after('hero_images');
            $table->string('faculty_section_subtitle')->nullable()->after('faculty_section_title');

            // Director/Message section
            $table->string('message_title')->nullable()->after('faculty_section_subtitle');
            $table->text('message_content')->nullable()->after('message_title');
            $table->string('message_author')->nullable()->after('message_content');
            $table->string('message_author_title')->nullable()->after('message_author');
            $table->string('message_author_photo')->nullable()->after('message_author_title');

            // Notable Graduates / Alumni section
            $table->string('alumni_section_title')->nullable()->after('message_author_photo');
            $table->string('alumni_section_subtitle')->nullable()->after('alumni_section_title');
            $table->json('alumni_items')->nullable()->after('alumni_section_subtitle'); // [{name, description, photo_path, batch}]

            // Footer
            $table->string('footer_tagline')->nullable()->after('alumni_items');
            $table->string('footer_address')->nullable()->after('footer_tagline');
            $table->string('footer_phone')->nullable()->after('footer_address');
            $table->string('footer_email')->nullable()->after('footer_phone');
            $table->string('footer_facebook')->nullable()->after('footer_email');

            // Navbar links (JSON: [{label, href}])
            $table->json('nav_links')->nullable()->after('footer_facebook');
        });
    }

    public function down(): void
    {
        Schema::table('app_settings', function (Blueprint $table) {
            $table->dropColumn([
                'hero_title', 'hero_subtitle', 'hero_images',
                'faculty_section_title', 'faculty_section_subtitle',
                'message_title', 'message_content', 'message_author',
                'message_author_title', 'message_author_photo',
                'alumni_section_title', 'alumni_section_subtitle', 'alumni_items',
                'footer_tagline', 'footer_address', 'footer_phone', 'footer_email',
                'footer_facebook', 'nav_links',
            ]);
        });
    }
};
