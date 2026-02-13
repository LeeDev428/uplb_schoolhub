import AnnouncementsIndex from '@/pages/announcements/index';
import GuidanceLayout from '@/layouts/guidance/guidance-layout';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <GuidanceLayout>{page}</GuidanceLayout>;

export default AnnouncementsIndex;
