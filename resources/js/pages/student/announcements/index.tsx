import AnnouncementsIndex from '@/pages/announcements/index';
import StudentLayout from '@/layouts/student/student-layout';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <StudentLayout>{page}</StudentLayout>;

export default AnnouncementsIndex;
