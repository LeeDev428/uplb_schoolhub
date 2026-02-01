export function RevenueChart() {
    // Placeholder for actual chart implementation
    // You can integrate libraries like recharts, chart.js, or victory
    const departments = [
        { name: 'IT Department', value: 45, color: 'bg-blue-600' },
        { name: 'Business Department', value: 30, color: 'bg-red-600' },
        { name: 'Engineering', value: 15, color: 'bg-orange-600' },
        { name: 'Arts & Sciences', value: 10, color: 'bg-green-600' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center">
                <div className="relative h-64 w-64">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                        {/* Simple pie chart visualization */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#1e40af"
                            strokeWidth="20"
                            strokeDasharray="113 283"
                            transform="rotate(-90 50 50)"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="20"
                            strokeDasharray="85 283"
                            strokeDashoffset="-113"
                            transform="rotate(-90 50 50)"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#ea580c"
                            strokeWidth="20"
                            strokeDasharray="42 283"
                            strokeDashoffset="-198"
                            transform="rotate(-90 50 50)"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="20"
                            strokeDasharray="28 283"
                            strokeDashoffset="-240"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {departments.map((dept) => (
                    <div
                        key={dept.name}
                        className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
                    >
                        <div className="flex items-center space-x-3">
                            <div
                                className={`h-4 w-4 rounded-full ${dept.color}`}
                            />
                            <span className="font-medium">{dept.name}</span>
                        </div>
                        <span className="text-lg font-bold">{dept.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
