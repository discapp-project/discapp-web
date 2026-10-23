'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Copy, Check, Palette, Sparkles, Search, MessageSquare, ShieldCheck, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface GradientPreset {
  id: string;
  name: string;
  category: string;
  startColor: string;
  endColor: string;
}

const PRESET_GRADIENTS: GradientPreset[] = [
  { id: '1', name: 'Sunset Glow', category: 'Warm', startColor: '#FF4D4D', endColor: '#FF9933' },
  { id: '2', name: 'Crimson Flame', category: 'Warm', startColor: '#FF1A1A', endColor: '#990000' },
  { id: '3', name: 'Peach Coral', category: 'Warm', startColor: '#FFADE6', endColor: '#FF7559' },
  { id: '4', name: 'Amber Fire', category: 'Warm', startColor: '#FFC300', endColor: '#FF6600' },
  { id: '5', name: 'Salmon Rise', category: 'Warm', startColor: '#FF8080', endColor: '#CC0000' },
  { id: '6', name: 'Terracotta', category: 'Warm', startColor: '#FF7373', endColor: '#99451A' },
  { id: '7', name: 'Rose Gold', category: 'Warm', startColor: '#FFE4E8', endColor: '#FF577A' },
  { id: '8', name: 'Burnt Copper', category: 'Warm', startColor: '#FFAA60', endColor: '#803014' },

  { id: '9', name: 'Cyber Neon', category: 'Neon', startColor: '#FF1A1A', endColor: '#5C1AFF' },
  { id: '10', name: 'Sakura Pink', category: 'Pink', startColor: '#FF99BF', endColor: '#FF3380' },
  { id: '11', name: 'Neon Fuchsia', category: 'Pink', startColor: '#FF0299', endColor: '#B800FF' },
  { id: '12', name: 'Bubblegum', category: 'Pink', startColor: '#FFE5F9', endColor: '#FF66D9' },
  { id: '13', name: 'Electric Magenta', category: 'Pink', startColor: '#FF33CC', endColor: '#660044' },
  { id: '14', name: 'Hot Punch', category: 'Pink', startColor: '#FF00A6', endColor: '#990066' },
  { id: '15', name: 'Velvet Magenta', category: 'Pink', startColor: '#E6006B', endColor: '#330017' },

  { id: '16', name: 'Toxic Lime', category: 'Green', startColor: '#9EFF33', endColor: '#00E600' },
  { id: '17', name: 'Emerald Jade', category: 'Green', startColor: '#00FF99', endColor: '#00664D' },
  { id: '18', name: 'Mint Breeze', category: 'Green', startColor: '#E8FFF5', endColor: '#46FFB3' },
  { id: '19', name: 'Forest Moss', category: 'Green', startColor: '#66CC00', endColor: '#004D00' },
  { id: '20', name: 'Sage Leaf', category: 'Green', startColor: '#DEDEDD', endColor: '#3D7F40' },
  { id: '21', name: 'Radioactive Green', category: 'Green', startColor: '#CCFF00', endColor: '#338000' },
  { id: '22', name: 'Bio Lime', category: 'Green', startColor: '#E8FFCC', endColor: '#1F5E00' },
  { id: '23', name: 'Deep Evergreen', category: 'Green', startColor: '#008800', endColor: '#001A00' },

  { id: '24', name: 'Deep Ocean', category: 'Blue', startColor: '#008DFF', endColor: '#002E99' },
  { id: '25', name: 'Sky High', category: 'Cyan', startColor: '#E5F6FF', endColor: '#33C2FF' },
  { id: '26', name: 'Teal Lagoon', category: 'Cyan', startColor: '#00FFFF', endColor: '#008386' },
  { id: '27', name: 'Electric Cyan', category: 'Cyan', startColor: '#99FFED', endColor: '#006699' },
  { id: '28', name: 'Abyssal Blue', category: 'Blue', startColor: '#3366FF', endColor: '#000A1F' },
  { id: '29', name: 'Aqua Aura', category: 'Cyan', startColor: '#E0FFF5', endColor: '#00CCA3' },
  { id: '30', name: 'Iceberg', category: 'Cyan', startColor: '#E5FFFF', endColor: '#004D4D' },
  { id: '31', name: 'Royal Sapphire', category: 'Blue', startColor: '#99B3FF', endColor: '#001F66' },

  { id: '32', name: 'Discord Blurple', category: 'Purple', startColor: '#5865F2', endColor: '#7A33FF' },
  { id: '33', name: 'Midnight Violet', category: 'Dark', startColor: '#4700CC', endColor: '#1A003D' },
  { id: '34', name: 'Royal Indigo', category: 'Purple', startColor: '#B993FF', endColor: '#330099' },
  { id: '35', name: 'Amethyst', category: 'Purple', startColor: '#E6CCFF', endColor: '#8C00FF' },
  { id: '36', name: 'Lavender Mist', category: 'Purple', startColor: '#F5E5FF', endColor: '#7300CC' },
  { id: '37', name: 'Deep Nebula', category: 'Dark', startColor: '#7A00CC', endColor: '#120026' },
  { id: '38', name: 'Plum Magic', category: 'Purple', startColor: '#CC80FF', endColor: '#26004D' },

  { id: '39', name: 'Solar Flare', category: 'Warm', startColor: '#FFF566', endColor: '#FF6600' },
  { id: '40', name: 'Pure Gold', category: 'Warm', startColor: '#FFF8E1', endColor: '#E6AC00' },
  { id: '41', name: 'Khaki Sunset', category: 'Warm', startColor: '#F7F1E3', endColor: '#80601A' },
  { id: '42', name: 'Lemon Drop', category: 'Warm', startColor: '#FFFD00', endColor: '#CC9900' },

  { id: '43', name: 'Warm Mocha', category: 'Dark', startColor: '#F5ECE3', endColor: '#3D220F' },
  { id: '44', name: 'Desert Sand', category: 'Warm', startColor: '#FFF5E6', endColor: '#B88657' },
  { id: '45', name: 'Bronze Age', category: 'Warm', startColor: '#FFE9D9', endColor: '#5C220D' },

  { id: '46', name: 'Silver Smoke', category: 'Dark', startColor: '#F2F2F2', endColor: '#8C8C8C' },
  { id: '47', name: 'Stealth Graphite', category: 'Dark', startColor: '#B3B3B3', endColor: '#262626' },
  { id: '48', name: 'Void Black', category: 'Dark', startColor: '#666666', endColor: '#000000' },
  { id: '49', name: 'Platinum', category: 'Dark', startColor: '#FFFFFF', endColor: '#4D4D4D' },
];

const ITEMS_PER_PAGE = 12;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return null;
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return Infinity;
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

export default function GradientFinder() {
  const [selectedGradient, setSelectedGradient] = useState<GradientPreset>(PRESET_GRADIENTS[0]);
  const [customStart, setCustomStart] = useState('#FF4D4D');
  const [customEnd, setCustomEnd] = useState('#FF9933');
  const [searchHex, setSearchHex] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const cssGradientString = `linear-gradient(90deg, ${customStart}, ${customEnd})`;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchHex, activeCategory]);

  const filteredGradients = useMemo(() => {
    let list = PRESET_GRADIENTS;

    if (activeCategory !== 'All') {
      list = list.filter((g) => g.category === activeCategory);
    }

    if (searchHex.trim().length >= 3) {
      const cleanSearch = searchHex.startsWith('#') ? searchHex : `#${searchHex}`;
      if (/^#[0-9A-Fa-f]{6}$/.test(cleanSearch)) {
        return [...list].sort((a, b) => {
          const distA = Math.min(colorDistance(cleanSearch, a.startColor), colorDistance(cleanSearch, a.endColor));
          const distB = Math.min(colorDistance(cleanSearch, b.startColor), colorDistance(cleanSearch, b.endColor));
          return distA - distB;
        });
      }
    }

    return list;
  }, [searchHex, activeCategory]);

  const totalPages = Math.ceil(filteredGradients.length / ITEMS_PER_PAGE) || 1;
  const paginatedGradients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGradients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGradients, currentPage]);

  const handleSelectPreset = (preset: GradientPreset) => {
    setSelectedGradient(preset);
    setCustomStart(preset.startColor);
    setCustomEnd(preset.endColor);
  };

  const copyHexCodes = () => {
    navigator.clipboard.writeText(`Primary: ${customStart} | Secondary: ${customEnd}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = ['All', 'Warm', 'Neon', 'Green', 'Blue', 'Purple', 'Pink', 'Cyan', 'Dark'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111214', color: '#dbdee1', padding: '16px', fontFamily: 'inherit' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '20px', textAlign: 'left' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Discord Role Gradient Finder
          </h1>
          <p style={{ color: '#80848e', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
            Discover and preview lots of fun gradients for your roles and if we don't have the color you want, you can always customize it manually!
          </p>
        </header>

        <div style={{ backgroundColor: '#1c1d22', borderRadius: '8px', border: '1px solid #2b2d31', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#b5bac1', textTransform: 'uppercase', marginBottom: '6px' }}>
                Search Hex Color
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', color: '#80848e' }} />
                <input
                  type="text"
                  value={searchHex}
                  onChange={(e) => setSearchHex(e.target.value)}
                  placeholder="e.g. #FF4D4D or 008DFF"
                  style={{
                    width: '100%',
                    backgroundColor: '#111214',
                    border: '1px solid #35363c',
                    borderRadius: '4px',
                    padding: '10px 12px 10px 36px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#b5bac1', textTransform: 'uppercase', marginBottom: '6px' }}>
                Filter by Category
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      backgroundColor: activeCategory === cat ? '#9bf0be' : '#111214',
                      color: activeCategory === cat ? '#111214' : '#dbdee1',
                      border: '1px solid #35363c',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ backgroundColor: '#1c1d22', borderRadius: '8px', border: '1px solid #2b2d31', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#b5bac1', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Preview
              </div>

              <div style={{ backgroundColor: '#313338', borderRadius: '6px', padding: '12px', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span 
                      style={{ 
                        fontWeight: '700', 
                        fontSize: '14px',
                        backgroundImage: cssGradientString,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: customStart,
                        WebkitTextFillColor: 'transparent',
                        display: 'inline',
                        wordBreak: 'break-word'
                      }}
                    >
                      Cool Preview Name
                    </span>
                    <span style={{ backgroundColor: '#5865F2', color: '#ffffff', fontSize: '10px', fontWeight: '700', padding: '1px 4px', borderRadius: '3px' }}>
                      SYSTEM
                    </span>
                    <span style={{ fontSize: '11px', color: '#949ba4' }}>Today at 4:20 PM</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#dbdee1' }}>
                    Here is how the gradient role should look like inside Discord!
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1c1d22', borderRadius: '8px', border: '1px solid #2b2d31', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#b5bac1', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Customize colors further to make it your own!
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      style={{ width: '32px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #35363c', color: '#ffffff', borderRadius: '4px', padding: '6px 8px', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      style={{ width: '32px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#111214', border: '1px solid #35363c', color: '#ffffff', borderRadius: '4px', padding: '6px 8px', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={copyHexCodes}
                style={{
                  width: '100%',
                  backgroundColor: '#9bf0be',
                  color: '#111214',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Hex Codes Copied!' : `Copy Hex Codes (${customStart}, ${customEnd})`}
              </button>
            </div>

          </div>

          <div style={{ backgroundColor: '#1c1d22', borderRadius: '8px', border: '1px solid #2b2d31', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#b5bac1', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Preset Palettes
              </span>
              <span style={{ color: '#80848e', fontSize: '12px' }}>{filteredGradients.length} Total</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', flex: 1, alignContent: 'start' }}>
              {paginatedGradients.map((preset) => {
                const isSelected = selectedGradient.id === preset.id;
                const presetCss = `linear-gradient(90deg, ${preset.startColor}, ${preset.endColor})`;

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      backgroundColor: '#111214',
                      border: isSelected ? '2px solid #9bf0be' : '1px solid #35363c',
                      borderRadius: '6px',
                      padding: '8px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ height: '36px', borderRadius: '4px', background: presetCss, marginBottom: '6px' }} />
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#80848e', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{preset.startColor}</span>
                      <span>{preset.endColor}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredGradients.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#80848e', fontSize: '13px' }}>
                No gradient matches found for this hex or category filter.
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #2b2d31', paddingTop: '14px', marginTop: '14px' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  style={{
                    backgroundColor: currentPage === 1 ? '#111214' : '#2b2d31',
                    color: currentPage === 1 ? '#4e5058' : '#ffffff',
                    border: '1px solid #35363c',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                <span style={{ fontSize: '12px', color: '#80848e', fontWeight: '600' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  style={{
                    backgroundColor: currentPage === totalPages ? '#111214' : '#2b2d31',
                    color: currentPage === totalPages ? '#4e5058' : '#ffffff',
                    border: '1px solid #35363c',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}