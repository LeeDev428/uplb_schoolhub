<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guidance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('counselor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('record_type', ['counseling', 'behavior', 'case', 'referral', 'other'])->default('counseling');
            $table->string('title');
            $table->text('description');
            $table->text('action_taken')->nullable();
            $table->text('recommendations')->nullable();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['open', 'in-progress', 'resolved', 'closed'])->default('open');
            $table->date('incident_date')->nullable();
            $table->date('follow_up_date')->nullable();
            $table->boolean('is_confidential')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guidance_records');
    }
};
