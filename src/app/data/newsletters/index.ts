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
    slug: 'welcome-to-botless',
    title: 'Welcome to Botless News & Platform Updates',
    date: '2026-10-04',
    author: 'Botless Team',
    category: 'Announcement',
    summary: 'First official announcement! Welcome and introductions <3',
    image: 'https://cdn.discordapp.com/attachments/1526618838924398673/1556504010654089216/botlesswelcome.png?backend=b2&ex=6ac466d2&is=6ac31552&hm=a89181cfd48584b9b6b9146d6d74f23d1fd4239c05d88255857194abdbd637fa&'
  },
];