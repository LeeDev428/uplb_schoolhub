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
        Schema::create('grant_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('grant_id')->constrained()->onDelete('cascade');
            $table->string('school_year');
            $table->decimal('discount_amount', 10, 2)->default(0); // Computed discount amount
            $table->enum('status', ['active', 'inactive', 'graduated', 'withdrawn'])->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamps();
            
            // Prevent duplicate grants for same student in same school year
            $table->unique(['student_id', 'grant_id', 'school_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grant_recipients');
    }
};
