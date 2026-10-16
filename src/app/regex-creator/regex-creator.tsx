"use client";

import React, { useState } from "react";

interface SettingsState {
  numberVariants: boolean;
  symbolVariants: boolean;
  letterVariants: boolean;
  emojiVariants: boolean;
  unicodeVariants: boolean;
  letterSpam: boolean;
  multiCharacter: boolean;
  extraWhitespace: boolean;
  vowellessVariants: boolean;
  characterDeduplication: boolean;
  partialMatches: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  numberVariants: true,
  symbolVariants: true,
  letterVariants: true,
  emojiVariants: true,
  unicodeVariants: false,
  letterSpam: true,
  multiCharacter: false,
  extraWhitespace: false,
  vowellessVariants: false,
  characterDeduplication: false,
  partialMatches: true,
};

const NUMBER_MAP: Record<string, string[]> = {
  a: ["4", "@"],
  b: ["8"],
  e: ["3"],
  g: ["9", "6"],
  i: ["1", "!"],
  l: ["1", "|"],
  o: ["0"],
  s: ["5", "$"],
  t: ["7", "+"],
  z: ["2"],
};

const SYMBOL_MAP: Record<string, string[]> = {
  a: ["@", "/\\", "^"],
  c: ["("],
  e: ["3", "£"],
  i: ["!", "|", "\\"],
  l: ["|", "!", "\\"],
  s: ["$", "§"],
  t: ["+", "†"],
};

const LETTER_MAP: Record<string, string[]> = {
  i: ["l", "L"],
  l: ["i", "I"],
  u: ["v"],
  v: ["u"],
  w: ["vv"],
};

const EMOJI_MAP: Record<string, string[]> = {
  a: ["🅰️"],
  b: ["🅱️"],
  o: ["🅾️"],
  p: ["🅿️"],
  x: ["❌"],
};

const MULTI_CHARACTER_MAP: Record<string, string[]> = {
  a: ["/\\"],
  m: ["rn"],
  w: ["vv"],
};

const UNICODE_MAP: Record<string, string[]> = {
  a: ["а", "α"],
  e: ["е", "є"],
  i: ["і", "ι"],
  o: ["о", "ο"],
  c: ["с"],
  p: ["р"],
  x: ["х"],
};

export default function AutomodRegexCreator() {
  const [keyword, setKeyword] = useState<string>("badword");
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState<boolean>(false);

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const buildRegex = (): string => {
    if (!keyword.trim()) return "";

    const text = keyword.trim().toLowerCase();
    const tokens: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === " ") {
        if (settings.extraWhitespace) {
          tokens.push("\\s*");
        } else {
          tokens.push("\\s+");
        }
        continue;
      }

      const variants = new Set<string>([char, char.toUpperCase()]);

      if (settings.numberVariants && NUMBER_MAP[char]) {
        NUMBER_MAP[char].forEach((v) => variants.add(v));
      }
      if (settings.symbolVariants && SYMBOL_MAP[char]) {
        SYMBOL_MAP[char].forEach((v) => variants.add(v));
      }
      if (settings.letterVariants && LETTER_MAP[char]) {
        LETTER_MAP[char].forEach((v) => variants.add(v));
      }
      if (settings.emojiVariants && EMOJI_MAP[char]) {
        EMOJI_MAP[char].forEach((v) => variants.add(v));
      }
      if (settings.unicodeVariants && UNICODE_MAP[char]) {
        UNICODE_MAP[char].forEach((v) => variants.add(v));
      }

      if (settings.multiCharacter && MULTI_CHARACTER_MAP[char]) {
        MULTI_CHARACTER_MAP[char].forEach((v) => variants.add(v));
      }

      const escapedVariants = Array.from(variants).map((v) =>
        v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      );

      let token =
        escapedVariants.length > 1
          ? `(?:${escapedVariants.join("|")})`
          : escapedVariants[0];

      if (settings.characterDeduplication) {
        token += "*";
      } else if (settings.vowellessVariants && "aeiou".includes(char)) {
        token += "?";
      } else if (settings.letterSpam) {
        token += "+";
      }

      tokens.push(token);
    }

    let result = tokens.join(settings.extraWhitespace ? "\\s*" : "");

    if (!settings.partialMatches) {
      result = `\\b${result}\\b`;
    }

    return result;
  };

  const generatedRegex = buildRegex();

  const handleCopy = () => {
    if (!generatedRegex) return;
    navigator.clipboard.writeText(generatedRegex);
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
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        <div style={{ marginBottom: "8px", textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
            AutoMod Regex Builder
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", lineHeight: "1.5" }}>
            Create regexes for your Discord automod rules.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#141518",
            border: "1px solid #232428",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
            Target Keyword or Phrase
          </h2>
          <p style={{ fontSize: "13px", color: "#80848e", margin: 0 }}>
            Input the term you want your server AutoMod protocol to intercept.
          </p>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. prohibited_term"
            style={{
              width: "100%",
              maxWidth: "360px",
              padding: "12px 14px",
              backgroundColor: "#0b0c0e",
              border: "1px solid #2b2d31",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: "#141518",
            border: "1px solid #232428",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
              Evasion Protection Matrix
            </h2>
            <button
              type="button"
              onClick={resetSettings}
              style={{
                backgroundColor: "#0b0c0e",
                border: "1px solid #2b2d31",
                color: "#f2f3f5",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Reset Defaults
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px 24px",
            }}
          >
            {[
              {
                id: "numberVariants",
                title: "Numeric Swaps",
                desc: "Blocks numeric substitutions (e.g., h3llo).",
              },
              {
                id: "symbolVariants",
                title: "Symbol Obfuscation",
                desc: "Blocks special character swaps (e.g., h3!!o).",
              },
              {
                id: "letterVariants",
                title: "Visual Letter Swaps",
                desc: "Intercepts similar character lookalikes.",
              },
              {
                id: "emojiVariants",
                title: "Emoji Injection",
                desc: "Blocks supported emoji substitutions.",
              },
              {
                id: "unicodeVariants",
                title: "Unicode Homoglyphs",
                desc: "Catches international character bypasses.",
              },
              {
                id: "letterSpam",
                title: "Repeated Character Spam",
                desc: "Flags extended character repetition (e.g., heeeello).",
              },
              {
                id: "multiCharacter",
                title: "Multi-Character Splitting",
                desc: "Prevents composite character substitutions.",
              },
              {
                id: "extraWhitespace",
                title: "Whitespace Spacing",
                desc: "Catches spaced out letters.",
                warning: "Potential false positives risk.",
              },
              {
                id: "vowellessVariants",
                title: "Vowel Stripping",
                desc: "Intercepts vowel-less variations.",
                warning: "Potential false positives risk.",
              },
              {
                id: "characterDeduplication",
                title: "Deduplication Guards",
                desc: "Prevents compressed contraction bypasses.",
                warning: "Risk for short keywords.",
              },
              {
                id: "partialMatches",
                title: "Sub-String Anchoring",
                desc: "Enables loose substring scanning inside sentences.",
                warning: "Risk for short keywords.",
              },
            ].map((option) => {
              const isChecked = settings[option.id as keyof SettingsState];

              return (
                <div
                  key={option.id}

                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSetting(option.id as keyof SettingsState)}
                      style={{
                        accentColor: "#acf6c8",
                        cursor: "pointer",
                        width: "14px",
                        height: "14px",
                      }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff" }}>
                      {option.title}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#80848e", margin: 0, lineHeight: "1.4" }}>
                    {option.desc}{" "}
                    {option.warning && (
                      <span style={{ color: "#ed4245" }}>({option.warning})</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#141518",
            border: "1px solid #232428",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
            Export Compiled Regex Pattern
          </h2>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: "12px 20px",
                backgroundColor: "#acf6c8",
                border: "none",
                borderRadius: "8px",
                color: "#000000",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? "Copied Pattern!" : "Copy Pattern"}
            </button>

            <div
              style={{
                flex: 1,
                backgroundColor: "#0b0c0e",
                border: "1px solid #2b2d31",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#f2f3f5",
                fontSize: "14px",
                fontFamily: "monospace",
                wordBreak: "break-all",
                minHeight: "22px",
              }}
            >
              {generatedRegex || <span style={{ color: "#80848e" }}>Configure expression above...</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}