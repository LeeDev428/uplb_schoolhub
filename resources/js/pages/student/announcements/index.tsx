import StudentLayout from '@/layouts/student/student-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <StudentLayout>{page}</StudentLayout>;

export default AnnouncementsIndex;
