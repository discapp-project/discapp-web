'use client';

import { useState, useMemo } from 'react';
import {ArrowLeft} from "lucide-react";

interface MarkdownItem {
  id: string;
  name: string;
  syntax: string;
  description: string;
  usageNote?: string;
  previewType: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'spoiler' | 'inline-code' | 'code-block' | 'quote' | 'block-quote' | 'header-1' | 'header-2' | 'header-3' | 'list' | 'link' | 'subtext' | 'timestamp';
  previewText: string;
}

const MARKDOWN_ITEMS: MarkdownItem[] = [
  {
    id: 'bold',
    name: 'Bold',
    syntax: '**Bold Text**',
    description: 'Emphasizes text with a heavy font weight.',
    usageNote: 'Wrap text with two asterisks on each side.',
    previewType: 'bold',
    previewText: 'Bold Text',
  },
  {
    id: 'italic',
    name: 'Italics',
    syntax: '*Italic Text*',
    description: 'Slants text for subtle emphasis.',
    usageNote: 'Use a single asterisk or single underscore on both sides.',
    previewType: 'italic',
    previewText: 'Italic Text',
  },
  {
    id: 'bold-italic',
    name: 'Bold Italics',
    syntax: '***Bold & Italic Text***',
    description: 'Combines both bold and italic styling.',
    usageNote: 'Wrap text in three asterisks on each side.',
    previewType: 'bold',
    previewText: 'Bold & Italic Text',
  },
  {
    id: 'underline',
    name: 'Underline',
    syntax: '__Underlined Text__',
    description: 'Adds a horizontal line underneath the text.',
    usageNote: 'Wrap text in double underscores.',
    previewType: 'underline',
    previewText: 'Underlined Text',
  },
  {
    id: 'strikethrough',
    name: 'Strikethrough',
    syntax: '~~Strikethrough Text~~',
    description: 'Draws a line straight through text to indicate deletion.',
    usageNote: 'Wrap text in double tildes.',
    previewType: 'strikethrough',
    previewText: 'Strikethrough Text',
  },
  {
    id: 'spoiler',
    name: 'Spoiler',
    syntax: '||Hidden Spoiler||',
    description: 'Hides content behind a black bar until clicked by a viewer.',
    usageNote: 'Wrap text in double pipe characters.',
    previewType: 'spoiler',
    previewText: 'Hidden Spoiler',
  },
  {
    id: 'subtext',
    name: 'Subtext',
    syntax: '-# Small subtext note',
    description: 'Renders smaller, muted gray text.',
    usageNote: 'Add -# followed by a space at the start of a line.',
    previewType: 'subtext',
    previewText: 'Small subtext note',
  },
  {
    id: 'header-1',
    name: 'Header 1',
    syntax: '# Large Header',
    description: 'Creates the largest primary heading.',
    usageNote: 'Add # and a space before your text.',
    previewType: 'header-1',
    previewText: 'Large Header',
  },
  {
    id: 'header-2',
    name: 'Header 2',
    syntax: '## Medium Header',
    description: 'Creates a medium section heading.',
    usageNote: 'Add ## and a space before your text.',
    previewType: 'header-2',
    previewText: 'Medium Header',
  },
  {
    id: 'header-3',
    name: 'Header 3',
    syntax: '### Small Header',
    description: 'Creates a small sub-heading.',
    usageNote: 'Add ### and a space before your text.',
    previewType: 'header-3',
    previewText: 'Small Header',
  },
  {
    id: 'inline-code',
    name: 'Inline Code',
    syntax: '`npm run dev`',
    description: 'Highlights inline code commands or short text.',
    usageNote: 'Wrap code in single backticks.',
    previewType: 'inline-code',
    previewText: 'npm run dev',
  },
  {
    id: 'code-block',
    name: 'Code Block',
    syntax: '```\nconsole.log("Hello Discord!");\n```',
    description: 'Creates a full multi-line code container.',
    usageNote: 'Wrap text inside triple backticks.',
    previewType: 'code-block',
    previewText: 'console.log("Hello Discord!");',
  },
  {
    id: 'single-quote',
    name: 'Single Line Quote',
    syntax: '> This is a single line quote.',
    description: 'Indents a single line with a vertical quote bar.',
    usageNote: 'Add > and a space at the start of the line.',
    previewType: 'quote',
    previewText: 'This is a single line quote.',
  },
  {
    id: 'block-quote',
    name: 'Multi-Line Block Quote',
    syntax: '>>> First line of quote\nSecond line of quote',
    description: 'Indents all remaining text in the message.',
    usageNote: 'Add >>> and a space at the very start of your block.',
    previewType: 'block-quote',
    previewText: 'First line of quote\nSecond line of quote',
  },
  {
    id: 'bullet-list',
    name: 'Bullet List',
    syntax: '- Item one\n- Item two',
    description: 'Creates itemized lists with bullet points.',
    usageNote: 'Add - or * followed by a space before each item.',
    previewType: 'list',
    previewText: '• Item one\n• Item two',
  },
  {
    id: 'masked-link',
    name: 'Masked Hyperlink',
    syntax: '[Click Here](https://discord.com)',
    description: 'Formats custom clickable anchor text.',
    usageNote: 'Works natively inside embeds or webhook messages.',
    previewType: 'link',
    previewText: 'Click Here',
  },
  {
    id: 'timestamp',
    name: 'Dynamic Timestamp',
    syntax: '<t:1700000000:F>',
    description: 'Displays dynamic time auto-formatted to each user local timezone.',
    usageNote: 'Replace 1700000000 with any Unix epoch timestamp.',
    previewType: 'timestamp',
    previewText: 'Tuesday, November 14, 2023 10:13 PM',
  },
];

export default function DiscordMarkdownLibrary() {
  const [selectedItem, setSelectedItem] = useState<MarkdownItem>(MARKDOWN_ITEMS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [revealedSpoiler, setRevealedSpoiler] = useState(false);

  const filteredItems = useMemo(() => {
    return MARKDOWN_ITEMS.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.syntax.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  const handleCopy = (syntaxText: string) => {
    navigator.clipboard.writeText(syntaxText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderDiscordPreview = (item: MarkdownItem) => {
    switch (item.previewType) {
      case 'bold':
        return <span style={{ fontWeight: '700', color: '#f2f3f5' }}>{item.previewText}</span>;
      case 'italic':
        return <span style={{ fontStyle: 'italic', color: '#f2f3f5' }}>{item.previewText}</span>;
      case 'underline':
        return <span style={{ textDecoration: 'underline', color: '#f2f3f5' }}>{item.previewText}</span>;
      case 'strikethrough':
        return <span style={{ textDecoration: 'line-through', color: '#f2f3f5' }}>{item.previewText}</span>;
      case 'subtext':
        return <span style={{ fontSize: '11px', color: '#949ba4', lineHeight: '1.4' }}>{item.previewText}</span>;
      case 'header-1':
        return <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f2f3f5', margin: '0 0 4px 0', borderBottom: '1px solid #3f4147', paddingBottom: '4px' }}>{item.previewText}</h1>;
      case 'header-2':
        return <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f2f3f5', margin: '0 0 4px 0' }}>{item.previewText}</h2>;
      case 'header-3':
        return <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f2f3f5', margin: '0 0 4px 0' }}>{item.previewText}</h3>;
      case 'spoiler':
        return (
          <span 
            onClick={() => setRevealedSpoiler(!revealedSpoiler)}
            style={{ 
              backgroundColor: revealedSpoiler ? '#2b2d31' : '#202225', 
              color: revealedSpoiler ? '#dbdee1' : 'transparent', 
              padding: '2px 6px', 
              borderRadius: '3px', 
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'background-color 0.15s, color 0.15s'
            }}
          >
            {item.previewText}
          </span>
        );
      case 'inline-code':
        return (
          <code style={{ backgroundColor: '#1e1f22', color: '#dbdee1', padding: '2px 6px', borderRadius: '4px', fontFamily: 'Consolas, Monaco, "Andale Mono", monospace', fontSize: '13px' }}>
            {item.previewText}
          </code>
        );
      case 'code-block':
        return (
          <pre style={{ backgroundColor: '#2b2d31', border: '1px solid #1e1f22', color: '#dbdee1', padding: '12px', borderRadius: '4px', fontFamily: 'Consolas, Monaco, "Andale Mono", monospace', fontSize: '13px', margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            <code>{item.previewText}</code>
          </pre>
        );
      case 'quote':
      case 'block-quote':
        return (
          <div style={{ borderLeft: '4px solid #4e5058', paddingLeft: '12px', color: '#dbdee1', whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.5' }}>
            {item.previewText}
          </div>
        );
      case 'list':
        return (
          <div style={{ color: '#dbdee1', whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.6' }}>
            {item.previewText}
          </div>
        );
      case 'link':
        return (
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#00a8fc', textDecoration: 'none' }}>
            {item.previewText}
          </a>
        );
      case 'timestamp':
        return (
          <span style={{ backgroundColor: '#2b2d31', color: '#c4c9ce', padding: '2px 6px', borderRadius: '3px', fontSize: '13px', border: '1px solid #383a40' }}>
            {item.previewText}
          </span>
        );
      default:
        return <span style={{ color: '#dbdee1' }}>{item.previewText}</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111214', color: '#dbdee1', padding: '24px 16px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '16px' }}>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markdown..."
            style={{
              width: '100%',
              backgroundColor: '#1c1d22',
              border: '1px solid #2b2d31',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'start' }}>
          
          <div style={{ backgroundColor: '#1c1d22', borderRadius: '6px', border: '1px solid #2b2d31', padding: '8px', maxHeight: '600px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filteredItems.map((item) => {
                const isSelected = selectedItem.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setRevealedSpoiler(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? '#2b2d31' : 'transparent',
                      color: isSelected ? '#ffffff' : '#949ba4',
                      fontWeight: isSelected ? '600' : '400',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {item.name}
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 12px', color: '#80848e', fontSize: '13px' }}>
                  No results
                </div>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: '#1c1d22', borderRadius: '6px', border: '1px solid #2b2d31', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: '#111214', border: '1px solid #2b2d31', borderRadius: '4px', padding: '8px 12px', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', color: '#ffffff', flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {selectedItem.syntax}
              </div>
              <button
                onClick={() => handleCopy(selectedItem.syntax)}
                style={{
                  backgroundColor: '#9bf0be',
                  color: '#111214',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div style={{ backgroundColor: '#313338', borderRadius: '6px', padding: '12px', border: '1px solid #2b2d31', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#5865F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#ffffff', flexShrink: 0, fontSize: '13px' }}>
                BP
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#ffffff' }}>
                    Discapp Previews
                  </span>
                  <span style={{ backgroundColor: '#5865F2', color: '#ffffff', fontSize: '9px', fontWeight: '700', padding: '1px 3px', borderRadius: '2px' }}>
                    SYSTEM
                  </span>
                  <span style={{ fontSize: '10px', color: '#949ba4' }}>Today at 4:20 PM</span>
                </div>

                <div style={{ fontSize: '13px', color: '#dbdee1', lineHeight: '1.4' }}>
                  {renderDiscordPreview(selectedItem)}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#111214', border: '1px solid #2b2d31', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                {selectedItem.description}
              </div>
              {selectedItem.usageNote && (
                <div style={{ fontSize: '12px', color: '#80848e' }}>
                  {selectedItem.usageNote}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}