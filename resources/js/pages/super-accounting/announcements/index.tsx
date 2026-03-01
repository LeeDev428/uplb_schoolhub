import SuperAccountingLayout from '@/layouts/super-accounting/super-accounting-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <SuperAccountingLayout>{page}</SuperAccountingLayout>;

export default AnnouncementsIndex;
