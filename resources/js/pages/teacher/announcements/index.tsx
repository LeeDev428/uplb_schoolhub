import TeacherLayout from '@/layouts/teacher/teacher-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <TeacherLayout>{page}</TeacherLayout>;

export default AnnouncementsIndex;
