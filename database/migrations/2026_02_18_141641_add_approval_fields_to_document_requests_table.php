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
        Schema::table('document_requests', function (Blueprint $table) {
            // Document fee item reference
            $table->foreignId('document_fee_item_id')->nullable()->constrained('document_fee_items')->nullOnDelete();
            
            // Processing type (normal/rush)
            $table->enum('processing_type', ['normal', 'rush'])->default('normal');
            $table->integer('processing_days')->default(5);
            
            // Receipt upload
            $table->string('receipt_file_path')->nullable();
            $table->string('receipt_number')->nullable();
            
            // Approval workflow
            $table->enum('registrar_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('registrar_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('registrar_approved_at')->nullable();
            $table->text('registrar_remarks')->nullable();
            
            $table->enum('accounting_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('accounting_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('accounting_approved_at')->nullable();
            $table->text('accounting_remarks')->nullable();
            
            // Expected completion date
            $table->date('expected_completion_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropForeign(['document_fee_item_id']);
            $table->dropForeign(['registrar_approved_by']);
            $table->dropForeign(['accounting_approved_by']);
            
            $table->dropColumn([
                'document_fee_item_id',
                'processing_type',
                'processing_days',
                'receipt_file_path',
                'receipt_number',
                'registrar_status',
                'registrar_approved_by',
                'registrar_approved_at',
                'registrar_remarks',
                'accounting_status',
                'accounting_approved_by',
                'accounting_approved_at',
                'accounting_remarks',
                'expected_completion_date',
            ]);
        });
    }
};
