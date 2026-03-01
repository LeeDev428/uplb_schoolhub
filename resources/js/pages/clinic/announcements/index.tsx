import ClinicLayout from '@/layouts/clinic/clinic-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <ClinicLayout>{page}</ClinicLayout>;

export default AnnouncementsIndex;
