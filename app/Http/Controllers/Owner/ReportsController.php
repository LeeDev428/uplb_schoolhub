<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\FeeCategory;
use App\Models\FeeItem;
use App\Models\DocumentFeeItem;
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

        // Fee Income Report
        $feeReport = FeeCategory::with(['items' => function ($q) {
            $q->where('students_availed', '>', 0)->where('is_active', true);
        }])
        ->get()
        ->map(function ($cat) {
            $items = $cat->items->map(function ($item) {
                $availed = (int) $item->students_availed;
                $selling = (float) $item->selling_price;
                $profit = $selling - (float) $item->cost_price;
                return [
                    'name' => $item->name,
                    'selling_price' => round($selling, 2),
                    'profit' => round($profit, 2),
                    'students_availed' => $availed,
                    'total_revenue' => round($selling * $availed, 2),
                    'total_income' => round($profit * $availed, 2),
                ];
            })->values();
            return [
                'category' => $cat->name,
                'items' => $items,
                'total_revenue' => round($items->sum('total_revenue'), 2),
                'total_income' => round($items->sum('total_income'), 2),
            ];
        })
        ->filter(fn ($cat) => $cat['items']->count() > 0)
        ->values();

        $documentFeeReport = DocumentFeeItem::where('students_availed', '>', 0)
            ->where('is_active', true)
            ->get()
            ->groupBy('category')
            ->map(function ($fees, $cat) {
                $items = $fees->map(function ($fee) {
                    $availed = (int) $fee->students_availed;
                    $price = (float) $fee->price;
                    return [
                        'name' => $fee->name,
                        'price' => round($price, 2),
                        'students_availed' => $availed,
                        'total_revenue' => round($price * $availed, 2),
                    ];
                })->values();
                return ['category' => $cat, 'items' => $items, 'total_revenue' => round($items->sum('total_revenue'), 2)];
            })
            ->values();

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
            'feeReport' => $feeReport,
            'documentFeeReport' => $documentFeeReport,
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
                    'Program' => $student->program ?? 'N/A',
                    'Year Level' => $student->year_level ?? 'N/A',
                    'Section' => $student->section ?? 'N/A',
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
