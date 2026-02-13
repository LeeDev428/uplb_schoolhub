import AnnouncementsIndex from '@/pages/announcements/index';
import TeacherLayout from '@/layouts/teacher/teacher-layout';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <TeacherLayout>{page}</TeacherLayout>;

export default AnnouncementsIndex;
