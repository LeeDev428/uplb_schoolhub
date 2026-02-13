import AnnouncementsIndex from '@/pages/announcements/index';
import ClinicLayout from '@/layouts/clinic/clinic-layout';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <ClinicLayout>{page}</ClinicLayout>;

export default AnnouncementsIndex;
