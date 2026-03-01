import AccountingLayout from '@/layouts/accounting-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <AccountingLayout>{page}</AccountingLayout>;

export default AnnouncementsIndex;
