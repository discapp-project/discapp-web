export interface NewsletterMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  image?: string;
  category: string;
  summary: string;
}

export const newsletterIndex: NewsletterMeta[] = [
  {
    slug: 'documentation-release',
    title: 'Documentation Release',
    date: '2026-10-22',
    author: 'Discapp Team',
    category: 'Announcement',
    summary: 'We\'re excited to announce the release of our comprehensive documentation!',
    image: '/discapp-docs-big.png'
  },
  {
    slug: 'welcome-to-discapp',
    title: 'Welcome to Discapp News & Platform Updates',
    date: '2026-10-04',
    author: 'Discapp Team',
    category: 'Announcement',
    summary: 'First official announcement! Welcome and introductions <3',
    image: '/discapp-banner.png'
  },
];