import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { Plus, Pencil, Trash2, Shield, Mail, Phone } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserRecord {
    id: number;
    name: string;
    email: string;
    username: string | null;
    role: string;
    phone: string | null;
    email_verified_at: string | null;
    created_at: string;
    profile_photo_url: string | null;
}

interface DepartmentOption {
    id: number;
    name: string;
    code: string;
    classification?: string;
}

interface Props {
    users: {
        data: UserRecord[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    roleCounts: Record<string, number>;
    departments: DepartmentOption[];
    filters: {
        role?: string;
        search?: string;
        status?: string;
        classification?: string;
    };
}

const ROLE_OPTIONS = [
    { value: 'registrar', label: 'Registrar' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'parent', label: 'Parent' },
    { value: 'guidance', label: 'Guidance' },
    { value: 'librarian', label: 'Librarian' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'canteen', label: 'Canteen' },
];

const ROLE_COLORS: Record<string, string> = {
    registrar: 'bg-blue-100 text-blue-700',
    accounting: 'bg-green-100 text-green-700',
    student: 'bg-purple-100 text-purple-700',
    teacher: 'bg-orange-100 text-orange-700',
    parent: 'bg-pink-100 text-pink-700',
    guidance: 'bg-teal-100 text-teal-700',
    librarian: 'bg-amber-100 text-amber-700',
    clinic: 'bg-red-100 text-red-700',
    canteen: 'bg-lime-100 text-lime-700',
};

export default function UsersIndex({ users, roleCounts, departments, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
    const [activeRole, setActiveRole] = useState(filters.role || 'all');
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [classification, setClassification] = useState(filters.classification || 'all');

    const form = useForm({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'registrar',
        phone: '',
        employee_id: '',
        department_id: '',
        specialization: '',
        employment_status: 'full-time',
    });

    const totalUsers = Object.values(roleCounts).reduce((a, b) => a + b, 0);

    const navigate = (params: Record<string, string>) => {
        router.get('/owner/users', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRoleTab = (role: string) => {
        setActiveRole(role);
        navigate({
            role: role === 'all' ? '' : role,
            search,
            status,
            classification,
        });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({
            role: activeRole === 'all' ? '' : activeRole,
            search: value,
            status,
            classification,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        navigate({
            role: activeRole === 'all' ? '' : activeRole,
            search,
            status: value,
            classification,
        });
    };

    const handleClassificationChange = (value: string) => {
        setClassification(value);
        navigate({
            role: activeRole === 'all' ? '' : activeRole,
            search,
            status,
            classification: value,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setActiveRole('all');
        setClassification('all');
        router.get('/owner/users');
    };

    const openCreateModal = () => {
        form.reset();
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: UserRecord) => {
        setEditingUser(user);
        form.setData({
            name: user.name,
            email: user.email,
            username: user.username || '',
            password: '',
            role: user.role,
            phone: user.phone || '',
            employee_id: '',
            department_id: '',
            specialization: '',
            employment_status: 'full-time',
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

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/owner/users/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <OwnerLayout>
            <Head title="User Management" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage all system users and their roles
                        </p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar
                            onReset={resetFilters}
                            showReset={!!(search || status !== 'all' || activeRole !== 'all' || classification !== 'all')}
                        >
                            <SearchBar
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search by name, email, or username..."
                            />
                            <FilterDropdown
                                label="Classification"
                                value={classification}
                                onChange={handleClassificationChange}
                                options={[
                                    { value: 'K-12', label: 'K-12' },
                                    { value: 'College', label: 'College' },
                                ]}
                            />
                            <FilterDropdown
                                label="Status"
                                value={status}
                                onChange={handleStatusChange}
                                options={[
                                    { value: 'verified', label: 'Verified' },
                                    { value: 'unverified', label: 'Unverified' },
                                ]}
                                placeholder="All Status"
                            />
                        </FilterBar>

                        <Tabs value={activeRole} onValueChange={handleRoleTab} className="mt-6">
                            <TabsList className="mb-4 flex-wrap">
                                <TabsTrigger value="all">
                                    All ({totalUsers})
                                </TabsTrigger>
                                {ROLE_OPTIONS.map((role) => (
                                    <TabsTrigger key={role.value} value={role.value}>
                                        {role.label} ({roleCounts[role.value] || 0})
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <TabsContent value={activeRole}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-3 text-left font-semibold">Name</th>
                                                <th className="p-3 text-left font-semibold">Email</th>
                                                <th className="p-3 text-left font-semibold">Username</th>
                                                <th className="p-3 text-center font-semibold">Role</th>
                                                <th className="p-3 text-left font-semibold">Phone</th>
                                                <th className="p-3 text-center font-semibold">Status</th>
                                                <th className="p-3 text-center font-semibold">Created</th>
                                                <th className="p-3 text-center font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                                        No users found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.data.map((user) => (
                                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={user.profile_photo_url || undefined} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                {user.name}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                                {user.email}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-sm">{user.username || '-'}</td>
                                                        <td className="p-3 text-center">
                                                            <span className={`inline-block rounded px-2 py-1 text-xs font-medium capitalize ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-sm">
                                                            {user.phone ? (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                                    {user.phone}
                                                                </div>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span className={`inline-block rounded px-2 py-1 text-xs ${
                                                                user.email_verified_at
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {user.email_verified_at ? 'Verified' : 'Unverified'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center text-sm text-gray-500">
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button size="sm" variant="ghost" onClick={() => openEditModal(user)}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(user)}>
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

                        <Pagination data={users} />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g., Juan Dela Cruz"
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
                                    placeholder="Optional"
                                />
                                {form.errors.username && <p className="text-sm text-red-500">{form.errors.username}</p>}
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
                                        {ROLE_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
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
                                    placeholder="Optional"
                                />
                            </div>

                            {/* Password field - only shown when editing */}
                            {editingUser && (
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        placeholder="Leave blank to keep current password"
                                        autoComplete="new-password"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        As owner, you can reset user passwords without knowing their current password.
                                    </p>
                                    {form.errors.password && <p className="text-sm text-red-500">{form.errors.password}</p>}
                                </div>
                            )}

                            {/* Teacher-specific fields */}
                            {form.data.role === 'teacher' && !editingUser && (
                                <div className="space-y-4 rounded-lg border p-4">
                                    <h4 className="text-sm font-semibold text-gray-700">Teacher Details</h4>
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">Employee ID</Label>
                                        <Input
                                            id="employee_id"
                                            value={form.data.employee_id}
                                            onChange={(e) => form.setData('employee_id', e.target.value)}
                                            placeholder="e.g., EMP-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department_id">Department</Label>
                                        <Select
                                            value={form.data.department_id}
                                            onValueChange={(value) => form.setData('department_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={String(dept.id)}>
                                                        {dept.name} ({dept.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="specialization">Specialization</Label>
                                        <Input
                                            id="specialization"
                                            value={form.data.specialization}
                                            onChange={(e) => form.setData('specialization', e.target.value)}
                                            placeholder="e.g., Mathematics"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employment_status">Employment Status</Label>
                                        <Select
                                            value={form.data.employment_status}
                                            onValueChange={(value) => form.setData('employment_status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full-time">Full-time</SelectItem>
                                                <SelectItem value="part-time">Part-time</SelectItem>
                                                <SelectItem value="contractual">Contractual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete User"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
            />
        </OwnerLayout>
    );
}
