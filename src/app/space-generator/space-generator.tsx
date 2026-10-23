"use client";

import React, { useState } from "react";

export default function ZeroWidthSpaceInjector() {
  const [inputText, setInputText] = useState<string>("I Love Cats");
  const [spacingMode, setSpacingMode] = useState<"every" | "words" | "custom">("every");
  const [customInterval, setCustomInterval] = useState<number>(2);
  const [showZWS, setShowZWS] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const ZWS = "\u200B";

  const generateModifiedText = () => {
    if (!inputText) return "";

    if (spacingMode === "every") {
      return inputText.split("").join(ZWS);
    } else if (spacingMode === "words") {
      return inputText.replace(/\s+/g, ZWS + " ");
    } else {
      const chars = inputText.split("");
      let result = "";
      for (let i = 0; i < chars.length; i++) {
        result += chars[i];
        if ((i + 1) % customInterval === 0 && i !== chars.length - 1) {
          result += ZWS;
        }
      }
      return result;
    }
  };

  const outputText = generateModifiedText();

  const renderZWSView = (text: string) => {
    if (!text) return <span style={{ color: "#80848e" }}>No output generated...</span>;
    
    return text.split("").map((char, index) => {
      if (char === ZWS) {
        return (
          <span
            key={index}
            title="Zero-Width Space (\u200B)"
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              backgroundColor: "#acf6c8",
              borderRadius: "50%",
              margin: "0 2px",
              verticalAlign: "middle",
            }}
          />
        );
      }
      return <span key={index}>{char}</span>;
    });
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111214",
        color: "#f2f3f5",
        fontFamily: "inherit",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "32px", textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
            Zero-Width Space Generator
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", lineHeight: "1.5" }}>
            Inject invisible characters (`\u200B`) to bypass text filters, format clean channel headers, or split messages. Use "Show ZWS" to see where they are placed!
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div
              style={{
                backgroundColor: "#141518",
                border: "1px solid #232428",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                  Original Text
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your text here..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#0b0c0e",
                    border: "1px solid #2b2d31",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#141518",
                border: "1px solid #232428",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <label style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                Mode
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
                {[
                  { id: "every", label: "Between Every Character" },
                  { id: "words", label: "Between Words & Spaces" },
                  { id: "custom", label: "Custom Character Interval" },
                ].map((mode) => {
                  const isSelected = spacingMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSpacingMode(mode.id as any)}
                      style={{
                        padding: "12px 16px",
                        backgroundColor: isSelected ? "#1e1f22" : "#0b0c0e",
                        border: isSelected ? "1px solid #acf6c8" : "1px solid #2b2d31",
                        borderRadius: "8px",
                        color: isSelected ? "#acf6c8" : "#f2f3f5",
                        fontSize: "13px",
                        fontWeight: "600",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {spacingMode === "custom" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                  <label style={{ fontSize: "11px", color: "#80848e" }}>
                    Insert ZWS every X characters:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customInterval}
                    onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#0b0c0e",
                      border: "1px solid #2b2d31",
                      borderRadius: "6px",
                      color: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}
            </div>

          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div
              style={{
                backgroundColor: "#141518",
                border: "1px solid #232428",
                borderRadius: "12px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                minHeight: "280px",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                    Output
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => setShowZWS(!showZWS)}
                    style={{
                      backgroundColor: showZWS ? "rgba(172, 246, 200, 0.1)" : "#0b0c0e",
                      border: "1px solid " + (showZWS ? "#acf6c8" : "#2b2d31"),
                      color: showZWS ? "#acf6c8" : "#80848e",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {showZWS ? "Show ZWS: ON" : "Show ZWS: OFF"}
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: "#0b0c0e",
                    border: "1px solid #2b2d31",
                    borderRadius: "8px",
                    padding: "16px",
                    minHeight: "120px",
                    maxHeight: "220px",
                    overflowY: "auto",
                    color: "#ffffff",
                    fontSize: "15px",
                    wordBreak: "break-all",
                    fontFamily: "monospace",
                  }}
                >
                  {showZWS ? renderZWSView(outputText) : (outputText || <span style={{ color: "#80848e" }}>No output generated...</span>)}
                </div>

                <div style={{ fontSize: "11px", color: "#80848e", lineHeight: "1.4" }}>
                  {showZWS ? (
                    <span style={{ color: "#acf6c8" }}>
                      💡 Green dots indicate zero-width space locations (`\u200B`).
                    </span>
                  ) : null}
                </div>

              </div>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#acf6c8",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000000",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {copied ? "Copied to Clipboard!" : "Copy Text"}
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}