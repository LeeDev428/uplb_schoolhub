import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { index as studentsIndex } from '@/routes/registrar/students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface StudentFiltersProps {
    programs?: string[];
    yearLevels?: string[];
    filters?: {
        search?: string;
        type?: string;
        program?: string;
        year_level?: string;
        enrollment_status?: string;
        requirements_status?: string;
        needs_sectioning?: string;
    };
}

export function StudentFilters({ programs = [], yearLevels = [], filters = {} }: StudentFiltersProps) {
    const [localSearch, setLocalSearch] = useState(filters?.search || '');

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            studentsIndex.url({ query: { ...filters, [key]: value, search: localSearch } }),
            {},
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            studentsIndex.url({ query: { ...filters, search: localSearch } }),
            {},
            { preserveState: true, replace: true }
        );
    };

    const handleClearFilters = () => {
        setLocalSearch('');
        router.get(studentsIndex.url());
    };

    return (
        <div className="space-y-2">
            {/* Row 1: Search + Submit + Clear */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name, email, or LRN"
                        className="h-10 pl-10"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
                <Button type="submit" className="h-10 px-5">
                    Search
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                    className="h-10"
                >
                    Clear
                </Button>
            </form>

            {/* Row 2: Dropdown filters in a responsive grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => handleFilterChange('type', value)}
                >
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="transferee">Transferee</SelectItem>
                        <SelectItem value="returnee">Returnee</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.program || 'all'}
                    onValueChange={(value) => handleFilterChange('program', value)}
                >
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="All Programs" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programs.map((program) => (
                            <SelectItem key={program} value={program}>
                                {program}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.year_level || 'all'}
                    onValueChange={(value) => handleFilterChange('year_level', value)}
                >
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="All Year Levels" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Year Levels</SelectItem>
                        {yearLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                                {level}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.enrollment_status || 'all'}
                    onValueChange={(value) => handleFilterChange('enrollment_status', value)}
                >
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="All Enrollment Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Enrollment Status</SelectItem>
                        <SelectItem value="not-enrolled">Not Enrolled</SelectItem>
                        <SelectItem value="pending-registrar">Pending Registrar</SelectItem>
                        <SelectItem value="pending-accounting">Pending Accounting</SelectItem>
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.requirements_status || 'all'}
                    onValueChange={(value) => handleFilterChange('requirements_status', value)}
                >
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="All Requirements Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Requirements Status</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="incomplete">Incomplete</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
