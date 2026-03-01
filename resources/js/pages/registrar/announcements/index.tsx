import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <RegistrarLayout>{page}</RegistrarLayout>;

export default AnnouncementsIndex;
