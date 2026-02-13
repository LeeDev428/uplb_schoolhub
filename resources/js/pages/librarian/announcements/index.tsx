import AnnouncementsIndex from '@/pages/announcements/index';
import LibrarianLayout from '@/layouts/librarian/librarian-layout';

AnnouncementsIndex.layout = (page: React.ReactElement) => <LibrarianLayout>{page}</LibrarianLayout>;

export default AnnouncementsIndex;
