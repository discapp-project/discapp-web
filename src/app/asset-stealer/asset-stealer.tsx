'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Download, Image as ImageIcon, AlertCircle, HelpCircle, 
  Laptop, Smartphone, RotateCcw, FlipHorizontal, FlipVertical 
} from 'lucide-react';

interface AssetData {
  id: string;
  name: string;
  isAnimated: boolean;
  isSticker: boolean;
  rawUrl: string;
}

export default function AssetStealer() {
  const [input, setInput] = useState('');
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [error, setError] = useState('');
  
  // Customization & Canvas Transformation Controls
  const [targetSize, setTargetSize] = useState<number>(128);
  const [zoom, setZoom] = useState<number>(1); // 0.2x (Zoom out) to 2.5x (Zoom in)
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const parseInput = () => {
    setError('');
    const cleanInput = input.trim();

    if (!cleanInput) {
      setError('Please paste a Discord emoji tag, sticker link, or asset ID.');
      return;
    }

    // 1. Custom Emoji Tag (<:name:id> or <a:name:id>)
    const emojiMatch = cleanInput.match(/<a?:([a-zA-Z0-9_]+):(\d+)>/);
    if (emojiMatch) {
      const name = emojiMatch[1];
      const id = emojiMatch[2];
      const isAnimated = cleanInput.startsWith('<a:');
      const ext = isAnimated ? 'gif' : 'png';
      
      setAsset({
        id,
        name,
        isAnimated,
        isSticker: false,
        rawUrl: `https://cdn.discordapp.com/emojis/${id}.${ext}?size=256`
      });
      setTargetSize(128);
      resetTransformations();
      return;
    }

    // 2. Direct Discord CDN Link
    const urlMatch = cleanInput.match(/cdn\.discordapp\.com\/(emojis|stickers)\/(\d+)\.(png|gif|webp|json)/);
    if (urlMatch) {
      const type = urlMatch[1];
      const id = urlMatch[2];
      const ext = urlMatch[3];
      const isSticker = type === 'stickers';
      const isAnimated = ext === 'gif';

      setAsset({
        id,
        name: `${isSticker ? 'sticker' : 'emoji'}_${id}`,
        isAnimated,
        isSticker,
        rawUrl: `https://cdn.discordapp.com/${type}/${id}.${ext}`
      });
      setTargetSize(isSticker ? 320 : 128);
      resetTransformations();
      return;
    }

    // 3. Raw Asset ID
    if (/^\d+$/.test(cleanInput)) {
      setAsset({
        id: cleanInput,
        name: `asset_${cleanInput}`,
        isAnimated: false,
        isSticker: false,
        rawUrl: `https://cdn.discordapp.com/emojis/${cleanInput}.png?size=256`
      });
      setTargetSize(128);
      resetTransformations();
      return;
    }

    setError('Could not parse asset. Ensure you copy and paste the raw emoji message from Discord.');
  };

  const resetTransformations = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  useEffect(() => {
    if (!asset || asset.isAnimated || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = asset.rawUrl;

    img.onload = () => {
      canvas.width = targetSize;
      canvas.height = targetSize;

      ctx.clearRect(0, 0, targetSize, targetSize);
      ctx.save();

      // Translate origin to center of canvas for transformations
      const center = targetSize / 2;
      ctx.translate(center + offsetX, center + offsetY);

      // Apply flips and rotation
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.rotate((rotation * Math.PI) / 180);

      // Calculate zoomed dimensions
      const drawWidth = targetSize * zoom;
      const drawHeight = targetSize * zoom;

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    };
  }, [asset, targetSize, zoom, offsetX, offsetY, rotation, flipH, flipV]);

  const handleDownload = () => {
    if (!asset) return;

    // For animated GIFs or direct downloads without edits
    if (asset.isAnimated) {
      const a = document.createElement('a');
      a.href = asset.rawUrl;
      a.download = `${asset.name}.gif`;
      a.target = '_blank';
      a.click();
      return;
    }

    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL(`image/${format}`);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${asset.name}_edited.${format}`;
      a.click();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111214', color: '#dbdee1', padding: '32px 16px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>

        {/* Page Header */}
        <header style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Asset Stealer
          </h1>
          <p style={{ color: '#80848e', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
            Extract high-res emojis and stickers from any server, zoom, reposition, flip, and export instantly.
          </p>
        </header>

        {/* Input Container */}
        <div style={{ backgroundColor: '#1c1d22', borderRadius: '8px', border: '1px solid #2b2d31', padding: '20px', marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#b5bac1', textTransform: 'uppercase', marginBottom: '8px' }}>
            Emoji, Sticker, or Asset ID
          </label>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. <:pepe:123456789012345678> or CDN URL"
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
              onClick={parseInput}
              style={{
                backgroundColor: '#9bf0be',
                color: '#111214',
                border: 'none',
                borderRadius: '4px',
                padding: '0 20px',
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
              <ImageIcon size={16} /> Steal Asset
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fa5252', fontSize: '13px', marginTop: '12px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Dynamic Display / Controls */}
        {asset ? (
          <div style={{ backgroundColor: '#1c1d22', borderRadius: '8px', border: '1px solid #2b2d31', padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px', alignItems: 'start' }}>
              
              {/* Image Preview Canvas */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '220px',
                  height: '220px',
                  backgroundColor: '#111214',
                  borderRadius: '8px',
                  border: '1px dashed #35363c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundImage: 'radial-gradient(#2b2d31 1px, transparent 1px)',
                  backgroundSize: '12px 12px'
                }}>
                  {asset.isAnimated ? (
                    <img src={asset.rawUrl} alt={asset.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                  )}
                </div>

                <span style={{ fontSize: '12px', color: '#80848e' }}>
                  {asset.isAnimated ? 'Animated GIF' : `${targetSize}x${targetSize} px`}
                </span>

                {!asset.isAnimated && (
                  <button
                    onClick={resetTransformations}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #35363c',
                      color: '#80848e',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RotateCcw size={12} /> Reset Canvas
                  </button>
                )}
              </div>

              {/* Asset Editing Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px 0' }}>{asset.name}</h3>
                  <p style={{ fontSize: '12px', color: '#80848e', margin: 0 }}>ID: {asset.id}</p>
                </div>

                {!asset.isAnimated && (
                  <>
                    {/* Target Resolution */}
                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#b5bac1', marginBottom: '6px' }}>
                        <span>Target Resolution</span>
                        <span>{targetSize}px</span>
                      </label>
                      <select
                        value={targetSize}
                        onChange={(e) => setTargetSize(Number(e.target.value))}
                        style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #35363c', color: '#ffffff', padding: '8px', borderRadius: '4px', fontSize: '13px' }}
                      >
                        <option value={128}>128 x 128 (Discord Emoji Standard)</option>
                        <option value={320}>320 x 320 (Discord Sticker Standard)</option>
                        <option value={256}>256 x 256</option>
                        <option value={512}>512 x 512 (High Res)</option>
                      </select>
                    </div>

                    {/* Zoom In / Out */}
                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#b5bac1', marginBottom: '6px' }}>
                        <span>Zoom</span>
                        <span>{Math.round(zoom * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#9bf0be' }}
                      />
                    </div>

                    {/* Position Adjustments (X & Y) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#b5bac1', marginBottom: '6px' }}>
                          Position X ({offsetX}px)
                        </label>
                        <input
                          type="range"
                          min={-targetSize / 2}
                          max={targetSize / 2}
                          value={offsetX}
                          onChange={(e) => setOffsetX(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#9bf0be' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#b5bac1', marginBottom: '6px' }}>
                          Position Y ({offsetY}px)
                        </label>
                        <input
                          type="range"
                          min={-targetSize / 2}
                          max={targetSize / 2}
                          value={offsetY}
                          onChange={(e) => setOffsetY(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#9bf0be' }}
                        />
                      </div>
                    </div>

                    {/* Rotation & Flips */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#b5bac1', marginBottom: '6px' }}>
                          Rotate ({rotation}°)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#9bf0be' }}
                        />
                      </div>

                      <button
                        onClick={() => setFlipH(!flipH)}
                        title="Flip Horizontally"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: '1px solid #35363c',
                          backgroundColor: flipH ? '#9bf0be' : '#111214',
                          color: flipH ? '#111214' : '#dbdee1',
                          cursor: 'pointer'
                        }}
                      >
                        <FlipHorizontal size={16} />
                      </button>

                      <button
                        onClick={() => setFlipV(!flipV)}
                        title="Flip Vertically"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: '1px solid #35363c',
                          backgroundColor: flipV ? '#9bf0be' : '#111214',
                          color: flipV ? '#111214' : '#dbdee1',
                          cursor: 'pointer'
                        }}
                      >
                        <FlipVertical size={16} />
                      </button>
                    </div>

                    {/* Export Format Toggle */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#b5bac1', marginBottom: '6px' }}>
                        Export Format
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {(['png', 'webp', 'jpeg'] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setFormat(fmt)}
                            style={{
                              flex: 1,
                              padding: '6px 0',
                              fontSize: '12px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              borderRadius: '4px',
                              border: '1px solid #35363c',
                              backgroundColor: format === fmt ? '#9bf0be' : '#111214',
                              color: format === fmt ? '#111214' : '#dbdee1',
                              cursor: 'pointer'
                            }}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleDownload}
                  style={{
                    width: '100%',
                    backgroundColor: '#9bf0be',
                    color: '#111214',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '12px 0',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '4px'
                  }}
                >
                  <Download size={16} /> Download Asset
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* Empty Placeholder Box */
          <div style={{
            backgroundColor: '#16171b',
            borderRadius: '8px',
            border: '1px dashed #2b2d31',
            padding: '48px 20px',
            textAlign: 'center',
            color: '#80848e',
            fontSize: '14px',
            marginBottom: '32px'
          }}>
            Submit a Discord emoji tag, CDN URL, or ID above to render and download the asset.
          </div>
        )}

        {/* Instructions */}
        <div style={{ borderTop: '1px solid #1e2024', paddingTop: '28px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
            <HelpCircle size={18} style={{ color: '#9bf0be' }} /> How to copy custom emojis
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Desktop */}
            <div style={{ backgroundColor: '#1c1d22', border: '1px solid #2b2d31', borderRadius: '6px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9bf0be', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                <Laptop size={14} /> PC / Desktop App
              </div>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#dbdee1', lineHeight: '1.6' }}>
                <li>Send the emoji in any text channel.</li>
                <li>Add a backslash <code style={{ backgroundColor: '#111214', padding: '2px 4px', borderRadius: '3px', color: '#9bf0be' }}>\</code> right before the emoji and press Enter.</li>
                <li>Copy the resulting formatted text (e.g., <code style={{ backgroundColor: '#111214', padding: '2px 4px', borderRadius: '3px' }}>&lt;:pepe:123456...&gt;</code>).</li>
                <li>Paste it into the input box above.</li>
              </ol>
            </div>

            {/* Mobile */}
            <div style={{ backgroundColor: '#1c1d22', border: '1px solid #2b2d31', borderRadius: '6px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9bf0be', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                <Smartphone size={14} /> Mobile App (iOS / Android)
              </div>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#dbdee1', lineHeight: '1.6' }}>
                <li>Send the emoji in a channel or DM.</li>
                <li>Tap and hold the sent message, then tap <strong>Copy Text</strong>.</li>
                <li>Paste the copied raw tag directly into the input above.</li>
                <li>Alternatively, long press the emoji image directly and tap <strong>Copy Image Link</strong>.</li>
              </ol>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}