import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
    phone?: string;
    department?: string;
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    departments: any[];
    filters: {
        search?: string;
        role?: string;
    };
}

export default function UserManagementIndex({ users, departments, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; userId: number | null }>({
        open: false,
        userId: null,
    });

    const form = useForm({
        name: '',
        email: '',
        username: '',
        password: '',
        role: '',
        phone: '',
        department: '',
    });

    const roleOptions = [
        { value: 'owner', label: 'Owner/Admin' },
        { value: 'registrar', label: 'Registrar' },
        { value: 'accounting', label: 'Accounting' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'student', label: 'Student' },
        { value: 'parent', label: 'Parent' },
        { value: 'guidance', label: 'Guidance Counselor' },
        { value: 'librarian', label: 'Librarian' },
        { value: 'clinic', label: 'Clinic/Medical' },
        { value: 'canteen', label: 'Canteen' },
    ];

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            owner: 'bg-purple-100 text-purple-700',
            registrar: 'bg-blue-100 text-blue-700',
            accounting: 'bg-green-100 text-green-700',
            teacher: 'bg-indigo-100 text-indigo-700',
            student: 'bg-cyan-100 text-cyan-700',
            parent: 'bg-pink-100 text-pink-700',
            guidance: 'bg-yellow-100 text-yellow-700',
            librarian: 'bg-red-100 text-red-700',
            clinic: 'bg-teal-100 text-teal-700',
            canteen: 'bg-orange-100 text-orange-700',
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            owner: 'Owner',
            registrar: 'Registrar',
            accounting: 'Accounting',
            teacher: 'Teacher',
            student: 'Student',
            parent: 'Parent',
            guidance: 'Guidance',
            librarian: 'Librarian',
            clinic: 'Clinic',
            canteen: 'Canteen',
        };
        return labels[role] || role;
    };

    const openCreateModal = () => {
        form.reset();
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        form.setData({
            name: user.name,
            email: user.email,
            username: user.username || '',
            password: '',
            role: user.role,
            phone: user.phone || '',
            department: user.department || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            form.put(`/owner/users/${editingUser.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/owner/users', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        setDeleteConfirm({ open: true, userId: id });
    };

    const confirmDelete = () => {
        if (deleteConfirm.userId) {
            router.delete(`/owner/users/${deleteConfirm.userId}`, {
                onSuccess: () => {
                    setDeleteConfirm({ open: false, userId: null });
                },
            });
        }
    };

    const resetFilters = () => {
        setSearch('');
        setRoleFilter('all');
        router.get('/owner/users');
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/owner/users', {
            search: value,
            role: roleFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value);
        router.get('/owner/users', {
            search,
            role: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Filter users by active tab
    const filteredUsers = users.data.filter(user => {
        if (activeTab === 'all') return true;
        return user.role === activeTab;
    });

    return (
        <OwnerLayout>
            <Head title="User Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Shield className="h-8 w-8" />
                            User Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Manage system users and their roles</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>

                {/* Users Table with Role Tabs */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Filter Bar */}
                        <FilterBar onReset={resetFilters} showReset={!!(search || roleFilter !== 'all')}>
                            <SearchBar 
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search users..."
                            />
                            <FilterDropdown 
                                label="Role"
                                value={roleFilter}
                                onChange={handleRoleFilterChange}
                                options={roleOptions}
                                placeholder="All Roles"
                            />
                        </FilterBar>
                        
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                            <TabsList className="mb-4 flex-wrap h-auto">
                                <TabsTrigger value="all">All Users</TabsTrigger>
                                <TabsTrigger value="owner">Owner</TabsTrigger>
                                <TabsTrigger value="registrar">Registrar</TabsTrigger>
                                <TabsTrigger value="accounting">Accounting</TabsTrigger>
                                <TabsTrigger value="teacher">Teachers</TabsTrigger>
                                <TabsTrigger value="student">Students</TabsTrigger>
                                <TabsTrigger value="parent">Parents</TabsTrigger>
                                <TabsTrigger value="guidance">Guidance</TabsTrigger>
                                <TabsTrigger value="librarian">Librarian</TabsTrigger>
                                <TabsTrigger value="clinic">Clinic</TabsTrigger>
                                <TabsTrigger value="canteen">Canteen</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 font-semibold">Name</th>
                                                <th className="text-left p-3 font-semibold">Email</th>
                                                <th className="text-left p-3 font-semibold">Username</th>
                                                <th className="text-left p-3 font-semibold">Role</th>
                                                <th className="text-left p-3 font-semibold">Phone</th>
                                                <th className="text-center p-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center p-8 text-gray-500">
                                                        No users found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 font-medium">{user.name}</td>
                                                        <td className="p-3 text-sm">{user.email}</td>
                                                        <td className="p-3 text-sm font-mono">{user.username || '-'}</td>
                                                        <td className="p-3">
                                                            <span className={`inline-block px-2 py-1 text-xs rounded ${getRoleBadgeColor(user.role)}`}>
                                                                {getRoleLabel(user.role)}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-sm">{user.phone || '-'}</td>
                                                        <td className="p-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => openEditModal(user)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(user.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                        </Tabs>
                        
                        {/* Pagination */}
                        <Pagination data={users} />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    required
                                />
                                {form.errors.name && <p className="text-sm text-red-500">{form.errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    required
                                />
                                {form.errors.email && <p className="text-sm text-red-500">{form.errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={form.data.username}
                                    onChange={(e) => form.setData('username', e.target.value)}
                                    placeholder="Auto-generated if empty"
                                />
                                {form.errors.username && <p className="text-sm text-red-500">{form.errors.username}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password {!editingUser && '*'}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    required={!editingUser}
                                    placeholder={editingUser ? 'Leave empty to keep current' : ''}
                                />
                                {form.errors.password && <p className="text-sm text-red-500">{form.errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={form.data.role}
                                    onValueChange={(value) => form.setData('role', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.role && <p className="text-sm text-red-500">{form.errors.role}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={form.data.department}
                                    onChange={(e) => form.setData('department', e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm({ open, userId: null })}
                onConfirm={confirmDelete}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </OwnerLayout>
    );
}
