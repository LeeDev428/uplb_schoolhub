<?php

namespace App\Console\Commands;

use App\Models\GrantRecipient;
use App\Models\StudentFee;
use Illuminate\Console\Command;

class SyncGrantDiscounts extends Command
{
    protected $signature = 'grants:sync';
    protected $description = 'Sync grant discounts to student fees';

    public function handle()
    {
        $this->info('Syncing grant discounts to student fees...');
        
        // Get all active grant recipients
        $recipients = GrantRecipient::where('status', 'active')->get();
        
        foreach ($recipients as $recipient) {
            $studentFee = StudentFee::where('student_id', $recipient->student_id)
                ->where('school_year', $recipient->school_year)
                ->first();
                
            if ($studentFee) {
                // Calculate total grants for this student/year
                $totalGrants = GrantRecipient::where('student_id', $recipient->student_id)
                    ->where('school_year', $recipient->school_year)
                    ->where('status', 'active')
                    ->sum('discount_amount');
                    
                $studentFee->grant_discount = $totalGrants;
                $studentFee->balance = $studentFee->total_amount - $studentFee->total_paid - $totalGrants;
                $studentFee->save();
                
                $this->info("Updated student {$recipient->student_id} - {$recipient->school_year}: Grant ₱{$totalGrants}");
            }
        }
        
        $this->info('Grant discounts synced successfully!');
        return 0;
    }
}
