<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_fees', function (Blueprint $table) {
            $table->decimal('carried_forward_balance', 12, 2)->default(0)->after('balance')
                ->comment('Balance carried forward from a previous school year');
            $table->string('carried_forward_from')->nullable()->after('carried_forward_balance')
                ->comment('The school year from which the balance was rolled over');
        });
    }

    public function down(): void
    {
        Schema::table('student_fees', function (Blueprint $table) {
            $table->dropColumn(['carried_forward_balance', 'carried_forward_from']);
        });
    }
};
