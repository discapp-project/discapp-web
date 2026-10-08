"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Upload, Download, Image as ImageIcon, RotateCcw, AlertCircle, Maximize2, Sparkles } from "lucide-react";

type AssetType = 
  | "avatar"
  | "serverBanner"
  | "inviteSplash"
  | "profileBanner"
  | "channelHeader";

interface AssetPreset {
  label: string;
  category: "Avatar" | "Banner";
  width: number;
  height: number;
  aspectRatio: number;
  isCirclePreview?: boolean;
  description: string;
}

const PRESETS: Record<AssetType, AssetPreset> = {
  avatar: {
    label: "Avatar / Icon",
    category: "Avatar",
    width: 512,
    height: 512,
    aspectRatio: 1,
    isCirclePreview: true,
    description: "Standard square/circular avatar for profiles or server icons.",
  },
  serverBanner: {
    label: "Server Banner",
    category: "Banner",
    width: 960,
    height: 540,
    aspectRatio: 16 / 9,
    description: "Header banner for boosted Discord servers.",
  },
  inviteSplash: {
    label: "Invite Splash",
    category: "Banner",
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    description: "Background wallpaper for invite links.",
  },
  profileBanner: {
    label: "Profile Banner",
    category: "Banner",
    width: 600,
    height: 240,
    aspectRatio: 5 / 2,
    description: "User or bot profile card background.",
  },
  channelHeader: {
    label: "Channel Header",
    category: "Banner",
    width: 1440,
    height: 360,
    aspectRatio: 4 / 1,
    description: "Ultra-wide header for event/forum channels.",
  },
};

export default function UniversalAssetResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<AssetType>("serverBanner");

  // Transform States
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Expanded Canvas & Blur Settings
  const [enableBlurFill, setEnableBlurFill] = useState<boolean>(true);
  const [blurAmount, setBlurAmount] = useState<number>(20);
  const [bgBrightness, setBgBrightness] = useState<number>(70);

  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preset = PRESETS[selectedPreset];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setProcessedUrl(null);
    setProcessedBlob(null);
    setErrorMessage(null);
    resetTransforms();
  };

  const resetTransforms = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const processImage = () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const img = new Image();
    img.src = previewUrl;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsProcessing(false);
        return;
      }

      canvas.width = preset.width;
      canvas.height = preset.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.clearRect(0, 0, preset.width, preset.height);

      // Base Aspect Fill Computations
      const imgAspect = img.width / img.height;
      let baseWidth = preset.width;
      let baseHeight = preset.height;

      if (imgAspect > preset.aspectRatio) {
        baseWidth = preset.height * imgAspect;
      } else {
        baseHeight = preset.width / imgAspect;
      }

      // 1. Render Blurred Extended Background (If Enabled)
      if (enableBlurFill) {
        ctx.save();
        ctx.filter = `blur(${blurAmount}px) brightness(${bgBrightness}%)`;

        // Overscale background image slightly to avoid white edge bleeding from blur
        const bgScale = 1.25;
        const bgW = baseWidth * bgScale;
        const bgH = baseHeight * bgScale;
        const bgX = (preset.width - bgW) / 2;
        const bgY = (preset.height - bgH) / 2;

        ctx.drawImage(img, bgX, bgY, bgW, bgH);
        ctx.restore();
      }

      // 2. Render Main Foreground Image
      const drawWidth = baseWidth * scale;
      const drawHeight = baseHeight * scale;

      const drawX = (preset.width - drawWidth) / 2 + offsetX;
      const drawY = (preset.height - drawHeight) / 2 + offsetY;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      // Export Canvas Result
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            setProcessedUrl(URL.createObjectURL(blob));
          } else {
            setErrorMessage("Failed to export resized asset.");
          }
          setIsProcessing(false);
        },
        "image/png",
        1.0
      );
    };

    img.onerror = () => {
      setErrorMessage("Could not load image file. It might be corrupt or an unsupported format.");
      setIsProcessing(false);
    };
  };

  const downloadFile = () => {
    if (!processedUrl || !file) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `${selectedPreset}_${file.name.split(".")[0] || "asset"}.png`;
    a.click();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111214", color: "#f2f3f5", fontFamily: "sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.025em", color: "#ffffff", marginBottom: "6px" }}>
            Discord Asset Resizer
          </h1>
          <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.5" }}>
            Resize, zoom, position assets for a server or profile.
          </p>
        </div>

        {/* Upload Box */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            id="asset-upload"
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer", zIndex: 10 }}
          />
          <label
            htmlFor="asset-upload"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
              border: "1px dashed #2b2d31",
              borderRadius: "8px",
              backgroundColor: "#1e1f22",
              cursor: "pointer",
            }}
          >
            <Upload style={{ width: "22px", height: "22px", color: "#949ba4", marginBottom: "8px" }} />
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#dbdee1" }}>
              {file ? file.name : "Choose an avatar or banner image"}
            </span>
            <span style={{ fontSize: "12px", color: "#80848e", marginTop: "4px" }}>
              Supports PNG, JPEG, or WEBP
            </span>
          </label>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{ backgroundColor: "rgba(242, 63, 67, 0.1)", border: "1px solid #f23f43", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", color: "#f23f43", fontSize: "13px" }}>
            <AlertCircle style={{ width: "18px", height: "18px", flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Workspace Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", alignItems: "start" }}>
          
          {/* Preset Selector */}
          <div style={{ backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#80848e", marginBottom: "4px" }}>
              Target Format
            </div>

            {(Object.keys(PRESETS) as AssetType[]).map((key) => {
              const item = PRESETS[key];
              const isSelected = selectedPreset === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedPreset(key);
                    setProcessedUrl(null);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor: isSelected ? "#acf6c8" : "transparent",
                    backgroundColor: isSelected ? "rgba(172, 246, 200, 0.05)" : "#111214",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: isSelected ? "#acf6c8" : "#ffffff" }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#80848e" }}>
                      {item.width}x{item.height}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#949ba4", lineHeight: "1.3" }}>
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Canvas Viewport & Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Viewport Box */}
            <div style={{ backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#b5bac1" }}>
                  Canvas Framing ({preset.width} x {preset.height}px)
                </span>
                <button
                  onClick={resetTransforms}
                  disabled={!file}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    backgroundColor: "#111214",
                    color: "#949ba4",
                    fontSize: "12px",
                    border: "1px solid #2b2d31",
                    borderRadius: "4px",
                    cursor: file ? "pointer" : "not-allowed",
                  }}
                >
                  <RotateCcw style={{ width: "12px", height: "12px" }} />
                  Reset Position
                </button>
              </div>

              {/* Viewport Render Box */}
              <div
                style={{
                  width: "100%",
                  maxWidth: preset.isCirclePreview ? "280px" : "100%",
                  maxHeight: "320px",
                  aspectRatio: `${preset.aspectRatio}`,
                  backgroundColor: "#111214",
                  borderRadius: preset.isCirclePreview ? "50%" : "6px",
                  border: "1px solid #2b2d31",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {previewUrl ? (
                  <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
                    
                    {/* Extended Blurred Background Layer */}
                    {enableBlurFill && (
                      <img
                        src={previewUrl}
                        alt="Background Blur"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scale(1.25)",
                          filter: `blur(${blurAmount / 2}px) brightness(${bgBrightness}%)`,
                          pointerEvents: "none",
                        }}
                      />
                    )}

                    {/* Scaled & Positioned Foreground Image */}
                    <img
                      src={previewUrl}
                      alt="Asset Foreground"
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
                        transition: "transform 0.05s linear",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#80848e", gap: "8px" }}>
                    <ImageIcon style={{ width: "32px", height: "32px", opacity: 0.5 }} />
                    <span style={{ fontSize: "13px" }}>Upload image to frame asset</span>
                  </div>
                )}
              </div>
            </div>

            {/* Adjustment Controls */}
            {file && (
              <div style={{ backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                
                {/* Zoom Control */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#b5bac1", marginBottom: "8px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Maximize2 style={{ width: "14px", height: "14px" }} /> Zoom Level</span>
                    <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{scale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: "#acf6c8", cursor: "pointer" }}
                  />
                </div>

                {/* Horizontal Shift */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#b5bac1", marginBottom: "8px" }}>
                    <span>Horizontal Shift</span>
                    <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{offsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                    style={{ width: "100%", accentColor: "#acf6c8", cursor: "pointer" }}
                  />
                </div>

                {/* Vertical Shift */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#b5bac1", marginBottom: "8px" }}>
                    <span>Vertical Shift</span>
                    <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                    style={{ width: "100%", accentColor: "#acf6c8", cursor: "pointer" }}
                  />
                </div>

                {/* Extended Background Toggle & Blur Controls */}
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #2b2d31", paddingTop: "16px", marginTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#ffffff", fontWeight: "600", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={enableBlurFill}
                        onChange={(e) => setEnableBlurFill(e.target.checked)}
                        style={{ accentColor: "#acf6c8", width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      Enable Extended Blurred Canvas Fill
                    </label>
                  </div>

                  {enableBlurFill && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "12px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#949ba4", marginBottom: "6px" }}>
                          <span>Blur Radius</span>
                          <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{blurAmount}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="2"
                          value={blurAmount}
                          onChange={(e) => setBlurAmount(parseInt(e.target.value, 10))}
                          style={{ width: "100%", accentColor: "#acf6c8", cursor: "pointer" }}
                        />
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#949ba4", marginBottom: "6px" }}>
                          <span>Background Darkness</span>
                          <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{bgBrightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          step="5"
                          value={bgBrightness}
                          onChange={(e) => setBgBrightness(parseInt(e.target.value, 10))}
                          style={{ width: "100%", accentColor: "#acf6c8", cursor: "pointer" }}
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Action Render Button */}
            {file && (
              <button
                onClick={processImage}
                disabled={isProcessing}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  backgroundColor: "#acf6c8",
                  color: "#000000",
                  fontWeight: "600",
                  fontSize: "14px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  opacity: isProcessing ? 0.5 : 1,
                }}
              >
                <Sparkles style={{ width: "16px", height: "16px" }} />
                {isProcessing ? "Rendering Asset..." : `Export ${preset.label} (${preset.width}x${preset.height})`}
              </button>
            )}

            {/* Export Download Section */}
            {processedUrl && (
              <div style={{ backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#ffffff" }}>Asset Export Ready</div>
                  <div style={{ fontSize: "12px", color: "#80848e", marginTop: "2px" }}>
                    PNG ({preset.width}x{preset.height}px) • {(processedBlob ? processedBlob.size / 1024 : 0).toFixed(1)} KB
                  </div>
                </div>
                <button
                  onClick={downloadFile}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    backgroundColor: "#acf6c8",
                    color: "#000000",
                    fontSize: "13px",
                    fontWeight: "600",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  <Download style={{ width: "14px", height: "14px" }} />
                  Download PNG
                </button>
              </div>
            )}

          </div>

        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}