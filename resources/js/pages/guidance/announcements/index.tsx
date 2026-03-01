import GuidanceLayout from '@/layouts/guidance/guidance-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <GuidanceLayout>{page}</GuidanceLayout>;

export default AnnouncementsIndex;
