<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OwnerDashboardController extends Controller
{
    public function index(): Response
    {
        // Today's Income
        $todayIncome = StudentPayment::whereDate('payment_date', Carbon::today())
            ->sum('amount');

        // Today's Target (estimated from monthly target)
        $monthlyTarget = 500000; // Can be pulled from settings
        $daysInMonth = Carbon::now()->daysInMonth;
        $todayTarget = $monthlyTarget / $daysInMonth;

        // Overall Income (this school year or current fiscal period)
        $currentSchoolYear = '2024-2025'; // Can be pulled from settings
        $overallIncome = StudentPayment::whereHas('studentFee', function ($query) use ($currentSchoolYear) {
            $query->where('school_year', $currentSchoolYear);
        })->sum('amount');

        // Overall Target (total expected revenue for the year)
        $overallTarget = StudentFee::where('school_year', $currentSchoolYear)
            ->sum('total_amount');

        // Expected Income (remaining balance to be collected)
        $expectedIncome = StudentFee::where('school_year', $currentSchoolYear)
            ->sum('balance');

        $expectedTarget = $expectedIncome; // Expected is the balance itself

        // Department Analysis
        $departmentStats = Department::withCount('students')
            ->with(['students' => function ($query) use ($currentSchoolYear) {
                $query->with(['fees' => function ($feeQuery) use ($currentSchoolYear) {
                    $feeQuery->where('school_year', $currentSchoolYear);
                }]);
            }])
            ->get()
            ->map(function ($department) {
                $totalRevenue = $department->students->sum(function ($student) {
                    return $student->fees->sum('total_paid');
                });
                
                $totalExpected = $department->students->sum(function ($student) {
                    return $student->fees->sum('total_amount');
                });

                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'code' => $department->code,
                    'enrollments' => $department->students_count,
                    'revenue' => $totalRevenue,
                    'expected' => $totalExpected,
                    'collection_rate' => $totalExpected > 0 
                        ? round(($totalRevenue / $totalExpected) * 100, 1) 
                        : 0,
                ];
            });

        // Recent Revenue Trend (last 7 days)
        $revenueData = StudentPayment::where('payment_date', '>=', Carbon::today()->subDays(6))
            ->whereDate('payment_date', '<=', Carbon::today())
            ->select(
                DB::raw('DATE(payment_date) as date'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill in missing days with 0
        $revenueTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();
            $found = $revenueData->firstWhere('date', $date);
            $revenueTrend[] = [
                'date' => $date,
                'label' => Carbon::parse($date)->format('M d'),
                'amount' => $found ? (float) $found->total : 0,
            ];
        }

        // Total Students Enrolled
        $totalStudents = Student::whereHas('fees', function ($query) use ($currentSchoolYear) {
            $query->where('school_year', $currentSchoolYear);
        })->count();

        // Payment Statistics
        $totalPayments = StudentPayment::whereHas('studentFee', function ($query) use ($currentSchoolYear) {
            $query->where('school_year', $currentSchoolYear);
        })->count();

        return Inertia::render('owner/dashboard', [
            'todayIncome' => $todayIncome,
            'todayTarget' => $todayTarget,
            'todayAchievement' => $todayTarget > 0 ? round(($todayIncome / $todayTarget) * 100, 1) : 0,
            
            'overallIncome' => $overallIncome,
            'overallTarget' => $overallTarget,
            'overallAchievement' => $overallTarget > 0 ? round(($overallIncome / $overallTarget) * 100, 1) : 0,
            
            'expectedIncome' => $expectedIncome,
            'expectedTarget' => $expectedTarget,
            'expectedAchievement' => 100, // Expected is always 100% of balance
            
            'departmentStats' => $departmentStats,
            'revenueTrend' => $revenueTrend,
            'totalStudents' => $totalStudents,
            'totalPayments' => $totalPayments,
            'schoolYear' => $currentSchoolYear,
        ]);
    }
}
