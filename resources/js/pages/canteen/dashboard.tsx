import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, ShoppingCart, DollarSign, Package } from 'lucide-react';

export default function CanteenDashboard() {
    return (
        <>
            <Head title="Canteen Dashboard" />
            <div className="min-h-screen bg-gray-50">
                <header className="border-b bg-white shadow-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <h1 className="text-2xl font-bold text-orange-700">Canteen Portal</h1>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl space-y-6 p-6">
                    <div>
                        <h2 className="text-xl font-semibold">Welcome to Canteen Portal!</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage canteen operations and inventory</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Menu</CardTitle>
                                <Utensils className="h-5 w-5 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">Manage daily menu items.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Orders</CardTitle>
                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">Track student orders.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Sales</CardTitle>
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">View daily sales reports.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Inventory</CardTitle>
                                <Package className="h-5 w-5 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">Manage food inventory.</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Today&apos;s Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">No sales data available.</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
