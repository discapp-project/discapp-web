'use client';

import { useState } from 'react';
import { Search, Calendar, Clock, Cpu, Hash, Layers, AlertCircle } from 'lucide-react';

const DISCORD_EPOCH = 1420070400000n; // 2015-01-01T00:00:00.000Z

interface DecodedSnowflake {
  id: string;
  timestamp: Date;
  workerId: number;
  processId: number;
  sequence: number;
  unixMs: number;
}

export default function SnowflakeDecoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DecodedSnowflake | null>(null);
  const [error, setError] = useState('');

  const decodeSnowflake = () => {
    setError('');
    const cleanInput = input.trim();

    if (!cleanInput) {
      setError('Please enter a Discord ID or Snowflake.');
      setResult(null);
      return;
    }

    if (!/^\d{17,20}$/.test(cleanInput)) {
      setError('Invalid Snowflake format. Discord IDs are numeric and typically 17 to 20 digits long.');
      setResult(null);
      return;
    }

    try {
      const snowflake = BigInt(cleanInput);

      const timestampMs = Number((snowflake >> 22n) + DISCORD_EPOCH);
      const workerId = Number((snowflake & 0x3E0000n) >> 17n);
      const processId = Number((snowflake & 0x1F000n) >> 12n);
      const sequence = Number(snowflake & 0xFFFn);

      const timestamp = new Date(timestampMs);

      if (timestampMs < DISCORD_EPOCH || isNaN(timestamp.getTime())) {
        setError('Decoded date falls outside the valid Discord timeframe.');
        setResult(null);
        return;
      }

      setResult({
        id: cleanInput,
        timestamp,
        workerId,
        processId,
        sequence,
        unixMs: timestampMs,
      });
    } catch {
      setError('Failed to parse Snowflake ID.');
      setResult(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111214', color: '#dbdee1', padding: '32px 24px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', margin: '0' }}>
        
        <header style={{ marginBottom: '28px', textAlign: 'left' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Discord Snowflake Decoder
          </h1>
          <p style={{ color: '#80848e', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
            Inspect raw Discord IDs (Snowflakes) to extract creation dates, worker nodes, and process metrics.
          </p>
        </header>

        <div style={{ backgroundColor: '#1c1d22', borderRadius: '8px', border: '1px solid #2b2d31', padding: '20px', marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#b5bac1', textTransform: 'uppercase', marginBottom: '8px' }}>
            Discord ID or Snowflake
          </label>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && decodeSnowflake()}
              placeholder="e.g. 123456789012345678"
              style={{
                flex: '1 1 280px',
                backgroundColor: '#111214',
                border: '1px solid #35363c',
                borderRadius: '4px',
                padding: '12px 14px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={decodeSnowflake}
              style={{
                backgroundColor: '#9bf0be',
                color: '#111214',
                border: 'none',
                borderRadius: '4px',
                padding: '0 24px',
                minHeight: '44px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flex: '0 0 auto'
              }}
            >
              <Search size={16} /> Decode ID
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fa5252', fontSize: '13px', marginTop: '12px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        {result ? (
          <div style={{ backgroundColor: '#1c1d22', borderRadius: '8px', border: '1px solid #2b2d31', padding: '24px' }}>
            <div style={{ borderBottom: '1px solid #2b2d31', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#80848e', fontWeight: '600' }}>DECODED SNOWFLAKE</span>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '2px 0 0 0' }}>{result.id}</h2>
              </div>
              <span style={{ backgroundColor: '#111214', border: '1px solid #35363c', color: '#9bf0be', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '4px' }}>
                Snowflake Found!
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              
              <div style={{ backgroundColor: '#111214', borderRadius: '6px', border: '1px solid #2b2d31', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#80848e', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Calendar size={14} style={{ color: '#9bf0be' }} /> Date Created
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
                  {result.timestamp.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div style={{ backgroundColor: '#111214', borderRadius: '6px', border: '1px solid #2b2d31', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#80848e', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Clock size={14} style={{ color: '#9bf0be' }} /> Exact Time
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
                  {result.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (Local)
                </div>
              </div>

              <div style={{ backgroundColor: '#111214', borderRadius: '6px', border: '1px solid #2b2d31', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#80848e', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Hash size={14} style={{ color: '#9bf0be' }} /> Unix Timestamp
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
                  {result.unixMs} ms
                </div>
              </div>

              <div style={{ backgroundColor: '#111214', borderRadius: '6px', border: '1px solid #2b2d31', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#80848e', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Cpu size={14} style={{ color: '#9bf0be' }} /> Worker / Process ID
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
                  Worker {result.workerId} &bull; Process {result.processId}
                </div>
              </div>

              <div style={{ backgroundColor: '#111214', borderRadius: '6px', border: '1px solid #2b2d31', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#80848e', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Layers size={14} style={{ color: '#9bf0be' }} /> Sequence Number
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
                  {result.sequence}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#16171b',
            borderRadius: '8px',
            border: '1px dashed #2b2d31',
            padding: '48px 20px',
            textAlign: 'center',
            color: '#80848e',
            fontSize: '14px'
          }}>
            Submit a Discord ID or Snowflake above to retrieve creation details directly.
          </div>
        )}

      </div>
    </div>
  );
}