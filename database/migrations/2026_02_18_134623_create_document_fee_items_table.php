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
        Schema::create('document_fee_items', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // e.g., Form 137, Good Moral, TOR, Diploma
            $table->string('name'); // e.g., Form 137 (Normal), Form 137 (Rush)
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('processing_days')->default(5); // Number of days to process
            $table->enum('processing_type', ['normal', 'rush'])->default('normal');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_fee_items');
    }
};
