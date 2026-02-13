import AnnouncementsIndex from '@/pages/announcements/index';
import LibrarianLayout from '@/layouts/librarian/librarian-layout';

(AnnouncementsIndex as any).layout = (page: React.ReactElement) => <LibrarianLayout>{page}</LibrarianLayout>;

export default AnnouncementsIndex;
