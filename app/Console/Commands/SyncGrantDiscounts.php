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

        $currentSchoolYear = \App\Models\AppSetting::current()?->school_year;

        // Collect every student that has at least one active grant recipient
        $studentIds = GrantRecipient::where('status', 'active')
            ->distinct()
            ->pluck('student_id');

        foreach ($studentIds as $studentId) {
            // All active grants for this student (no school_year filter — fixes year-label mismatches)
            $activeRecipients = GrantRecipient::where('student_id', $studentId)
                ->where('status', 'active')
                ->with('grant')
                ->get();

            // All fee records for this student
            $studentFees = StudentFee::where('student_id', $studentId)->get();

            foreach ($studentFees as $fee) {
                // For the current school year, apply ALL active grants.
                // For historical years, only apply grants whose school_year matches exactly.
                $applicableRecipients = ($fee->school_year === $currentSchoolYear || !$currentSchoolYear)
                    ? $activeRecipients
                    : $activeRecipients->filter(fn($r) => $r->school_year === $fee->school_year);

                // Step 1: fix stale discount_amount on each applicable recipient
                foreach ($applicableRecipients as $recipient) {
                    if (!$recipient->grant) {
                        continue;
                    }
                    $correct = $recipient->grant->calculateDiscount((float) $fee->total_amount);
                    if ((float) $recipient->discount_amount !== $correct) {
                        $recipient->discount_amount = $correct;
                        $recipient->save();
                        $this->info("Fixed recipient {$recipient->id} (student {$studentId}): discount ₱{$correct}");
                    }
                }

                // Step 2: sum up and persist to student_fee
                $totalDiscount = $applicableRecipients->sum(fn($r) => $r->grant
                    ? $r->grant->calculateDiscount((float) $fee->total_amount)
                    : 0.0
                );

                $newBalance = max(0, (float) $fee->total_amount - (float) $fee->total_paid - $totalDiscount);

                if ((float) $fee->grant_discount !== $totalDiscount || (float) $fee->balance !== $newBalance) {
                    $fee->grant_discount = $totalDiscount;
                    $fee->balance        = $newBalance;
                    $fee->save();
                    $this->info("Updated StudentFee {$fee->id} (student {$studentId}, {$fee->school_year}): grant_discount=₱{$totalDiscount}");
                }
            }

            // Edge case: student has an active grant but no student_fee yet for the current year.
            // Nothing to do — the fee will be created correctly on next page load.
        }

        $this->info('Grant discounts synced successfully!');
        return 0;
    }
}
