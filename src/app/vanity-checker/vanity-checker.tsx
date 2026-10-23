'use client';

import { useState } from 'react';

export default function VanityChecker() {
  const [vanityUrl, setVanityUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'available' | 'taken' | 'invalid' | 'error'>('idle');
  const [resultMessage, setResultMessage] = useState('');

  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/^(https?:\/\/)?(www\.)?(discord\.gg\/|discord\.com\/invite\/)/i, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();
  };

  const checkVanity = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = sanitizeInput(vanityUrl);

    if (!cleanUrl) {
      setStatus('invalid');
      setResultMessage('Please enter a valid Discord invite code or vanity URL.');
      return;
    }

    setStatus('loading');
    setResultMessage('');

    try {
      const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(cleanUrl)}`);

      if (res.status === 200) {
        setStatus('taken');
        setResultMessage(`"discord.gg/${cleanUrl}" is already taken.`);
      } else if (res.status === 404) {
        setStatus('available');
        setResultMessage(`"discord.gg/${cleanUrl}" is available!`);
      } else {
        setStatus('error');
        setResultMessage('Unable to verify vanity URL status. Please try again later.');
      }
    } catch {
      setStatus('error');
      setResultMessage('An error occurred while attempting to reach the Discord API.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111214', color: '#dbdee1', padding: '24px 16px', fontFamily: 'inherit' }}>
      <style>{`
        .input-row {
          display: flex;
          flex-direction: row;
          gap: 12px;
          align-items: center;
        }
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: #9bf0be;
          color: #090a0c;
          font-weight: 700;
          padding: 12px 20px;
          border-radius: 6px;
          border: none;
          font-size: 14px;
          white-space: nowrap;
          width: auto;
        }
        @media (max-width: 640px) {
          .input-row {
            flex-direction: column;
            align-items: stretch;
          }
          .submit-btn {
            width: 100%;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '100%' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.02em', textAlign: 'left' }}>
          Discord Vanity URL Checker
        </h1>
        <p style={{ color: '#80848e', fontSize: '14px', marginBottom: '24px', textAlign: 'left', lineHeight: '1.4' }}>
          Check if a custom invite code or vanity URL is currently available.
        </p>

        <div style={{ backgroundColor: '#111214', borderRadius: '8px', border: '1px solid #1e2024', padding: '16px' }}>
          <form onSubmit={checkVanity} style={{ marginBottom: status !== 'idle' ? '16px' : '0' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#ffffff', marginBottom: '10px', letterSpacing: '0.04em', textAlign: 'left' }}>
              Invite Link or Code
            </label>
            <div className="input-row">
              <div style={{ flex: 1, backgroundColor: '#090a0c', borderRadius: '6px', border: '1px solid #1e2024', padding: '12px 16px' }}>
                <input
                  type="text"
                  value={vanityUrl}
                  onChange={(e) => setVanityUrl(e.target.value)}
                  placeholder="e.g. discord.gg/discord-developers or discord-developers"
                  style={{ width: '100%', backgroundColor: 'transparent', color: '#f2f3f5', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'monospace' }}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="submit-btn"
                style={{ cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.8 : 1 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                {status === 'loading' ? 'Checking...' : 'Check Availability'}
              </button>
            </div>
          </form>

          {status === 'loading' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#80848e', fontSize: '14px', paddingTop: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                <path d="M12 2 a10 10 0 0 1 10 10"></path>
              </svg>
              <span>Querying Discord API...</span>
            </div>
          )}

          {status !== 'idle' && status !== 'loading' && (
            <div style={{ paddingTop: '8px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: status === 'available' ? 'rgba(87, 242, 135, 0.08)' : status === 'taken' ? 'rgba(237, 66, 69, 0.08)' : 'rgba(254, 231, 92, 0.08)',
                  border: `1px solid ${status === 'available' ? 'rgba(87, 242, 135, 0.25)' : status === 'taken' ? 'rgba(237, 66, 69, 0.25)' : 'rgba(254, 231, 92, 0.25)'}`,
                  maxWidth: '100%',
                  wordBreak: 'break-word'
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    backgroundColor: status === 'available' ? '#57f287' : status === 'taken' ? '#ed4245' : '#fee75c'
                  }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: status === 'available' ? '#57f287' : status === 'taken' ? '#ed4245' : '#fee75c'
                  }}
                >
                  {resultMessage}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}