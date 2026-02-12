<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReportsController extends Controller
{
    public function index(): InertiaResponse
    {
        $currentSchoolYear = '2024-2025'; // Pull from settings

        // Summary stats for reports page
        $totalStudents = Student::count();
        $totalRevenue = StudentPayment::sum('amount');
        $totalExpected = StudentFee::sum('total_amount');
        $totalBalance = StudentFee::sum('balance');

        return Inertia::render('owner/reports', [
            'summary' => [
                'total_students' => $totalStudents,
                'total_revenue' => $totalRevenue,
                'total_expected' => $totalExpected,
                'total_balance' => $totalBalance,
                'collection_rate' => $totalExpected > 0 
                    ? round(($totalRevenue / $totalExpected) * 100, 1) 
                    : 0,
            ],
            'school_year' => $currentSchoolYear,
        ]);
    }

    public function exportFinancial(Request $request)
    {
        $format = $request->get('format', 'csv'); // csv or pdf
        $currentSchoolYear = '2024-2025';

        $data = StudentPayment::with(['student', 'studentFee'])
            ->whereHas('studentFee', function ($query) use ($currentSchoolYear) {
                $query->where('school_year', $currentSchoolYear);
            })
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'OR Number' => $payment->or_number ?? 'N/A',
                    'Date' => $payment->payment_date->format('Y-m-d'),
                    'Student' => $payment->student->name ?? 'N/A',
                    'Amount' => number_format($payment->amount, 2),
                    'Payment For' => ucfirst($payment->payment_for ?? 'general'),
                    'Notes' => $payment->notes ?? '',
                ];
            });

        if ($format === 'csv') {
            $filename = 'financial_report_' . date('Y-m-d') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($data) {
                $file = fopen('php://output', 'w');
                
                // Add headers
                fputcsv($file, array_keys($data->first()));
                
                // Add data
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
                
                fclose($file);
            };

            return Response::stream($callback, 200, $headers);
        }

        // PDF export would go here (using dompdf or similar)
        return response()->json(['message' => 'PDF export not yet implemented']);
    }

    public function exportStudents(Request $request)
    {
        $students = Student::with(['department', 'program', 'yearLevel', 'section'])
            ->get()
            ->map(function ($student) {
                return [
                    'Student ID' => $student->student_id,
                    'Name' => $student->name,
                    'Email' => $student->email ?? 'N/A',
                    'Department' => $student->department->name ?? 'N/A',
                    'Program' => $student->program->name ?? 'N/A',
                    'Year Level' => $student->yearLevel->name ?? 'N/A',
                    'Section' => $student->section->name ?? 'N/A',
                    'Status' => ucfirst($student->status ?? 'enrolled'),
                ];
            });

        $filename = 'students_report_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($students) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, array_keys($students->first()));
            
            foreach ($students as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
