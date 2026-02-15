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
        Schema::create('fee_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fee_category_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., Library Fee, Laboratory Fee
            $table->string('code')->nullable(); // Optional code for the item
            $table->text('description')->nullable();
            $table->decimal('cost_price', 10, 2)->default(0); // Cost/Input price
            $table->decimal('selling_price', 10, 2)->default(0); // Selling price to students
            $table->decimal('profit', 10, 2)->virtualAs('selling_price - cost_price'); // Computed profit
            $table->string('school_year')->nullable(); // If fees vary by school year
            $table->string('program')->nullable(); // If fees vary by program
            $table->string('year_level')->nullable(); // If fees vary by year level
            $table->boolean('is_required')->default(true); // Is this fee mandatory
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_items');
    }
};
