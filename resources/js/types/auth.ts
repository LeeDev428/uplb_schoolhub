export type User = {
    id: number;
    name: string;
    email: string;
    role: 'owner' | 'registrar' | 'accounting' | 'student' | 'teacher' | 'parent' | 'guidance' | 'librarian' | 'clinic' | 'canteen';
    username?: string;
    student_id?: string | null;
    teacher_id?: number | null;
    parent_id?: number | null;
    phone?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
