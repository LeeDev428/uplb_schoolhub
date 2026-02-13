import AnnouncementsIndex from '@/pages/announcements/index';
import CanteenLayout from '@/layouts/canteen/canteen-layout';

AnnouncementsIndex.layout = (page: React.ReactElement) => <CanteenLayout>{page}</CanteenLayout>;

export default AnnouncementsIndex;
