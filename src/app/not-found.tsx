'use client';

import Link from 'next/link';
import { Home, RefreshCw, Compass, Ghost, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#111214',
        color: '#dbdee1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Ghost size={32} style={{ color: '#9bf0be', marginRight: '8px' }} aria-hidden="true" />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}
        >
          Page Not Found
        </h1>

        {/* Humorous Description */}
        <p
          style={{
            color: '#80848e',
            fontSize: '15px',
            lineHeight: '1.6',
            margin: '0 0 32px 0',
          }}
        >
          The page you were looking for went missing...maybe the cats took it...idk man
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              backgroundColor: '#9bf0be',
              color: '#111214',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Home size={16} /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}