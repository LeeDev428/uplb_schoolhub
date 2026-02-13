import AnnouncementsIndex from '@/pages/announcements/index';
import ParentLayout from '@/layouts/parent/parent-layout';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <ParentLayout>{page}</ParentLayout>;

export default AnnouncementsIndex;
