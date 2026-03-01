import LibrarianLayout from '@/layouts/librarian/librarian-layout';
import AnnouncementsIndex from '@/pages/announcements/index';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <LibrarianLayout>{page}</LibrarianLayout>;

export default AnnouncementsIndex;
