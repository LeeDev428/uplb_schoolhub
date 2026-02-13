import AnnouncementsIndex from '@/pages/announcements/index';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';

AnnouncementsIndex.layout = (page: React.ReactElement) => <RegistrarLayout>{page}</RegistrarLayout>;

export default AnnouncementsIndex;
