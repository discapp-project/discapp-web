'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Webhook, Library, BadgePlus, GlobeCode, UserSearch, Link2, Newspaper, Users, Search, Package, Snowflake, Palette, PencilLine, ArrowDownWideNarrow, FileMusic, Scaling, Calculator, CalendarDays, TypeOutline, Space, KeyRound, BrickWallShield, Regex } from 'lucide-react';
import { ServerSearch } from './components/icons/ServerSearch';

const officialPages = [
  {
    title: 'Botless News',
    description: 'Latest updates, feature releases, and announcements.',
    href: '/botless-news',
    icon: Newspaper,
    iconClass: 'news-icon'
  },
];

const tools = [
  {
    title: 'Webhook Builder',
    description: 'Create Discord messages with embeds, delivery options, and live preview.',
    href: '/webhook-builder',
    icon: Webhook,
    iconClass: 'webhook-icon'
  },
  {
    title: 'Automod Library',
    description: 'View and copy automod rules and regexes.',
    href: '/automod-library',
    icon: Library,
    iconClass: 'library-icon'
  },
  {
    title: 'Role Icon Maker',
    description: 'Create custom role icons for your Discord server.',
    href: '/role-icon-maker',
    icon: BadgePlus,
    iconClass: 'badge-plus'
  },
  {
    title: 'User Lookup',
    description: 'Get information about a discord user by ID.',
    href: '/user-lookup',
    icon: UserSearch,
    iconClass: 'user-search'
  },
  {
    title: 'Server Lookup',
    description: 'Get information about a discord server by invite.',
    href: '/server-lookup',
    icon: ServerSearch,
    iconClass: 'server-search'
  },
  {
    title: 'Vanity URL Checker',
    description: 'Check if a custom invite code or vanity URL is currently available.',
    href: '/vanity-checker',
    icon: Link2,
    iconClass: 'vanity-icon'
  },
  {
    title: 'Asset stealer',
    description: 'Steal assets from a Discord server.',
    href: '/asset-stealer',
    icon: Package,
    iconClass: 'package'
  },
  {
    title: 'Snowflake Decoder',
    description: 'Decode a Discord snowflake to get the internal information.',
    href: '/snowflake-decoder',
    icon: Snowflake,
    iconClass: 'snowflake'
  },
  {
    title: 'Gradient Finder',
    description: 'Find and customize beautiful color gradients for your roles.',
    href: '/gradient-finder',
    icon: Palette,
    iconClass: 'palette'
  },
  {
    title: 'Markdown Cheatsheet',
    description: 'Quick reference for Discord markdown formatting.',
    href: '/markdown-cheatsheet',
    icon: PencilLine,
    iconClass: 'pencil-line'
  },
  {
    title: 'Asset Compressor',
    description: 'Compress stickers and emojis.',
    href: '/asset-compressor',
    icon: ArrowDownWideNarrow,
    iconClass: 'arrow-down-wide-narrow'
  },
  {
    title: 'Soundboard Studio',
    description: 'Create and edit soundboard clips for your server.',
    href: '/soundboard-studio',
    icon: FileMusic,
    iconClass: 'file-music'
  },
  {
    title: 'Asset Resizer',
    description: 'Resize assets for a server or profile.',
    href: '/asset-resizer',
    icon: Scaling,
    iconClass: 'scaling'
  },
  {
    title: 'Permission Calculator',
    description: 'Easily setup permissions for your applications.',
    href: '/permission-calculator',
    icon: Calculator,
    iconClass: 'calculator'
  },
  {
    title: 'Timestamp Generator',
    description: 'Generate Discord-compatible timestamps for messages and events.',
    href: '/timestamp-generator',
    icon: CalendarDays,
    iconClass: 'CalendarDays'
  },
  {
    title: 'Font Generator',
    description: 'Get custom fonts for your Discord display names.',
    href: '/font-generator',
    icon: TypeOutline,
    iconClass: 'type-outline'
  },
  {
    title: 'Space Generator',
    description: 'Inject zero-width spaces into your text for Discord.',
    href: '/space-generator',
    icon: Space,
    iconClass: 'space'
  },
  {
    title: 'Automod Permission Decoder',
    description: 'Decode and understand automod permissions for your server.',
    href: '/automod-permission-decoder',
    icon: KeyRound,
    iconClass: 'key-round'
  },
  {
    title: 'Automod Tester',
    description: 'Test automod regexes and keywords before implementation.',
    href: '/automod-tester',
    icon: BrickWallShield,
    iconClass: 'brick-wall-shield'
  },
  {
    title: 'Regex Creator',
    description: 'Create regexes for your Discord automod.',
    href: '/regex-creator',
    icon: Regex,
    iconClass: 'regex'
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = tools.filter((tool) => {
    const q = searchQuery.toLowerCase().trim();
    return tool.title.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q);
  });

  return (
    <main className="page-wrap directory-page">
      <header className="directory-header">
        <p className="page-kicker">Botless Toolkit</p>
        <h1>Find easy to use tools for your Discord server!</h1>
        
        <div style={{ marginTop: '20px', position: 'relative', width: '100%', maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#090a0c', borderRadius: '6px', border: '1px solid #1e2024', padding: '10px 14px' }}>
            <Search size={16} style={{ color: '#80848e', marginRight: '10px', flexShrink: 0 }} aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name or description..."
              style={{ width: '100%', backgroundColor: 'transparent', color: '#f2f3f5', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit' }}
            />
          </div>
        </div>
      </header>

      {!searchQuery && (
        <section style={{ marginBottom: '32px' }}>
          <p className="page-kicker" style={{ marginBottom: '12px', fontSize: '11px', fontWeight: '700', color: '#80848e' }}>Official Pages</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {officialPages.map((page) => {
              const IconComponent = page.icon;
              return (
                <Link key={page.href} className="tool-link" href={page.href}>
                  <span className={`tool-icon ${page.iconClass}`} aria-hidden="true">
                    <IconComponent size={24} />
                  </span>
                  <span className="tool-copy">
                    <span className="tool-title">{page.title}</span>
                    <span className="tool-description">{page.description}</span>
                  </span>
                  <ArrowUpRight className="tool-arrow" size={16} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        {!searchQuery && (
          <p className="page-kicker" style={{ marginBottom: '12px', fontSize: '11px', fontWeight: '700', color: '#80848e' }}>Active Tools</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link key={tool.href} className="tool-link" href={tool.href}>
                  <span className={`tool-icon ${tool.iconClass}`} aria-hidden="true">
                    <IconComponent size={24} />
                  </span>
                  <span className="tool-copy">
                    <span className="tool-title">{tool.title}</span>
                    <span className="tool-description">{tool.description}</span>
                  </span>
                  <ArrowUpRight className="tool-arrow" size={16} aria-hidden="true" />
                </Link>
              );
            })
          ) : (
            <div style={{ padding: '24px 0', color: '#80848e', fontSize: '14px' }}>
              No tools found matching "{searchQuery}".
            </div>
          )}
        </div>
      </section>

      <footer style={{ marginTop: '48px', paddingTop: '20px', color: '#80848e', fontSize: '12px', textAlign: 'center', lineHeight: '1.5' }}>
        Botless is not endorsed by, directly affiliated with, maintained, authorized, or sponsored by Discord Inc.
      </footer>
    </main>
  );
}