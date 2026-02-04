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
        Schema::create('requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requirement_category_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // Form 138 (Report Card)
            $table->text('description')->nullable(); // Original copy of high school report card
            $table->enum('deadline_type', ['during_enrollment', 'before_classes', 'custom'])->default('during_enrollment');
            $table->date('custom_deadline')->nullable();
            $table->boolean('applies_to_new_enrollee')->default(false);
            $table->boolean('applies_to_transferee')->default(false);
            $table->boolean('applies_to_returning')->default(false);
            $table->boolean('is_required')->default(true);
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requirements');
    }
};
