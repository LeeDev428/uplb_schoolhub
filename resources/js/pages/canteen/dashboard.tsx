import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, ShoppingCart, DollarSign, Package } from 'lucide-react';
import CanteenLayout from '@/layouts/canteen/canteen-layout';

export default function CanteenDashboard() {
    return (
        <>
            <Head title="Canteen Dashboard" />
            <div className="space-y-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold">Welcome to Canteen Portal!</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Manage canteen operations and inventory</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Menu</CardTitle>
                            <Utensils className="h-5 w-5 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Manage daily menu items.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Orders</CardTitle>
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Track student orders.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Sales</CardTitle>
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">View daily sales reports.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                            <Package className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Manage food inventory.</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Today&apos;s Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">No sales data available.</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CanteenDashboard.layout = (page: React.ReactNode) => <CanteenLayout>{page}</CanteenLayout>;
