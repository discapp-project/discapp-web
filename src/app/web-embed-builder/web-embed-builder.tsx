'use client';

import React, { useState } from 'react';

interface ButtonItem {
  id: string;
  label: string;
  url: string;
}

export default function BotlessMetaGenerator() {
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'author' | 'buttons'>('general');

  // Embed State
  const [siteName, setSiteName] = useState('Botless Previews');
  const [title, setTitle] = useState('This is my super cool embed');
  const [description, setDescription] = useState(
    "Websites can now provide buttons on embeds!"
  );
  const [themeColor, setThemeColor] = useState('#acf6a5');
  const [appId, setAppId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorUrl, setAuthorUrl] = useState('');
  const [authorIcon, setAuthorIcon] = useState('');

  const [buttons, setButtons] = useState<ButtonItem[]>([
    { id: '1', label: 'Button 1', url: 'https://example.com/test' },
    { id: '2', label: 'Button 2 (cooler)', url: 'https://example.com/docs' }
  ]);

  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const addButton = () => {
    if (buttons.length >= 5) return;
    setButtons([...buttons, { id: Date.now().toString(), label: 'New Button', url: 'https://' }]);
  };

  const removeButton = (id: string) => {
    setButtons(buttons.filter((b) => b.id !== id));
  };

  const updateButton = (id: string, field: 'label' | 'url', value: string) => {
    setButtons(buttons.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const generateMetaTags = () => {
    let tags = `<!-- Standard & OpenGraph Meta Tags -->\n`;
    if (siteName) tags += `<meta property="og:site_name" content="${escapeHtml(siteName)}">\n`;
    if (title) {
      tags += `<meta name="title" content="${escapeHtml(title)}">\n`;
      tags += `<meta property="og:title" content="${escapeHtml(title)}">\n`;
    }
    if (description) {
      tags += `<meta name="description" content="${escapeHtml(description)}">\n`;
      tags += `<meta property="og:description" content="${escapeHtml(description)}">\n`;
    }
    if (themeColor) tags += `<meta name="theme-color" content="${themeColor}">\n`;
    if (imageUrl) tags += `<meta property="og:image" content="${escapeHtml(imageUrl)}">\n`;
    if (thumbnailUrl) tags += `<meta property="og:thumbnail" content="${escapeHtml(thumbnailUrl)}">\n`;

    if (authorName) {
      tags += `\n<!-- Author Meta Tags -->\n`;
      tags += `<meta property="og:article:author" content="${escapeHtml(authorName)}">\n`;
      if (authorUrl) tags += `<meta property="og:author:url" content="${escapeHtml(authorUrl)}">\n`;
      if (authorIcon) tags += `<meta property="og:author:icon" content="${escapeHtml(authorIcon)}">\n`;
    }

    const hasAppId = appId.trim() !== '';
    if (hasAppId || buttons.length > 0) {
      tags += `\n<!-- Discord Application & Component Buttons -->\n`;
      if (hasAppId) tags += `<meta property="discord:app_id" content="${escapeHtml(appId.trim())}">\n`;
      buttons.forEach((btn, index) => {
        if (btn.label) tags += `<meta property="discord:button:${index}:label" content="${escapeHtml(btn.label)}">\n`;
        if (btn.url) tags += `<meta property="discord:button:${index}:url" content="${escapeHtml(btn.url)}">\n`;
      });
    }

    return tags.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMetaTags());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'media', label: 'Media' },
    { id: 'author', label: 'Author' },
    { id: 'buttons', label: `Buttons (${buttons.length})` }
  ] as const;

  return (
    <div style={{ backgroundColor: '#111214', minHeight: '100vh', color: '#f1f5f9', padding: '16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Tool Header Title */}
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Discord Component Meta Tag Generator
          </h1>
        </header>

        {/* Workspace Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Settings Panel */}
          <section style={{ backgroundColor: '#1e1f22', border: '1px solid #2e3035', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Top Navigation Bar */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#111214', padding: '4px', borderRadius: '8px', overflowX: 'auto' }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? '#2b2d31' : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Category 1: General Settings */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Site / Provider Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Embed Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Embed Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Accent Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', color: '#94a3b8' }}>Discord App ID</label>
                      
                      {/* Custom Tooltip Wrapper */}
                      <div 
                        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '15px',
                            height: '15px',
                            borderRadius: '50%',
                            backgroundColor: '#2b2d31',
                            color: '#94a3b8',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '1px solid #3f4248',
                            lineHeight: 1
                          }}
                        >
                          i
                        </span>

                        {showTooltip && (
                          <div 
                            style={{
                              position: 'absolute',
                              bottom: 'calc(100% + 8px)',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              backgroundColor: '#111214',
                              color: '#dbdee1',
                              border: '1px solid #3f4248',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              lineHeight: '1.4',
                              width: '210px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                              pointerEvents: 'none',
                              zIndex: 50,
                              textAlign: 'center'
                            }}
                          >
                            Links embed directly to a registered Application for attribution and verification. Not required but may be useful!
                            {/* Tooltip Arrow */}
                            <div 
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderLeft: '5px solid transparent',
                                borderRight: '5px solid transparent',
                                borderTop: '5px solid #3f4248'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="Optional (e.g. 12345...)"
                      style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Category 2: Media Settings */}
            {activeTab === 'media' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Banner Image URL (Large Bottom)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/banner.png"
                    style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Thumbnail URL (Small Right Icon)</label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/icon.png"
                    style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {/* Category 3: Author Settings */}
            {activeTab === 'author' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Botless Developer"
                    style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Author Link URL</label>
                  <input
                    type="url"
                    value={authorUrl}
                    onChange={(e) => setAuthorUrl(e.target.value)}
                    placeholder="https://..."
                    style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Author Icon URL</label>
                  <input
                    type="url"
                    value={authorIcon}
                    onChange={(e) => setAuthorIcon(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #3f4248', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {/* Category 4: Buttons Settings */}
            {activeTab === 'buttons' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Custom Action Buttons ({buttons.length}/5)</span>
                  {buttons.length < 5 && (
                    <button
                      onClick={addButton}
                      style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + Add Button
                    </button>
                  )}
                </div>

                {buttons.map((btn, idx) => (
                  <div key={btn.id} style={{ backgroundColor: '#111214', padding: '12px', borderRadius: '8px', border: '1px solid #2b2d31', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#818cf8' }}>Button #{idx + 1}</span>
                      <button
                        onClick={() => removeButton(btn.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Label (e.g. 🧪 Read Docs)"
                        value={btn.label}
                        onChange={(e) => updateButton(btn.id, 'label', e.target.value)}
                        style={{ width: '100%', backgroundColor: '#1e1f22', border: '1px solid #3f4248', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={btn.url}
                        onChange={(e) => updateButton(btn.id, 'url', e.target.value)}
                        style={{ width: '100%', backgroundColor: '#1e1f22', border: '1px solid #3f4248', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Preview & Output Container */}
          <section style={{ backgroundColor: '#1e1f22', border: '1px solid #2e3035', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '16px' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1', borderBottom: '1px solid #2e3035', paddingBottom: '8px', margin: 0 }}>
              Live Discord Preview
            </h2>

            {/* Standalone Link Embed Container */}
            <div style={{ backgroundColor: '#313338', borderRadius: '8px', padding: '12px', fontFamily: 'gg sans, Helvetica Neue, Helvetica, Arial, sans-serif' }}>
              <div
                style={{
                  backgroundColor: '#2b2d31',
                  borderRadius: '4px',
                  padding: '12px',
                  maxWidth: '432px',
                  width: '100%',
                  borderLeft: `4px solid ${themeColor || '#80f000'}`,
                  boxSizing: 'border-box'
                }}
              >
                {/* Author Section */}
                {authorName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {authorIcon && (
                      <img src={authorIcon} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    {authorUrl ? (
                      <a href={authorUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', textDecoration: 'none' }}>
                        {authorName}
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{authorName}</span>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {siteName && <span style={{ fontSize: '11px', color: '#b5bac1', display: 'block', marginBottom: '4px' }}>{siteName}</span>}
                    <a href="#" style={{ fontSize: '15px', fontWeight: 700, color: '#00a8fc', textDecoration: 'none', display: 'block', marginBottom: '4px', lineHeight: '1.2' }}>
                      {title || 'Untitled'}
                    </a>
                    {description && (
                      <p style={{ fontSize: '13px', color: '#dbdee1', margin: 0, lineHeight: '1.35', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Right Thumbnail */}
                  {thumbnailUrl && (
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail"
                      style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                    />
                  )}
                </div>

                {/* Large Main Banner */}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Banner"
                    style={{ width: '100%', borderRadius: '4px', marginTop: '10px', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
                  />
                )}

                {/* Buttons Row */}
                {buttons.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    {buttons.map((btn) => (
                      <a
                        key={btn.id}
                        href={btn.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#383a40',
                          color: '#f2f3f5',
                          fontSize: '12px',
                          fontWeight: 500,
                          padding: '6px 12px',
                          borderRadius: '3px',
                          textDecoration: 'none',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>{btn.label || 'Button'}</span>
                        <span style={{ fontSize: '10px', opacity: 0.6 }}>↗</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Code Output */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Generated Meta Tags</span>
                <button
                  onClick={handleCopy}
                  style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>

              <pre style={{ backgroundColor: '#090d16', border: '1px solid #2e3035', borderRadius: '6px', padding: '12px', overflowX: 'auto', fontSize: '11px', color: '#e2e8f0', margin: 0, maxHeight: '180px' }}>
                <code>{generateMetaTags()}</code>
              </pre>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}