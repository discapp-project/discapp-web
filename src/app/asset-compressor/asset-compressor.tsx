"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Upload, Download, Sparkles, Image as ImageIcon } from "lucide-react";

export default function EmojiStickerCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [targetType, setTargetType] = useState<"emoji" | "sticker">("emoji");
  const [quality, setQuality] = useState<number>(0.8);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const maxSizeBytes = targetType === "emoji" ? 256 * 1024 : 500 * 1024;
  const maxDimensions = targetType === "emoji" ? 128 : 320;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setOriginalSize(selected.size);
    setPreviewUrl(URL.createObjectURL(selected));
    setCompressedUrl(null);
    setCompressedBlob(null);
    setCompressedSize(0);
  };

  const processImage = () => {
    if (!file) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimensions) {
          height = Math.round((height * maxDimensions) / width);
          width = maxDimensions;
        }
      } else {
        if (height > maxDimensions) {
          width = Math.round((width * maxDimensions) / height);
          height = maxDimensions;
        }
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        setIsProcessing(false);
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = targetType === "sticker" && file.type === "image/png" ? "image/png" : "image/webp";

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedBlob(blob);
            setCompressedSize(blob.size);
            setCompressedUrl(URL.createObjectURL(blob));
          }
          setIsProcessing(false);
        },
        mimeType,
        quality
      );
    };
  };

  const downloadFile = () => {
    if (!compressedUrl || !file) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = `compressed_${targetType}_${file.name.split(".")[0] || "asset"}.${
      targetType === "sticker" && file.type === "image/png" ? "png" : "webp"
    }`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 KB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111214", color: "#f2f3f5", fontFamily: "sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: "896px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", letterSpacing: "-0.025em", color: "#ffffff", marginBottom: "8px" }}>
            Emoji & Sticker Compressor
          </h1>
          <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.5" }}>
            Resize and optimize assets to fit Discord&apos;s strict upload limits.
          </p>
        </div>

        <div style={{ backgroundColor: "#111214", border: "1px solid #1e1f22", borderRadius: "12px", padding: "24px" }}>
          
          <div style={{ display: "inline-flex", backgroundColor: "#1e1f22", borderRadius: "8px", padding: "4px", marginBottom: "24px" }}>
            <button
              onClick={() => setTargetType("emoji")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                transition: "all 0.15s ease",
                backgroundColor: targetType === "emoji" ? "#2b2d31" : "transparent",
                color: targetType === "emoji" ? "#ffffff" : "#949ba4",
                boxShadow: targetType === "emoji" ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
              }}
            >
              Emoji (256 KB / 128x128)
            </button>
            <button
              onClick={() => setTargetType("sticker")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                transition: "all 0.15s ease",
                backgroundColor: targetType === "sticker" ? "#2b2d31" : "transparent",
                color: targetType === "sticker" ? "#ffffff" : "#949ba4",
                boxShadow: targetType === "sticker" ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
              }}
            >
              Sticker (500 KB / 320x320)
            </button>
          </div>

          <div style={{ position: "relative", marginBottom: "24px" }}>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              id="file-upload"
              style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer", zIndex: 10 }}
            />
            <label
              htmlFor="file-upload"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 16px",
                border: "1px dashed #2b2d31",
                borderRadius: "8px",
                backgroundColor: "#16181b",
                cursor: "pointer",
                transition: "border-color 0.15s ease",
              }}
            >
              <Upload style={{ width: "24px", height: "24px", color: "#949ba4", marginBottom: "12px" }} />
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#dbdee1" }}>
                {file ? file.name : "Choose an image or drop it here"}
              </span>
              <span style={{ fontSize: "12px", color: "#80848e", marginTop: "4px" }}>
                Supports PNG, JPEG, or WEBP
              </span>
            </label>
          </div>

          {file && (
            <div style={{ backgroundColor: "#16181b", border: "1px solid #1e1f22", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "500", color: "#b5bac1" }}>
                  Compression Level
                </label>
                <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#acf6c8" }}>
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "#acf6c8",
                  cursor: "pointer",
                  marginBottom: "16px",
                }}
              />
              <button
                onClick={processImage}
                disabled={isProcessing}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  backgroundColor: "#acf6c8",
                  color: "#000000",
                  fontWeight: "600",
                  fontSize: "14px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  opacity: isProcessing ? 0.7 : 1,
                  transition: "opacity 0.15s ease",
                }}
              >
                <Sparkles style={{ width: "16px", height: "16px" }} />
                {isProcessing ? "Processing..." : "Compress"}
              </button>
            </div>
          )}

          {(previewUrl || compressedUrl) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              
              {previewUrl && (
                <div style={{ backgroundColor: "#16181b", border: "1px solid #1e1f22", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#80848e", marginBottom: "12px" }}>
                    Original
                  </div>
                  <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0c0e", borderRadius: "6px", border: "1px solid #1e1f22", marginBottom: "12px" }}>
                    <img
                      src={previewUrl}
                      alt="Original"
                      style={{
                        maxWidth: targetType === "emoji" ? "128px" : "160px",
                        maxHeight: targetType === "emoji" ? "128px" : "160px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "13px", color: "#b5bac1", display: "flex", justifyContent: "space-between" }}>
                    <span>File Size:</span>
                    <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{formatSize(originalSize)}</span>
                  </div>
                </div>
              )}

              {compressedUrl && (
                <div style={{ backgroundColor: "#16181b", border: "1px solid #1e1f22", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#80848e", marginBottom: "12px" }}>
                    Compressed
                  </div>
                  <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0c0e", borderRadius: "6px", border: "1px solid #1e1f22", marginBottom: "12px" }}>
                    <img
                      src={compressedUrl}
                      alt="Compressed"
                      style={{
                        maxWidth: targetType === "emoji" ? "128px" : "160px",
                        maxHeight: targetType === "emoji" ? "128px" : "160px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "13px", display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                    <span style={{ color: "#b5bac1" }}>Output Size:</span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: "600",
                        color: compressedSize <= maxSizeBytes ? "#acf6c8" : "#f23f43",
                      }}
                    >
                      {formatSize(compressedSize)} {compressedSize <= maxSizeBytes ? "✓" : "✕ (Over Limit)"}
                    </span>
                  </div>
                  <button
                    onClick={downloadFile}
                    style={{
                      width: "100%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      backgroundColor: "#2b2d31",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "500",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "backgroundColor 0.15s ease",
                    }}
                  >
                    <Download style={{ width: "14px", height: "14px" }} />
                    Download File
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}