import CanteenLayout from '@/layouts/canteen/canteen-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <CanteenLayout>{page}</CanteenLayout>;

export default AnnouncementsIndex;
