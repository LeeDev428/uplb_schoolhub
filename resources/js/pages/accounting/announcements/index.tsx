import AnnouncementsIndex from '@/pages/announcements/index';
import AccountingLayout from '@/layouts/accounting-layout';

AnnouncementsIndex.layout = (page: React.ReactElement) => <AccountingLayout>{page}</AccountingLayout>;

export default AnnouncementsIndex;
