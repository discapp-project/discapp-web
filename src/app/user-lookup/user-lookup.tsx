'use client';

import React, { useState, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface DiscordUserResponse {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner: string | null;
  accent_color: number | null;
  banner_color?: string | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  public_flags?: number;
  premium_type?: number;
  avatar_decoration_data?: {
    asset: string;
    sku_id: string;
    expires_at?: string | null;
  } | null;
  collectibles?: {
    nameplate?: {
      sku_id: string;
      asset: string;
      label?: string;
      palette?: string;
    } | null;
  } | null;
  display_name_styles?: {
    font_id?: number;
    effect_id?: number;
    colors?: number[];
  } | null;
  clan?: {
    identity_guild_id: string;
    identity_enabled: boolean;
    tag: string;
    badge: string;
  } | null;
  primary_guild?: {
    identity_guild_id: string;
    identity_enabled: boolean;
    tag?: string;
    badge?: string;
  } | null;
  [key: string]: any;
}

export default function DiscordUserLookup() {
  const [userId, setUserId] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<DiscordUserResponse | null>(null);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cosmetics' | 'clan' | 'assets' | 'json'>('overview');

  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, '');
    setUserId(sanitized);
  };

  const fetchUserData = async () => {
    const cleanUserId = userId.trim();

    if (!cleanUserId || !/^\d{17,20}$/.test(cleanUserId)) {
      setError('Please enter a valid 17 to 20 digit Discord User ID.');
      return;
    }

    if (!captchaToken) {
      setError('Please complete the CAPTCHA check.');
      return;
    }

    setLoading(true);
    setError(null);
    setUserData(null);
    setRawJson(null);

    try {
      const response = await fetch('/api/discord-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: cleanUserId,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user data.');
      }

      setUserData(data);
      setRawJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data.');
    } finally {
      setLoading(false);
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  };

  const parseUserFlags = (flagsNum: number = 0) => {
    const FLAG_MAP: Record<number, { name: string; bit: number }> = {
      [1 << 0]: { name: 'Discord Employee', bit: 0 },
      [1 << 1]: { name: 'Partnered Server Owner', bit: 1 },
      [1 << 2]: { name: 'HypeSquad Events Member', bit: 2 },
      [1 << 3]: { name: 'Bug Hunter Level 1', bit: 3 },
      [1 << 6]: { name: 'House Bravery (HypeSquad)', bit: 6 },
      [1 << 7]: { name: 'House Brilliance (HypeSquad)', bit: 7 },
      [1 << 8]: { name: 'House Balance (HypeSquad)', bit: 8 },
      [1 << 9]: { name: 'Early Nitro Supporter', bit: 9 },
      [1 << 10]: { name: 'Team User', bit: 10 },
      [1 << 14]: { name: 'Bug Hunter Level 2', bit: 14 },
      [1 << 16]: { name: 'Verified Bot', bit: 16 },
      [1 << 17]: { name: 'Early Verified Bot Developer', bit: 17 },
      [1 << 18]: { name: 'Discord Certified Moderator', bit: 18 },
      [1 << 19]: { name: 'Bot Uses HTTP Interactions', bit: 19 },
      [1 << 22]: { name: 'Active Developer', bit: 22 },
    };

    const activeFlags: { name: string; bit: number; rawBitmask: number }[] = [];
    Object.entries(FLAG_MAP).forEach(([bit, info]) => {
      const bitVal = Number(bit);
      if ((flagsNum & bitVal) !== 0) {
        activeFlags.push({ ...info, rawBitmask: bitVal });
      }
    });

    return activeFlags;
  };

  const getAvatarUrl = (id: string, hash: string | null) => {
    if (!hash) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    const ext = hash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.${ext}?size=1024`;
  };

  const getBannerUrl = (id: string, hash: string | null) => {
    if (!hash) return null;
    const ext = hash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/banners/${id}/${hash}.${ext}?size=1024`;
  };

  const getClanBadgeUrl = (guildId?: string, badgeHash?: string) => {
    if (!guildId || !badgeHash) return null;
    return `https://cdn.discordapp.com/clan-badges/${guildId}/${badgeHash}.png`;
  };

  const getNameplateUrl = (assetPath?: string) => {
    if (!assetPath) return null;
    if (assetPath.startsWith('http')) return assetPath;
    const cleanPath = assetPath.replace(/\/$/, '');
    return `https://cdn.discordapp.com/assets/${cleanPath}/asset.png`;
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

  const getNitroType = (type?: number) => {
    switch (type) {
      case 1:
        return 'Nitro Classic';
      case 2:
        return 'Nitro Standard';
      case 3:
        return 'Nitro Basic';
      default:
        return 'None / Hidden';
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themeHex = userData?.banner_color
    ? userData.banner_color
    : userData?.accent_color
    ? `#${userData.accent_color.toString(16).padStart(6, '0')}`
    : '#5865F2';

  const snowflakeInfo = userData ? getCreationDate(userData.id) : null;
  const publicFlagsList = userData ? parseUserFlags(userData.public_flags || 0) : [];
  const flagsList = userData ? parseUserFlags(userData.flags || 0) : [];

  return (
    <div style={{ backgroundColor: '#0e0f11', minHeight: '100vh', color: '#dcddde', padding: '24px 16px', fontFamily: 'inherit' }}>
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
        
        <header style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
            Discord Profile Inspector
          </h1>
          <p style={{ fontSize: '13px', color: '#8e9297', marginTop: '6px', margin: 0 }}>
            Inspect full User object parameters, flags, badges, raw assets, and CDN sources.
          </p>
        </header>

        <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'end' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                Target User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={handleInputChange}
                maxLength={20}
                placeholder="e.g. 1254195552808206429"
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

            <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
              {siteKey ? (
                <HCaptcha
                  sitekey={siteKey}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  ref={captchaRef}
                  theme="dark"
                />
              ) : (
                <div style={{ color: '#f87171', fontSize: '12px' }}>
                  Missing <code>NEXT_PUBLIC_HCAPTCHA_SITE_KEY</code> variable.
                </div>
              )}
            </div>

            <button
              onClick={fetchUserData}
              disabled={loading || !captchaToken}
              style={{
                backgroundColor: loading || !captchaToken ? '#1c1d22' : '#9bf0be',
                color: loading || !captchaToken ? '#8e9297' : '#0e0f11',
                border: 'none',
                padding: '11px 16px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: loading || !captchaToken ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {loading ? 'Fetching User...' : 'Inspect User Object'}
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: '#2d1517', border: '1px solid #f87171', color: '#fca5a5', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', marginTop: '16px' }}>
              {error}
            </div>
          )}
        </div>

        {userData ? (
          <div>
            <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', borderRadius: '6px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <img
                src={getAvatarUrl(userData.id, userData.avatar)}
                alt="Avatar"
                style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#09090b', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {userData.global_name || userData.username}
                  </h2>
                  {userData.bot && (
                    <span style={{ backgroundColor: '#5865f2', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>BOT</span>
                  )}
                  {userData.system && (
                    <span style={{ backgroundColor: '#eb459e', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>SYSTEM</span>
                  )}
                  {userData.clan && (
                    <span style={{ backgroundColor: '#1c1d22', border: '1px solid #282a30', color: '#dcddde', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      [{userData.clan.tag}]
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#8e9297', marginTop: '4px' }}>
                  @{userData.username}{userData.discriminator !== '0' ? `#${userData.discriminator}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleCopy(userData.id)}
                  style={{ backgroundColor: '#1c1d22', border: '1px solid #282a30', color: '#dcddde', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {copied ? 'Copied ID' : 'Copy Snowflake ID'}
                </button>
              </div>
            </div>

            <div className="custom-scroll" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #1c1d22', marginBottom: '20px', overflowX: 'auto' }}>
              <button onClick={() => setActiveTab('overview')} className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>
                Overview & System Details
              </button>
              <button onClick={() => setActiveTab('cosmetics')} className={`tab-btn ${activeTab === 'cosmetics' ? 'active' : ''}`}>
                Collectibles & Cosmetics
              </button>
              <button onClick={() => setActiveTab('clan')} className={`tab-btn ${activeTab === 'clan' ? 'active' : ''}`}>
                Clan & Guild Identity
              </button>
              <button onClick={() => setActiveTab('assets')} className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}>
                Raw CDN URLs
              </button>
              <button onClick={() => setActiveTab('json')} className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}>
                Full JSON Object
              </button>
            </div>

            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="info-grid">
                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Snowflake ID</span>
                    <span style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>{userData.id}</span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Creation Date (UTC)</span>
                    <span style={{ fontSize: '13px', color: '#ffffff' }}>{snowflakeInfo?.formatted}</span>
                    <span style={{ fontSize: '11px', color: '#8e9297', display: 'block', marginTop: '2px' }}>Unix: {snowflakeInfo?.unix}</span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Nitro Premium Type</span>
                    <span style={{ fontSize: '13px', color: '#ffffff' }}>{getNitroType(userData.premium_type)}</span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Locale / Language</span>
                    <span style={{ fontSize: '13px', color: '#ffffff' }}>{userData.locale || 'Not Provided / Hidden'}</span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Two-Factor (2FA/MFA)</span>
                    <span style={{ fontSize: '13px', color: userData.mfa_enabled ? '#9bf0be' : '#ffffff' }}>
                      {userData.mfa_enabled !== undefined ? (userData.mfa_enabled ? 'Enabled' : 'Disabled') : 'Not Provided'}
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9297', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Verified Status</span>
                    <span style={{ fontSize: '13px', color: userData.verified ? '#9bf0be' : '#ffffff' }}>
                      {userData.verified !== undefined ? (userData.verified ? 'Verified Email' : 'Unverified') : 'Not Provided'}
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                    Public Flags Bitmask (Value: {userData.public_flags ?? 0})
                  </span>
                  {publicFlagsList.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                      {publicFlagsList.map((flag, idx) => (
                        <div key={idx} style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '8px 12px', borderRadius: '4px', fontSize: '12px' }}>
                          <span style={{ color: '#9bf0be', fontWeight: 600, display: 'block' }}>{flag.name}</span>
                          <span style={{ color: '#8e9297', fontSize: '10px', fontFamily: 'monospace' }}>Bit {flag.bit} (1 &lt;&lt; {flag.bit})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#8e9297', fontStyle: 'italic' }}>No public flag bitmask values active.</span>
                  )}
                </div>

                {userData.flags !== undefined && (
                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                      System User Flags Bitmask (Value: {userData.flags})
                    </span>
                    {flagsList.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                        {flagsList.map((flag, idx) => (
                          <div key={idx} style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '8px 12px', borderRadius: '4px', fontSize: '12px' }}>
                            <span style={{ color: '#9bf0be', fontWeight: 600, display: 'block' }}>{flag.name}</span>
                            <span style={{ color: '#8e9297', fontSize: '10px', fontFamily: 'monospace' }}>Bit {flag.bit} (1 &lt;&lt; {flag.bit})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#8e9297', fontStyle: 'italic' }}>No internal flags bitmask values active.</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cosmetics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                    Theme & Accent Properties
                  </span>
                  <div className="info-grid">
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: themeHex, border: '1px solid #282a30' }} />
                      <div>
                        <span style={{ fontSize: '11px', color: '#8e9297', display: 'block' }}>Accent Color Hex</span>
                        <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{themeHex}</span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '12px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#8e9297', display: 'block' }}>Raw Accent Color Integer</span>
                      <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{userData.accent_color ?? 'null'}</span>
                    </div>
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '12px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#8e9297', display: 'block' }}>Banner Hash</span>
                      <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{userData.banner || 'None'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                    Avatar Decoration Data
                  </span>
                  {userData.avatar_decoration_data ? (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <img
                        src={`https://cdn.discordapp.com/avatar-decoration-presets/${userData.avatar_decoration_data.asset}.png`}
                        alt="Avatar Decoration Asset"
                        style={{ width: '64px', height: '64px', backgroundColor: '#09090b', borderRadius: '6px', border: '1px solid #1c1d22', padding: '4px' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                        <div><span style={{ color: '#8e9297' }}>Asset Hash:</span> <code style={{ color: '#ffffff' }}>{userData.avatar_decoration_data.asset}</code></div>
                        <div><span style={{ color: '#8e9297' }}>SKU ID:</span> <code style={{ color: '#ffffff' }}>{userData.avatar_decoration_data.sku_id}</code></div>
                        <div><span style={{ color: '#8e9297' }}>Expiration:</span> <span style={{ color: '#ffffff' }}>{userData.avatar_decoration_data.expires_at || 'Permanent / Unlimited'}</span></div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#8e9297', fontStyle: 'italic' }}>No avatar decoration equipped.</span>
                  )}
                </div>

                <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                    Nameplate Collectibles
                  </span>
                  {userData.collectibles?.nameplate ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {getNameplateUrl(userData.collectibles.nameplate.asset) && (
                        <div style={{ backgroundColor: '#09090b', padding: '8px', borderRadius: '4px', border: '1px solid #1c1d22', width: 'fit-content' }}>
                          <img
                            src={getNameplateUrl(userData.collectibles.nameplate.asset)!}
                            alt="Nameplate Preview"
                            style={{ maxHeight: '48px', objectFit: 'contain' }}
                          />
                        </div>
                      )}
                      <div className="info-grid">
                        <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Label / Title</span>
                          <span style={{ fontSize: '12px', color: '#fff' }}>{userData.collectibles.nameplate.label || 'Unlabeled'}</span>
                        </div>
                        <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>SKU ID</span>
                          <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{userData.collectibles.nameplate.sku_id}</span>
                        </div>
                        <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Asset Path</span>
                          <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{userData.collectibles.nameplate.asset}</span>
                        </div>
                        <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Color Palette</span>
                          <span style={{ fontSize: '12px', color: '#fff' }}>{userData.collectibles.nameplate.palette || 'Default'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#8e9297', fontStyle: 'italic' }}>No profile nameplate collectible equipped.</span>
                  )}
                </div>

                <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                    Display Name Styling Parameters
                  </span>
                  {userData.display_name_styles ? (
                    <div className="info-grid">
                      <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Font ID</span>
                        <span style={{ fontSize: '12px', color: '#fff' }}>{userData.display_name_styles.font_id ?? 'None'}</span>
                      </div>
                      <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Effect ID</span>
                        <span style={{ fontSize: '12px', color: '#fff' }}>{userData.display_name_styles.effect_id ?? 'None'}</span>
                      </div>
                      <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Gradient Palette Ints</span>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {userData.display_name_styles.colors?.map((c, i) => (
                            <span key={i} style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9bf0be', backgroundColor: '#121316', padding: '2px 6px', borderRadius: '3px' }}>
                              #{c.toString(16).padStart(6, '0')}
                            </span>
                          )) || 'None'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#8e9297', fontStyle: 'italic' }}>No custom display name styling values present.</span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'clan' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                    Clan / Guild Identity Data
                  </span>
                  {userData.clan ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {getClanBadgeUrl(userData.clan.identity_guild_id, userData.clan.badge) && (
                          <img
                            src={getClanBadgeUrl(userData.clan.identity_guild_id, userData.clan.badge)!}
                            alt="Clan Badge"
                            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                          />
                        )}
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>[{userData.clan.tag}]</span>
                      </div>

                      <div className="info-grid">
                        <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Identity Guild ID</span>
                          <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{userData.clan.identity_guild_id}</span>
                        </div>
                        <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Badge Hash</span>
                          <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{userData.clan.badge}</span>
                        </div>
                        <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Identity Enabled</span>
                          <span style={{ fontSize: '12px', color: userData.clan.identity_enabled ? '#9bf0be' : '#ffffff' }}>
                            {userData.clan.identity_enabled ? 'True' : 'False'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#8e9297', fontStyle: 'italic' }}>User is not currently displaying a Guild/Clan tag identity.</span>
                  )}
                </div>

                {userData.primary_guild && (
                  <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                      Primary Guild Association
                    </span>
                    <div className="info-grid">
                      <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Primary Guild ID</span>
                        <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{userData.primary_guild.identity_guild_id}</span>
                      </div>
                      <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#8e9297', display: 'block' }}>Tag</span>
                        <span style={{ fontSize: '12px', color: '#fff' }}>{userData.primary_guild.tag || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assets' && (
              <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', padding: '16px', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                  Direct Asset Links
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px 12px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#8e9297', display: 'block', marginBottom: '2px' }}>Avatar CDN (1024px)</span>
                    <a href={getAvatarUrl(userData.id, userData.avatar)} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#38bdf8', wordBreak: 'break-all', textDecoration: 'none' }}>
                      {getAvatarUrl(userData.id, userData.avatar)}
                    </a>
                  </div>

                  {getBannerUrl(userData.id, userData.banner) && (
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px 12px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#8e9297', display: 'block', marginBottom: '2px' }}>Banner CDN (1024px)</span>
                      <a href={getBannerUrl(userData.id, userData.banner)!} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#38bdf8', wordBreak: 'break-all', textDecoration: 'none' }}>
                        {getBannerUrl(userData.id, userData.banner)}
                      </a>
                    </div>
                  )}

                  {userData.collectibles?.nameplate && getNameplateUrl(userData.collectibles.nameplate.asset) && (
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px 12px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#8e9297', display: 'block', marginBottom: '2px' }}>Nameplate CDN Asset</span>
                      <a href={getNameplateUrl(userData.collectibles.nameplate.asset)!} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#38bdf8', wordBreak: 'break-all', textDecoration: 'none' }}>
                        {getNameplateUrl(userData.collectibles.nameplate.asset)}
                      </a>
                    </div>
                  )}

                  {userData.clan && getClanBadgeUrl(userData.clan.identity_guild_id, userData.clan.badge) && (
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #1c1d22', padding: '10px 12px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#8e9297', display: 'block', marginBottom: '2px' }}>Clan Badge CDN</span>
                      <a href={getClanBadgeUrl(userData.clan.identity_guild_id, userData.clan.badge)!} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#38bdf8', wordBreak: 'break-all', textDecoration: 'none' }}>
                        {getClanBadgeUrl(userData.clan.identity_guild_id, userData.clan.badge)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'json' && (
              <div style={{ backgroundColor: '#121316', border: '1px solid #1c1d22', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Unfiltered API Response Body</span>
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
            Complete CAPTCHA verification and submit a Snowflake User ID above to retrieve data.
          </div>
        )}

      </div>
    </div>
  );
}