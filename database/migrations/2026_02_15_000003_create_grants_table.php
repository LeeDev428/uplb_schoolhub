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
        Schema::create('grants', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Academic Scholarship, Financial Aid
            $table->string('code')->unique()->nullable(); // e.g., ACAD-SCH, FIN-AID
            $table->text('description')->nullable();
            $table->enum('type', ['fixed', 'percentage'])->default('fixed');
            $table->decimal('value', 10, 2)->default(0); // Fixed amount or percentage
            $table->string('school_year')->nullable(); // If grant is specific to school year
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grants');
    }
};
