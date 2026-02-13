import AnnouncementsIndex from '@/pages/announcements/index';
import StudentLayout from '@/layouts/student/student-layout';

AnnouncementsIndex.layout = (page: React.ReactElement) => <StudentLayout>{page}</StudentLayout>;

export default AnnouncementsIndex;
