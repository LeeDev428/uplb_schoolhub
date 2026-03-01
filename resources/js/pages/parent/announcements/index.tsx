import ParentLayout from '@/layouts/parent/parent-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <ParentLayout>{page}</ParentLayout>;

export default AnnouncementsIndex;
