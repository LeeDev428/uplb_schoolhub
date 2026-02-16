import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, MoreHorizontal, Plus, Trash2, FolderPlus, Calculator, DollarSign } from 'lucide-react';

interface FeeItem {
    id: number;
    fee_category_id: number;
    name: string;
    description?: string;
    cost_price: string;
    selling_price: string;
    profit: string;
    is_active: boolean;
}

interface FeeCategory {
    id: number;
    name: string;
    code: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
    items: FeeItem[];
    total_cost: string;
    total_selling: string;
    total_profit: string;
}

interface Props {
    categories: FeeCategory[];
    totals: {
        cost: string;
        selling: string;
        profit: string;
    };
}

export default function FeeManagementIndex({ categories, totals }: Props) {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FeeCategory | null>(null);
    const [editingItem, setEditingItem] = useState<FeeItem | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const categoryForm = useForm({
        name: '',
        code: '',
        description: '',
        sort_order: 0,
        is_active: true,
    });

    const itemForm = useForm({
        fee_category_id: null as number | null,
        name: '',
        description: '',
        cost_price: '',
        selling_price: '',
        is_active: true,
    });

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '₱0.00';
        return `₱${numAmount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const calculateProfit = () => {
        const cost = parseFloat(itemForm.data.cost_price) || 0;
        const selling = parseFloat(itemForm.data.selling_price) || 0;
        return (selling - cost).toFixed(2);
    };

    const openCategoryModal = (category?: FeeCategory) => {
        if (category) {
            setEditingCategory(category);
            categoryForm.setData({
                name: category.name,
                code: category.code || '',
                description: category.description || '',
                sort_order: category.sort_order,
                is_active: category.is_active,
            });
        } else {
            setEditingCategory(null);
            categoryForm.reset();
        }
        setIsCategoryModalOpen(true);
    };

    const openItemModal = (categoryId: number, item?: FeeItem) => {
        setSelectedCategoryId(categoryId);
        if (item) {
            setEditingItem(item);
            itemForm.setData({
                fee_category_id: item.fee_category_id,
                name: item.name,
                description: item.description || '',
                cost_price: item.cost_price,
                selling_price: item.selling_price,
                is_active: item.is_active,
            });
        } else {
            setEditingItem(null);
            itemForm.setData({
                fee_category_id: categoryId,
                name: '',
                description: '',
                cost_price: '',
                selling_price: '',
                is_active: true,
            });
        }
        setIsItemModalOpen(true);
    };

    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            categoryForm.put(`/accounting/fee-management/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    categoryForm.reset();
                    setEditingCategory(null);
                },
            });
        } else {
            categoryForm.post('/accounting/fee-management/categories', {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    categoryForm.reset();
                },
            });
        }
    };

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            itemForm.post('/accounting/fee-management/items', {
            // Add fee_category_id to the form data before submitting
            const formDataWithCategory = {
                ...itemForm.data,
                fee_category_id: selectedCategoryId,
            };
            
            itemForm.post('/accounting/fee-management/items', {
                data: formDataWithCategory,
                onSuccess: () => {
                    setIsItemModalOpen(false);
                    itemForm.reset();
                },
            });
        }
    };

    const handleDeleteCategory = (id: number) => {
        if (confirm('Are you sure you want to delete this category? All items in this category will also be deleted.')) {
            router.delete(`/accounting/fee-management/categories/${id}`);
        }
    };

    const handleDeleteItem = (id: number) => {
        if (confirm('Are you sure you want to delete this fee item?')) {
            router.delete(`/accounting/fee-management/items/${id}`);
        }
    };

    return (
        <AccountingLayout>
            <Head title="Fee Management" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Fee Management"
                    description="Manage fee categories and items with cost, selling price, and profit tracking"
                    action={
                        <Dialog open={isCategoryModalOpen} onOpenChange={(open) => {
                            setIsCategoryModalOpen(open);
                            if (!open) {
                                setEditingCategory(null);
                                categoryForm.reset();
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <FolderPlus className="mr-2 h-4 w-4" />
                                    Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <form onSubmit={handleCategorySubmit}>
                                    <DialogHeader>
                                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                                        <DialogDescription>
                                            {editingCategory ? 'Update fee category details' : 'Create a new fee category'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="category_name">Name *</Label>
                                            <Input
                                                id="category_name"
                                                value={categoryForm.data.name}
                                                onChange={(e) => categoryForm.setData('name', e.target.value)}
                                                placeholder="e.g., Tuition Fees"
                                            />
                                            {categoryForm.errors.name && <p className="text-sm text-red-500">{categoryForm.errors.name}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="category_code">Code *</Label>
                                            <Input
                                                id="category_code"
                                                value={categoryForm.data.code}
                                                onChange={(e) => categoryForm.setData('code', e.target.value)}
                                                placeholder="e.g., TF"
                                            />
                                            {categoryForm.errors.code && <p className="text-sm text-red-500">{categoryForm.errors.code}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="category_description">Description</Label>
                                            <Textarea
                                                id="category_description"
                                                value={categoryForm.data.description}
                                                onChange={(e) => categoryForm.setData('description', e.target.value)}
                                                placeholder="Optional description..."
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="sort_order">Sort Order</Label>
                                            <Input
                                                id="sort_order"
                                                type="number"
                                                value={categoryForm.data.sort_order}
                                                onChange={(e) => categoryForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="category_is_active"
                                                checked={categoryForm.data.is_active}
                                                onCheckedChange={(checked) => categoryForm.setData('is_active', checked)}
                                            />
                                            <Label htmlFor="category_is_active">Active</Label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={categoryForm.processing}>
                                            {editingCategory ? 'Update' : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    }
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                            <Calculator className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totals?.cost ?? 0)}</div>
                            <p className="text-xs text-muted-foreground">Base cost of all fee items</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Selling</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totals?.selling ?? 0)}</div>
                            <p className="text-xs text-muted-foreground">Total fees charged to students</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals?.profit ?? 0)}</div>
                            <p className="text-xs text-muted-foreground">Revenue margin on all fees</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Categories Accordion */}
                {categories.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <FolderPlus className="h-12 w-12 mb-4" />
                            <p>No fee categories yet. Create your first category to get started.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Accordion type="multiple" defaultValue={categories.map(c => c.id.toString())} className="space-y-4">
                        {categories.map((category) => (
                            <AccordionItem key={category.id} value={category.id.toString()} className="border rounded-lg px-4">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold">{category.name}</span>
                                            {!category.is_active && (
                                                <Badge variant="outline">Inactive</Badge>
                                            )}
                                            <Badge variant="secondary">{category.items.length} items</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                Cost: <span className="text-foreground font-medium">{formatCurrency(category.total_cost)}</span>
                                            </span>
                                            <span className="text-muted-foreground">
                                                Selling: <span className="text-foreground font-medium">{formatCurrency(category.total_selling)}</span>
                                            </span>
                                            <span className="text-muted-foreground">
                                                Profit: <span className="text-green-600 font-medium">{formatCurrency(category.total_profit)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 pt-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-muted-foreground">{category.description}</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openItemModal(category.id)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Item
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openCategoryModal(category)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit Category
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {category.items.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No items in this category yet.
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Item Name</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead className="text-right">Cost Price</TableHead>
                                                        <TableHead className="text-right">Selling Price</TableHead>
                                                        <TableHead className="text-right">Profit</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {category.items.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium">{item.name}</TableCell>
                                                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                                                {item.description || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">{formatCurrency(item.cost_price)}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(item.selling_price)}</TableCell>
                                                            <TableCell className="text-right">
                                                                <span className={parseFloat(item.profit) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                                    {formatCurrency(item.profit)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.is_active ? (
                                                                    <Badge className="bg-green-500">Active</Badge>
                                                                ) : (
                                                                    <Badge variant="outline">Inactive</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => openItemModal(category.id, item)}>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleDeleteItem(item.id)}
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>

            {/* Item Modal */}
            <Dialog open={isItemModalOpen} onOpenChange={(open) => {
                setIsItemModalOpen(open);
                if (!open) {
                    setEditingItem(null);
                    setSelectedCategoryId(null);
                    itemForm.reset();
                }
            }}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleItemSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Fee Item' : 'Add Fee Item'}</DialogTitle>
                            <DialogDescription>
                                {editingItem ? 'Update fee item details' : 'Create a new fee item'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="item_name">Name *</Label>
                                <Input
                                    id="item_name"
                                    value={itemForm.data.name}
                                    onChange={(e) => itemForm.setData('name', e.target.value)}
                                    placeholder="e.g., Monthly Tuition"
                                />
                                {itemForm.errors.name && <p className="text-sm text-red-500">{itemForm.errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="item_description">Description</Label>
                                <Textarea
                                    id="item_description"
                                    value={itemForm.data.description}
                                    onChange={(e) => itemForm.setData('description', e.target.value)}
                                    placeholder="Optional description..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cost_price">Cost Price *</Label>
                                    <Input
                                        id="cost_price"
                                        type="number"
                                        step="0.01"
                                        value={itemForm.data.cost_price}
                                        onChange={(e) => itemForm.setData('cost_price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {itemForm.errors.cost_price && <p className="text-sm text-red-500">{itemForm.errors.cost_price}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="selling_price">Selling Price *</Label>
                                    <Input
                                        id="selling_price"
                                        type="number"
                                        step="0.01"
                                        value={itemForm.data.selling_price}
                                        onChange={(e) => itemForm.setData('selling_price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {itemForm.errors.selling_price && <p className="text-sm text-red-500">{itemForm.errors.selling_price}</p>}
                                </div>
                            </div>
                            <div className="rounded-lg bg-muted p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Calculated Profit:</span>
                                    <span className={`font-semibold ${parseFloat(calculateProfit()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(calculateProfit())}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="item_is_active"
                                    checked={itemForm.data.is_active}
                                    onCheckedChange={(checked) => itemForm.setData('is_active', checked)}
                                />
                                <Label htmlFor="item_is_active">Active</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={itemForm.processing}>
                                {editingItem ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AccountingLayout>
    );
}
