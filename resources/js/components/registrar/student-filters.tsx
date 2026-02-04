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
    };
}

export function StudentFilters({ programs = [], yearLevels = [], filters = {} }: StudentFiltersProps) {
    const [localSearch, setLocalSearch] = useState(filters?.search || '');

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            studentsIndex.url({ query: { ...filters, [key]: value } }),
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
        <div className="space-y-4">
            {/* First Row: Search and Main Filters */}
            <form onSubmit={handleSearchSubmit} className="grid gap-4 md:grid-cols-6">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name, email, or LRN"
                        className="h-11 pl-10"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>

                <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => handleFilterChange('type', value)}
                >
                    <SelectTrigger className="h-11">
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
                    <SelectTrigger className="h-11">
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
                    <SelectTrigger className="h-11">
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

                <Button 
                    type="submit" 
                    className="h-11 w-full"
                >
                    Search
                </Button>
            </form>

            {/* Second Row: Additional Filters and Clear */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <Select
                        value={filters.enrollment_status || 'all'}
                        onValueChange={(value) => handleFilterChange('enrollment_status', value)}
                    >
                        <SelectTrigger className="h-11">
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
                </div>

                <div className="flex-1">
                    <Select
                        value={filters.requirements_status || 'all'}
                        onValueChange={(value) => handleFilterChange('requirements_status', value)}
                    >
                        <SelectTrigger className="h-11">
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

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                    className="h-11 whitespace-nowrap"
                >
                    Clear Filters
                </Button>
            </div>
        </div>
    );
}
                    </Select>
                </div>

                <div>
                    <Select
                        value={filters.requirements_status || 'all'}
                        onValueChange={(value) => handleFilterChange('requirements_status', value)}
                    >
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Requirements Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Requirements Status</SelectItem>
                            <SelectItem value="incomplete">Incomplete</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="h-11 w-full"
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}
