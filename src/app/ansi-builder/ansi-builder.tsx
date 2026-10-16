"use client";

import React, { useState } from "react";

export default function AnsiColorBuilder() {
  const [text, setText] = useState<string>("Hello Discapp!");
  const [textColor, setTextColor] = useState<string>("32"); 
  const [bgColor, setBgColor] = useState<string>(""); 
  const [styles, setStyles] = useState<{ bold: boolean; underline: boolean; dim: boolean }>({
    bold: true,
    underline: false,
    dim: false,
  });
  const [copied, setCopied] = useState<boolean>(false);

  const toggleStyle = (key: keyof typeof styles) => {
    setStyles((prev) => ({ ...prev, [key]: !prev[key] }))
  };

  const generateOutputBlock = () => {
    const codes: string[] = [];
    if (styles.bold) codes.push("1");
    if (styles.dim) codes.push("2");
    if (styles.underline) codes.push("4");
    if (textColor) codes.push(textColor);
    if (bgColor) codes.push(bgColor);

    const ansiSequence = `\u001b[${codes.join(";")}m${text}\u001b[0m`;
    return "```ansi\n" + ansiSequence + "\n```";
  };

  const outputCode = generateOutputBlock();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111214",
        color: "#f2f3f5",
        fontFamily: "sans-serif",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
        
        <div style={{ textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
            ANSI Color & Style Builder
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", lineHeight: "1.5" }}>
            Design custom Discord ANSI-colored code blocks for Discord.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", alignItems: "start" }}>
          
          <div style={{ backgroundColor: "#141518", border: "1px solid #232428", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
              ANSI Palette & Modifiers
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                Your Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text..."
                style={{ padding: "10px 12px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                Foreground Color
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { id: "30", label: "Gray", color: "#4f545c" },
                  { id: "31", label: "Red", color: "#ed4245" },
                  { id: "32", label: "Green", color: "#acf6c8" },
                  { id: "33", label: "Yellow", color: "#fee75c" },
                  { id: "34", label: "Blue", color: "#5865f2" },
                  { id: "35", label: "Pink", color: "#eb459e" },
                  { id: "36", label: "Cyan", color: "#00b0f4" },
                  { id: "37", label: "White", color: "#ffffff" },
                ].map((col) => {
                  const isActive = textColor === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setTextColor(col.id)}
                      style={{
                        padding: "8px",
                        backgroundColor: isActive ? "#1e1f22" : "#0b0c0e",
                        border: isActive ? "1px solid #acf6c8" : "1px solid #2b2d31",
                        borderRadius: "8px",
                        color: col.color,
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {col.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                Background Color (Optional)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { id: "", label: "None" },
                  { id: "40", label: "Black BG" },
                  { id: "41", label: "Red BG" },
                  { id: "42", label: "Green BG" },
                  { id: "43", label: "Yellow BG" },
                  { id: "44", label: "Blue BG" },
                  { id: "45", label: "Magenta BG" },
                  { id: "47", label: "White BG" },
                ].map((bg) => {
                  const isActive = bgColor === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBgColor(bg.id)}
                      style={{
                        padding: "8px",
                        backgroundColor: isActive ? "#1e1f22" : "#0b0c0e",
                        border: isActive ? "1px solid #acf6c8" : "1px solid #2b2d31",
                        borderRadius: "8px",
                        color: "#f2f3f5",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {bg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                Text Modifiers
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                {[
                  { id: "bold", label: "Bold", state: styles.bold },
                  { id: "dim", label: "Dim", state: styles.dim },
                  { id: "underline", label: "Underline", state: styles.underline },
                ].map((st) => (
                  <label key={st.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#f2f3f5", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={st.state}
                      onChange={() => toggleStyle(st.id as any)}
                      style={{ accentColor: "#acf6c8", width: "14px", height: "14px" }}
                    />
                    {st.label}
                  </label>
                ))}
              </div>
            </div>

          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ backgroundColor: "#141518", border: "1px solid #232428", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                Preview
              </span>
              
              <div style={{ backgroundColor: "#2b2d31", borderRadius: "4px", borderLeft: "4px solid #232428", padding: "12px", fontFamily: "Consolas, Monaco, 'Courier New', monospace", fontSize: "13px", lineHeight: "1.4" }}>
                <span
                  style={{
                    color: textColor === "31" ? "#ed4245" : textColor === "32" ? "#3ba55d" : textColor === "33" ? "#faa61a" : textColor === "34" ? "#00b0f4" : textColor === "35" ? "#eb459e" : textColor === "36" ? "#3282b8" : textColor === "37" ? "#ffffff" : "#b9bbbe",
                    backgroundColor: bgColor === "40" ? "#000000" : bgColor === "41" ? "#ed4245" : bgColor === "42" ? "#3ba55d" : bgColor === "43" ? "#faa61a" : bgColor === "44" ? "#00b0f4" : bgColor === "45" ? "#eb459e" : bgColor === "47" ? "#ffffff" : "transparent",
                    fontWeight: styles.bold ? "700" : "400",
                    opacity: styles.dim ? 0.6 : 1,
                    textDecoration: styles.underline ? "underline" : "none",
                  }}
                >
                  {text || "Sample text..."}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: "#141518", border: "1px solid #232428", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                  Output
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: "#acf6c8",
                    border: "none",
                    borderRadius: "6px",
                    color: "#000000",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div
                style={{
                  backgroundColor: "#0b0c0e",
                  border: "1px solid #2b2d31",
                  borderRadius: "8px",
                  padding: "14px",
                  color: "#acf6c8",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  whiteSpace: "pre-wrap",
                }}
              >
                {outputCode}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}