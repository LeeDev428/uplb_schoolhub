<?php

namespace App\Console\Commands;

use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Console\Command;

class BackfillStudentFees extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'students:backfill-fees';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create StudentFee records for students with registrar clearance but no fee record';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting StudentFee backfill...');

        // Get all students with registrar_clearance but no StudentFee
        $students = Student::whereHas('enrollmentClearance', function ($query) {
            $query->where('registrar_clearance', true);
        })
        ->whereDoesntHave('fees')
        ->get();

        if ($students->isEmpty()) {
            $this->info('No students need backfilling.');
            return Command::SUCCESS;
        }

        $this->info("Found {$students->count()} students that need StudentFee records.");

        $bar = $this->output->createProgressBar($students->count());
        $bar->start();

        $created = 0;
        foreach ($students as $student) {
            if ($student->school_year) {
                StudentFee::firstOrCreate(
                    [
                        'student_id' => $student->id,
                        'school_year' => $student->school_year,
                    ],
                    [
                        'registration_fee' => 0,
                        'tuition_fee' => 0,
                        'misc_fee' => 0,
                        'books_fee' => 0,
                        'other_fees' => 0,
                        'total_amount' => 0,
                        'total_paid' => 0,
                        'balance' => 0,
                        'grant_discount' => 0,
                    ]
                );
                $created++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully created {$created} StudentFee records.");

        return Command::SUCCESS;
    }
}
