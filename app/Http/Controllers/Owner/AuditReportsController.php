<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Accounting\ReportsController as AccountingReportsController;

class AuditReportsController extends AccountingReportsController
{
    protected function reportsView(): string
    {
        return 'owner/audit-reports';
    }
}