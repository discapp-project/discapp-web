'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, ChevronRight, Newspaper } from 'lucide-react';
import { newsletterIndex, NewsletterMeta } from '../data/newsletters';

function renderSimpleMarkdown(text: string) {
  if (!text) return null;

  // Normalize line endings (\r\n -> \n)
  const normalized = text.replace(/\r\n/g, '\n').trim();

  // Split content by double newlines into block chunks
  const blocks = normalized.split(/\n{2,}/);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginTop: '24px', marginBottom: '12px' }}>
          {trimmed.replace('### ', '')}
        </h3>
      );
    }

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginTop: '28px', marginBottom: '14px' }}>
          {trimmed.replace('## ', '')}
        </h2>
      );
    }

    if (trimmed.startsWith('# ')) {
      return (
        <h1 key={idx} style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', marginTop: '32px', marginBottom: '16px' }}>
          {trimmed.replace('# ', '')}
        </h1>
      );
    }

    // Unordered Lists (* or -)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const items = trimmed.split(/\n(?=[\*\-]\s)/);
      return (
        <ul key={idx} style={{ paddingLeft: '20px', marginBottom: '16px', color: '#dbdee1', lineHeight: '1.6' }}>
          {items.map((item, i) => {
            const cleanItem = item.replace(/^[\*\-]\s*/, '').trim();
            const parts = cleanItem.split(/\*\*(.*?)\*\*/g);
            return (
              <li key={i} style={{ marginBottom: '6px' }}>
                {parts.map((part, pIdx) =>
                  pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: '#ffffff' }}>{part}</strong> : part
                )}
              </li>
            );
          })}
        </ul>
      );
    }

    // Paragraphs (with bold formatting and line break handling)
    const lines = trimmed.split('\n');
    return (
      <p key={idx} style={{ fontSize: '14px', lineHeight: '1.6', color: '#dbdee1', marginBottom: '16px' }}>
        {lines.map((line, lineIdx) => {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <span key={lineIdx}>
              {parts.map((part, pIdx) =>
                pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: '#ffffff' }}>{part}</strong> : part
              )}
              {lineIdx < lines.length - 1 && <br />}
            </span>
          );
        })}
      </p>
    );
  });
}

export default function DiscappNews() {
  const [activeMeta, setActiveMeta] = useState<NewsletterMeta | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const openPost = async (meta: NewsletterMeta) => {
    setActiveMeta(meta);
    setLoading(true);
    try {
      const res = await fetch(`/newsletters/${meta.slug}.md`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const text = await res.text();
      setMarkdownContent(text);
    } catch (error) {
      console.error('Error fetching newsletter:', error);
      setMarkdownContent('Failed to load article content.');
    } finally {
      setLoading(false);
    }
  };

  const closePost = () => {
    setActiveMeta(null);
    setMarkdownContent('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111214', color: '#dbdee1', padding: '40px 24px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {activeMeta ? (
          <article style={{ backgroundColor: '#111214', borderRadius: '8px', border: '1px solid #1e2024', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#80848e', marginBottom: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(155, 240, 190, 0.1)', color: '#9bf0be', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                <Tag size={12} /> {activeMeta.category}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {activeMeta.date}
              </span>
              <span>By {activeMeta.author}</span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
              {activeMeta.title}
            </h1>

            {activeMeta.image && (
              <div style={{ width: '100%', height: '280px', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px', border: '1px solid #1e2024' }}>
                <img src={activeMeta.image} alt={activeMeta.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ borderTop: '1px solid #1e2024', paddingTop: '20px' }}>
              {loading ? (
                <div style={{ color: '#80848e', fontSize: '14px' }}>Loading post...</div>
              ) : (
                renderSimpleMarkdown(markdownContent)
              )}
            </div>
          </article>
        ) : (
          <div>
            <header style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '28px', fontWeight: '800', color: '#9bf0be', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>
                <Newspaper size={28} style={{ display: 'inline-block', verticalAlign: 'text-bottom', marginRight: '10px' }} /> Discapp News!
              </p>

              <p style={{ color: '#80848e', fontSize: '14px', margin: 0 }}>
                Latest announcements from our official Discord server!
              </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {newsletterIndex && newsletterIndex.length > 0 ? (
                newsletterIndex.map((meta: NewsletterMeta) => (
                  <div
                    key={meta.slug}
                    onClick={() => openPost(meta)}
                    style={{
                      backgroundColor: '#111214',
                      borderRadius: '8px',
                      border: '1px solid #1e2024',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2b2d31')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e2024')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ backgroundColor: 'rgba(155, 240, 190, 0.1)', color: '#9bf0be', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                          {meta.category}
                        </span>
                        <span style={{ color: '#80848e' }}>{meta.date}</span>
                      </div>
                      <ChevronRight size={16} style={{ color: '#80848e' }} />
                    </div>

                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                      {meta.title}
                    </h2>

                    {meta.image && (
                      <div style={{ width: '100%', height: '180px', borderRadius: '6px', overflow: 'hidden', margin: '12px 0', border: '1px solid #1e2024' }}>
                        <img src={meta.image} alt={meta.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    <p style={{ color: '#80848e', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                      {meta.summary}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ padding: '32px 0', color: '#80848e', fontSize: '14px', textAlign: 'center' }}>
                  No newsletters found.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}