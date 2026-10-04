'use client';

import React, { useState } from 'react';

interface DiscordGuildResponse {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  home_header: string | null;
  splash: string | null;
  banner: string | null;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  vanity_url_code?: string | null;
  premium_subscription_count?: number;
  nsfw?: boolean;
  nsfw_level?: number;
  verification_level?: number;
  features?: string[];
  welcome_screen?: {
    description: string | null;
    welcome_channels: Array<{
      channel_id: string;
      description: string;
      emoji_id: string | null;
      emoji_name: string | null;
    }>;
  } | null;
  guild?: {
    id: string;
    name: string;
    icon: string | null;
    banner: string | null;
    description: string | null;
    features?: string[];
    verification_level?: number;
    vanity_url_code?: string | null;
    nsfw_level?: number;
    nsfw?: boolean;
    premium_tier?: number;
  };
  channel?: {
    id: string;
    name: string;
    type: number;
  } | null;
  inviter?: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
  } | null;
  expires_at?: string | null;
  [key: string]: unknown;
}

export default function DiscordServerLookup() {
  const [inviteInput, setInviteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guildData, setGuildData] = useState<DiscordGuildResponse | null>(null);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'inviter' | 'assets' | 'json'>('overview');

  const cleanInviteCode = (input: string) => {
    let code = input.trim();
    code = code.replace(/^(https?:\/\/)?(www\.)?(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\//i, '');
    code = code.split('?')[0].split('#')[0];
    return code;
  };

  const fetchGuildData = async () => {
    const inviteCode = cleanInviteCode(inviteInput);

    if (!inviteCode) {
      setError('Please enter a valid Discord invite link or code.');
      return;
    }

    setLoading(true);
    setError(null);
    setGuildData(null);
    setRawJson(null);

    try {
      const response = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Unknown or expired invite link.');
        }
        throw new Error(`Discord API returned status ${response.status}`);
      }

      const data = await response.json();
      setGuildData(data);
      setRawJson(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch server data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getGuildId = () => guildData?.guild?.id || guildData?.id || '';
  const getGuildName = () => guildData?.guild?.name || guildData?.name || 'Unknown Server';
  const getGuildIcon = () => guildData?.guild?.icon || guildData?.icon || null;
  const getGuildBanner = () => guildData?.guild?.banner || guildData?.banner || null;
  const getGuildSplash = () => guildData?.splash || null;

  const getIconUrl = (id: string, hash: string | null) => {
    if (!hash) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    const ext = hash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/icons/${id}/${hash}.${ext}?size=1024`;
  };

  const getBannerUrl = (id: string, hash: string | null) => {
    if (!hash) return null;
    const ext = hash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/banners/${id}/${hash}.${ext}?size=1024`;
  };

  const getSplashUrl = (id: string, hash: string | null) => {
    if (!hash) return null;
    return `https://cdn.discordapp.com/splashes/${id}/${hash}.png?size=1024`;
  };

  const getUserAvatarUrl = (id: string, hash: string | null) => {
    if (!hash) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    const ext = hash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.${ext}?size=1024`;
  };

  const getCreationDate = (id: string) => {
    try {
      const snowflake = BigInt(id);
      const timestamp = Number((snowflake >> 22n) + 1420070400000n);
      const date = new Date(timestamp);
      return {
        formatted: date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        unix: Math.floor(timestamp / 1000),
        iso: date.toISOString(),
      };
    } catch {
      return { formatted: 'Invalid Snowflake', unix: 0, iso: '' };
    }
  };

  const getVerificationLevelName = (level?: number) => {
    switch (level) {
      case 0:
        return 'None (Unrestricted)';
      case 1:
        return 'Low (Must have verified email)';
      case 2:
        return 'Medium (Registered for > 5 mins)';
      case 3:
        return 'High (Member of server for > 10 mins)';
      case 4:
        return 'Very High (Must have verified phone number)';
      default:
        return 'Unknown / Unspecified';
    }
  };

  const getNsfwLevelName = (level?: number) => {
    switch (level) {
      case 0:
        return 'Default';
      case 1:
        return 'Explicit';
      case 2:
        return 'Safe';
      case 3:
        return 'Age Restricted';
      default:
        return 'Unspecified';
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const guildId = getGuildId();
  const snowflakeInfo = guildId ? getCreationDate(guildId) : null;
  const featuresList = guildData?.guild?.features || guildData?.features || [];

  return (
    <div style={{ backgroundColor: '#0e0f11', minHeight: '100vh', color: '#dcddde', padding: '24px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #1c1d22;
          border-radius: 4px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }
        .tab-btn {
          background: none;
          border: none;
          color: #8e9297;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 12px;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: all 0.15s ease;
        }
        .tab-btn.active {
          color: #ffffff;
          border-bottom-color: #9bf0be;
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Page Header */}
        <header style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
            Discord Server Inspector
          </h1>
          <p style={{ fontSize: '13px', color: '#8e9297', marginTop: '6px', margin: 0 }}>
            Inspect public guild parameters, member counts, features, inviter details, and raw CDN assets via invite link.
          </p>
        </header>

        {/* Top Input & Search Action Card */}
        <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
          <form onSubmit={(e) => { e.preventDefault(); fetchGuildData(); }} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                Invite Link or Code
              </label>
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="e.g. discord.gg/discord-developers or discord-developers"
                style={{
                  width: '100%',
                  backgroundColor: '#09090b',
                  border: '1px solid #202227',
                  color: '#dcddde',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            {/* Inspect Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#1c1d22' : '#9bf0be',
                color: loading ? '#8e9297' : '#0e0f11',
                border: 'none',
                padding: '11px 20px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {loading ? 'Fetching Server...' : 'Inspect Guild Object'}
            </button>
          </form>

          {error && (
            <div style={{ backgroundColor: '#2d1517', border: '1px solid #f87171', color: '#fca5a5', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', marginTop: '16px' }}>
              {error}
            </div>
          )}
        </div>

        {/* Main Content Workspace */}
        {guildData ? (
          <div>
            {/* Header Identity Snippet Card */}
            <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', borderRadius: '6px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <img
                src={getIconUrl(guildId, getGuildIcon())}
                alt="Guild Icon"
                style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#09090b', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {getGuildName()}
                  </h2>
                  {guildData.nsfw && (
                    <span style={{ backgroundColor: '#ed4245', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>NSFW</span>
                  )}
                  {(guildData.vanity_url_code || guildData.guild?.vanity_url_code) && (
                    <span style={{ backgroundColor: '#1c1d22', border: '1px solid #282a30', color: '#dcddde', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      .gg/{guildData.vanity_url_code || guildData.guild?.vanity_url_code}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#8e9297', marginTop: '4px' }}>
                  {guildData.description || guildData.guild?.description || 'No description provided.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleCopy(guildId)}
                  style={{ backgroundColor: '#1c1d22', border: '1px solid #282a30', color: '#dcddde', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {copied ? 'Copied ID' : 'Copy Guild ID'}
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="custom-scroll" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #1c1d22', marginBottom: '20px', overflowX: 'auto' }}>
              <button onClick={() => setActiveTab('overview')} className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>
                Overview & Metrics
              </button>
              <button onClick={() => setActiveTab('features')} className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}>
                Guild Features ({featuresList.length})
              </button>
              <button onClick={() => setActiveTab('inviter')} className={`tab-btn ${activeTab === 'inviter' ? 'active' : ''}`}>
                Invite & Inviter Details
              </button>
              <button onClick={() => setActiveTab('assets')} className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}>
                Raw CDN URLs
              </button>
              <button onClick={() => setActiveTab('json')} className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}>
                Full JSON Object
              </button>
            </div>

            {/* TAB 1: OVERVIEW & METRICS */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="info-grid">
                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Guild Snowflake ID</span>
                    <span style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>{guildId}</span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Creation Date (UTC)</span>
                    <span style={{ fontSize: '13px', color: '#ffffff' }}>{snowflakeInfo?.formatted}</span>
                    <span style={{ fontSize: '11px', color: '#8e9297', display: 'block', marginTop: '2px' }}>Unix: {snowflakeInfo?.unix}</span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Approximate Total Members</span>
                    <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>
                      {guildData.approximate_member_count ? guildData.approximate_member_count.toLocaleString() : 'Hidden / Unavailable'}
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Approximate Online Presence</span>
                    <span style={{ fontSize: '13px', color: '#9bf0be', fontWeight: 700 }}>
                      {guildData.approximate_presence_count ? guildData.approximate_presence_count.toLocaleString() : 'Hidden / Unavailable'}
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Boost Tier / Subscriptions</span>
                    <span style={{ fontSize: '13px', color: '#ffffff' }}>
                      Tier {guildData.guild?.premium_tier ?? 0} ({guildData.premium_subscription_count ?? 0} Boosts)
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Verification Level</span>
                    <span style={{ fontSize: '13px', color: '#ffffff' }}>
                      {getVerificationLevelName(guildData.verification_level ?? guildData.guild?.verification_level)}
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>NSFW Rating Level</span>
                    <span style={{ fontSize: '13px', color: '#ffffff' }}>
                      {getNsfwLevelName(guildData.nsfw_level ?? guildData.guild?.nsfw_level)}
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Vanity URL Slug</span>
                    <span style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>
                      {guildData.vanity_url_code || guildData.guild?.vanity_url_code || 'None'}
                    </span>
                  </div>
                </div>

                {/* Welcome Screen Info */}
                {guildData.welcome_screen && (
                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '8px' }}>
                      Guild Welcome Screen
                    </span>
                    <p style={{ fontSize: '12px', color: '#dcddde', margin: '0 0 12px 0' }}>
                      {guildData.welcome_screen.description || 'No welcome message set.'}
                    </p>
                    {guildData.welcome_screen.welcome_channels?.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                        {guildData.welcome_screen.welcome_channels.map((chan, idx) => (
                          <div key={idx} style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '8px 12px', borderRadius: '4px', fontSize: '12px' }}>
                            <span style={{ color: '#9bf0be', fontWeight: 600, display: 'block' }}>
                              {chan.emoji_name ? `${chan.emoji_name} ` : ''}#{chan.channel_id}
                            </span>
                            <span style={{ color: '#8e9297', fontSize: '11px' }}>{chan.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GUILD FEATURES */}
            {activeTab === 'features' && (
              <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                  Active Guild Feature Flags ({featuresList.length})
                </span>
                {featuresList.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                    {featuresList.map((feature, idx) => (
                      <div key={idx} style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px 12px', borderRadius: '4px', fontSize: '12px' }}>
                        <code style={{ color: '#9bf0be', fontSize: '11px', display: 'block', wordBreak: 'break-all' }}>{feature}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: '#8e9297', fontStyle: 'italic' }}>No special feature flags enabled on this guild.</span>
                )}
              </div>
            )}

            {/* TAB 3: INVITE & INVITER DETAILS */}
            {activeTab === 'inviter' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Inviter User */}
                <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                    Invite Creator Information
                  </span>
                  {guildData.inviter ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <img
                        src={getUserAvatarUrl(guildData.inviter.id, guildData.inviter.avatar || null)}
                        alt="Inviter Avatar"
                        style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#09090b', objectFit: 'cover' }}
                      />
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'block' }}>
                          {guildData.inviter.global_name || guildData.inviter.username}
                        </span>
                        <span style={{ fontSize: '12px', color: '#8e9297' }}>
                          @{guildData.inviter.username} &bull; <code style={{ color: '#dcddde' }}>{guildData.inviter.id}</code>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#8e9297', fontStyle: 'italic' }}>Inviter details are missing, hidden, or this is a Vanity URL.</span>
                  )}
                </div>

                {/* Target Channel */}
                {guildData.channel && (
                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                      Target Destination Channel
                    </span>
                    <div className="info-grid">
                      <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Channel Name</span>
                        <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>#{guildData.channel.name}</span>
                      </div>
                      <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Channel ID</span>
                        <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{guildData.channel.id}</span>
                      </div>
                      <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Channel Type Integer</span>
                        <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{guildData.channel.type}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: RAW CDN URLS */}
            {activeTab === 'assets' && (
              <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                  Direct Guild Asset CDN Links
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Icon CDN */}
                  {getGuildIcon() && (
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px 12px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#8e9297', display: 'block', marginBottom: '2px' }}>Icon CDN (1024px)</span>
                      <a href={getIconUrl(guildId, getGuildIcon())} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#38bdf8', wordBreak: 'break-all', textDecoration: 'none' }}>
                        {getIconUrl(guildId, getGuildIcon())}
                      </a>
                    </div>
                  )}

                  {/* Banner CDN */}
                  {getBannerUrl(guildId, getGuildBanner()) && (
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px 12px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#8e9297', display: 'block', marginBottom: '2px' }}>Banner CDN (1024px)</span>
                      <a href={getBannerUrl(guildId, getGuildBanner())!} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#38bdf8', wordBreak: 'break-all', textDecoration: 'none' }}>
                        {getBannerUrl(guildId, getGuildBanner())}
                      </a>
                    </div>
                  )}

                  {/* Splash CDN */}
                  {getSplashUrl(guildId, getGuildSplash()) && (
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px 12px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#8e9297', display: 'block', marginBottom: '2px' }}>Invite Splash CDN (1024px)</span>
                      <a href={getSplashUrl(guildId, getGuildSplash())!} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#38bdf8', wordBreak: 'break-all', textDecoration: 'none' }}>
                        {getSplashUrl(guildId, getGuildSplash())}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: FULL RAW JSON */}
            {activeTab === 'json' && (
              <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Unfiltered Guild Invite API Response</span>
                  <button
                    onClick={() => handleCopy(rawJson || '')}
                    style={{ backgroundColor: '#1c1d22', color: '#dcddde', border: '1px solid #282a30', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="custom-scroll" style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', borderRadius: '4px', padding: '12px', overflowX: 'auto', fontSize: '12px', color: '#8e9297', margin: 0, maxHeight: '500px', fontFamily: 'monospace', lineHeight: '1.5' }}>
                  <code>{rawJson}</code>
                </pre>
              </div>
            )}
          </div>
        ) : (
          /* Empty Placeholder State */
          <div style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: '#121316', borderRadius: '6px', border: '1px dashed #1c1d22', color: '#8e9297', fontSize: '13px' }}>
            Submit a Discord invite code or link above to retrieve server details directly from Discord.
          </div>
        )}

      </div>
    </div>
  );
}