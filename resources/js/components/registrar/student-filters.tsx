import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function StudentFilters() {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or ID"
                        className="h-11 pl-10"
                    />
                </div>

                <div>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="transferee">
                                Transferee
                            </SelectItem>
                            <SelectItem value="returnee">Returnee</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="All Programs" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Programs</SelectItem>
                            <SelectItem value="bsit">
                                BS Information Technology
                            </SelectItem>
                            <SelectItem value="bscs">
                                BS Computer Science
                            </SelectItem>
                            <SelectItem value="bsba">
                                BS Business Administration
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="All Year Levels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Year Levels</SelectItem>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="enrolled">
                                Officially Enrolled
                            </SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Enrollment Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All Enrollment Status
                            </SelectItem>
                            <SelectItem value="enrolled">
                                Officially Enrolled
                            </SelectItem>
                            <SelectItem value="not-enrolled">
                                Not Enrolled
                            </SelectItem>
                            <SelectItem value="registrar-pending">
                                Registrar Pending
                            </SelectItem>
                            <SelectItem value="accounting-pending">
                                Accounting Pending
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="All Remarks" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Remarks</SelectItem>
                            <SelectItem value="graduating">
                                Graduating
                            </SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="full-time">Full-time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
