"use client";

import React, { useState } from "react";

export default function WebhookJsonFormatter() {
  const [inputJson, setInputJson] = useState<string>("");
  const [formattedOutput, setFormattedOutput] = useState<string>("");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const repairAndFormatJson = (raw: string) => {
    if (!raw.trim()) {
      setFormattedOutput("");
      setErrorStatus(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setFormattedOutput(JSON.stringify(parsed, null, 2));
      setErrorStatus(null);
      return;
    } catch (err: any) {
      let fixed = raw
        .replace(/'([^']*)'/g, '"$1"')
        .replace(/([{,]\s*)([a-zA-Z0-9_$-]+)(\s*:\s*)/g, '$1"$2"$3')
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/:\s*true/gi, ":true")
        .replace(/:\s*false/gi, ":false")
        .replace(/:\s*null/gi, ":null")
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "");

      try {
        const parsedFixed = JSON.parse(fixed);
        setFormattedOutput(JSON.stringify(parsedFixed, null, 2));
        setErrorStatus("Successfully repaired syntax (quotes, trailing commas, and unquoted keys fixed).");
      } catch (secondErr: any) {
        setFormattedOutput("");
        setErrorStatus(`JSON Parse Error: ${err.message}`);
      }
    }
  };

  const handleInputChange = (val: string) => {
    setInputJson(val);
    repairAndFormatJson(val);
  };

  const handleCopy = () => {
    if (!formattedOutput) return;
    navigator.clipboard.writeText(formattedOutput);
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
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
        
        <div style={{ textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
            Webhook JSON Formatter
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", lineHeight: "1.5" }}>
            Fix webhook json payloads so then they are considered valid.
          </p>
        </div>

        {errorStatus && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: errorStatus.startsWith("Successfully") ? "rgba(172, 246, 200, 0.1)" : "rgba(237, 66, 69, 0.1)",
              border: `1px solid ${errorStatus.startsWith("Successfully") ? "#acf6c8" : "#ed4245"}`,
              borderRadius: "8px",
              color: errorStatus.startsWith("Successfully") ? "#acf6c8" : "#ed4245",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {errorStatus}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          
          <div
            style={{
              backgroundColor: "#141518",
              border: "1px solid #232428",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", margin: 0, textTransform: "uppercase" }}>
                Imput Json
              </h3>
              <button
                type="button"
                onClick={() => handleInputChange("")}
                style={{
                  backgroundColor: "#0b0c0e",
                  border: "1px solid #2b2d31",
                  color: "#949ba4",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>

            <textarea
              value={inputJson}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste raw or broken JSON here..."
              rows={16}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#0b0c0e",
                border: "1px solid #2b2d31",
                borderRadius: "8px",
                color: "#f2f3f5",
                fontSize: "13px",
                fontFamily: "monospace",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: "1.5",
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: "#141518",
              border: "1px solid #232428",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", margin: 0, textTransform: "uppercase" }}>
                Fixed Output
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!formattedOutput}
                style={{
                  backgroundColor: "#acf6c8",
                  border: "none",
                  color: "#000000",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: formattedOutput ? "pointer" : "not-allowed",
                  opacity: formattedOutput ? 1 : 0.6,
                }}
              >
                {copied ? "Copied!" : "Copy JSON"}
              </button>
            </div>

            <div
              style={{
                width: "100%",
                height: "360px",
                backgroundColor: "#0b0c0e",
                border: "1px solid #2b2d31",
                borderRadius: "8px",
                padding: "14px",
                color: "#acf6c8",
                fontSize: "13px",
                fontFamily: "monospace",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                boxSizing: "border-box",
                lineHeight: "1.5",
              }}
            >
              {formattedOutput || <span style={{ color: "#80848e" }}>Waiting for webhook payload input...</span>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}