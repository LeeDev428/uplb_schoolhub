import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';

export default function AppearanceForm() {
    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Appearance settings"
                description="Update your account's appearance settings"
            />
            <AppearanceTabs />
        </div>
    );
}
