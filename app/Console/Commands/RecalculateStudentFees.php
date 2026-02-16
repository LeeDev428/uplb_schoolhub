<?php

namespace App\Console\Commands;

use App\Models\FeeItem;
use App\Models\StudentFee;
use Illuminate\Console\Command;

class RecalculateStudentFees extends Command
{
    protected $signature = 'fees:recalculate';
    protected $description = 'Recalculate all student fees from active fee items';

    public function handle()
    {
        $this->info('Clearing existing student fees...');
        StudentFee::query()->delete();

        $this->info('Applying active fee items to students...');
        $items = FeeItem::where('is_active', true)->get();
        $totalAffected = 0;

        foreach ($items as $item) {
            $count = $item->applyToStudents();
            $totalAffected += $count;
            $this->info("  - {$item->name}: Applied to {$count} students");
        }

        $this->info("\nTotal: {$totalAffected} student fee records created/updated");
        return 0;
    }
}
