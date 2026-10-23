"use client";

import React, { useState } from "react";

interface FontTransform {
  transform: (text: string) => string;
}

const FONT_TRANSFORMS: FontTransform[] = [
  {
    transform: (text) => {
      const map: Record<string, string> = {
        a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ",
        i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ",
        q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x",
        y: "ʏ", z: "ᴢ"
      };
      return text.toLowerCase().split("").map((c) => map[c] || c).join("");
    },
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z0-9]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d5d4 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d5ee + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ec + code - 48);
        return c;
      }),
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d608 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d622 + code - 97);
        return c;
      }),
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d63c + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d656 + code - 97);
        return c;
      }),
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z0-9]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d400 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d41a + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ce + code - 48);
        return c;
      }),
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d434 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d44e + code - 97);
        return c;
      }),
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d468 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d482 + code - 97);
        return c;
      }),
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z0-9]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d670 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d68a + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7f6 + code - 48);
        return c;
      }),
  },
  {
    transform: (text) => {
      const map: Record<string, string> = {
        a: "𝒶", b: "𝒷", c: "𝒸", d: "𝒹", e: "𝑒", f: "𝒻", g: "𝑔", h: "𝒽",
        i: "𝒾", j: "𝒿", k: "𝓀", l: "𝓁", m: "𝓂", n: "𝓃", o: "𝑜", p: "𝓅",
        q: "𝓆", r: "𝓇", s: "𝓈", t: "𝓉", u: "𝓊", v: "𝓋", w: "𝓌", x: "𝓍",
        y: "𝓎", z: "𝒛", A: "𝒜", B: "ℬ", C: "𝒞", D: "𝒟", E: "ℰ", F: "ℱ",
        G: "𝒢", H: "ℋ", I: "ℐ", J: "𝒥", K: "𝒦", L: "ℒ", M: "ℳ", N: "𝒩",
        O: "𝒪", P: "𝒫", Q: "𝒬", R: "ℛ", S: "𝒮", T: "𝒯", U: "𝒰", V: "𝒱",
        W: "𝒲", X: "𝒳", Y: "𝒴", Z: "ℤ"
      };
      return text.split("").map((c) => map[c] || c).join("");
    },
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d4d0 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d4ea + code - 97);
        return c;
      }),
  },
  {
    transform: (text) => {
      const map: Record<string, string> = {
        a: "𝔞", b: "𝔟", c: "𝔠", d: "𝔡", e: "𝔢", f: "𝔣", g: "𝔤", h: "𝔥",
        i: "𝔦", j: "𝔧", k: "𝔨", l: "𝔩", m: "𝔪", n: "𝔫", o: "𝔬", p: "𝔭",
        q: "𝔮", r: "𝔯", s: "𝔰", t: "𝔱", u: "𝔲", v: "𝔳", w: "𝔴", x: "𝔵",
        y: "𝔶", z: "𝔷", A: "𝔄", B: "𝔅", C: "ℭ", D: "𝔇", E: "𝔈", F: "𝔉",
        G: "𝔊", H: "ℌ", I: "ℑ", J: "𝔍", K: "𝔎", L: "𝔏", M: "𝔐", N: "𝔑",
        O: "𝔒", P: "𝔓", Q: "𝔔", R: "ℜ", S: "𝔖", T: "𝔗", U: "𝔘", V: "𝔙",
        W: "𝔚", X: "𝔛", Y: "𝔜", Z: "ℨ"
      };
      return text.split("").map((c) => map[c] || c).join("");
    },
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d56c + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d586 + code - 97);
        return c;
      }),
  },
  {
    transform: (text) => {
      const map: Record<string, string> = {
        a: "𝕒", b: "𝕓", c: "𝕔", d: "𝕕", e: "𝕖", f: "𝕗", g: "𝕘", h: "𝕙",
        i: "𝕚", j: "𝕛", k: "𝕜", l: "𝕝", m: "𝕞", n: "𝕟", o: "𝕠", p: "𝕡",
        q: "𝕢", r: "𝕣", s: "𝕤", t: "𝕥", u: "𝕦", v: "𝕧", w: "𝕨", x: "𝕩",
        y: "𝕪", z: "𝕫", A: "𝔸", B: "𝔹", C: "ℂ", D: "𝔻", E: "𝔼", F: "𝔽",
        G: "𝔾", H: "ℍ", I: "𝕀", J: "𝕁", K: "𝕂", L: "𝕃", M: "𝕄", N: "ℕ",
        O: "𝕆", P: "ℙ", Q: "ℚ", R: "ℝ", S: "𝕊", T: "𝕋", U: "𝕌", V: "𝕍",
        W: "𝕎", X: "𝕏", Y: "𝕐", Z: "ℤ"
      };
      return text.split("").map((c) => map[c] || c).join("");
    },
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z0-9]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x24b6 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x24d0 + code - 97);
        if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
        if (code === 48) return "⓪";
        return c;
      }),
  },
  {
    transform: (text) =>
      text.toUpperCase().replace(/[A-Z0-9]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1f150 + code - 65);
        if (code >= 49 && code <= 57) return String.fromCodePoint(0x2776 + code - 49);
        if (code === 48) return "⓿";
        return c;
      }),
  },
  {
    transform: (text) =>
      text.toUpperCase().replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1f130 + c.charCodeAt(0) - 65)),
  },
  {
    transform: (text) =>
      text.toUpperCase().replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1f170 + c.charCodeAt(0) - 65)),
  },
  {
    transform: (text) =>
      text.replace(/[!-~]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0)),
  },
  {
    transform: (text) => text.split("").join("\u0336") + "\u0336",
  },
  {
    transform: (text) => text.split("").join("\u0332") + "\u0332",
  },
  {
    transform: (text) => text.split("").join("\u0333") + "\u0333",
  },
  {
    transform: (text) => text.split("").join("\u0338"),
  },
  {
    transform: (text) => text.split("").join("\u0305") + "\u0305",
  },
  {
    transform: (text) => {
      const map: Record<string, string> = {
        a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ",
        i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ",
        r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
      };
      return text.toLowerCase().split("").map((c) => map[c] || c).join("");
    },
  },
  {
    transform: (text) => {
      const map: Record<string, string> = {
        a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
        n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
        "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉"
      };
      return text.toLowerCase().split("").map((c) => map[c] || c).join("");
    },
  },
  {
    transform: (text) => {
      const map: Record<string, string> = {
        a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ",
        i: "ᴉ", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d",
        q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x",
        y: "ʎ", z: "z", A: "∀", B: "𐐒", C: "Ɔ", D: "◖", E: "Ǝ", F: "Ⅎ",
        G: "⅁", H: "H", I: "I", J: "ſ", K: "ʞ", L: "⅂", M: "W", N: "N",
        O: "O", P: "Ԁ", Q: "Ό", R: "ᴚ", S: "S", T: "┴", U: "∩", V: "Λ",
        W: "M", X: "X", Y: "⅄", Z: "Z"
      };
      return text.split("").reverse().map((c) => map[c] || c).join("");
    },
  },
  {
    transform: (text) =>
      text.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1f110 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x249c + code - 97);
        return c;
      }),
  },
  {
    transform: (text) => text.split("").join("\u0307"),
  },
  {
    transform: (text) => text.toUpperCase().split("").join("  "),
  },
  {
    transform: (text) => `⟦ ${text} ⟧`,
  },
  {
    transform: (text) => `✧･ﾟ ${text} ﾟ･✧`,
  },
  {
    transform: (text) => `† ${text} †`,
  },
  {
    transform: (text) => `♥ ${text} ♥`,
  },
  {
    transform: (text) => `★ ${text} ★`,
  },
  {
    transform: (text) => `【 ${text} 】`,
  },
  {
    transform: (text) => `꧁ ${text} ꧂`,
  },
  {
    transform: (text) => {
      const above = ["\u030d", "\u030e", "\u0304", "\u0307", "\u0308", "\u0310", "\u0312", "\u0313", "\u0314", "\u0315", "\u031a", "\u031b", "\u0340", "\u0341", "\u0358", "\u0360", "\u0361"];
      const middle = ["\u0315", "\u031b", "\u0334", "\u0335", "\u0337", "\u0338", "\u0339", "\u033a", "\u033b", "\u033c", "\u0345", "\u0362"];
      const below = ["\u0316", "\u0317", "\u0318", "\u0319", "\u031c", "\u031d", "\u031e", "\u031f", "\u0320", "\u0324", "\u0325", "\u0326", "\u0327", "\u0328", "\u0329", "\u032a", "\u032b", "\u032c", "\u032d", "\u032e", "\u032f", "\u0330", "\u0331", "\u0332", "\u0333", "\u0339", "\u033a", "\u033b", "\u033c", "\u0347", "\u0348", "\u0349", "\u034d", "\u034e", "\u0353", "\u0354", "\u0355", "\u0356", "\u0359", "\u035a", "\u035b", "\u035c", "\u035d", "\u035e", "\u035f", "\u0360", "\u0362", "\u0363", "\u0364", "\u0365", "\u0366", "\u0367", "\u0368", "\u0369", "\u036a", "\u036b", "\u036c", "\u036d", "\u036e", "\u036f"];
      
      const getRandomChar = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      
      return text.split("").map((c) => {
        if (c.trim() === "") return c;
        let res = c;
        const numAbove = Math.floor(Math.random() * 3) + 1;
        const numMiddle = Math.floor(Math.random() * 2);
        const numBelow = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numAbove; i++) res += getRandomChar(above);
        for (let i = 0; i < numMiddle; i++) res += getRandomChar(middle);
        for (let i = 0; i < numBelow; i++) res += getRandomChar(below);
        
        return res;
      }).join("");
    },
  },
];

export default function DiscordFontGenerator() {
  const [username, setUsername] = useState<string>("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (styledText: string, index: number) => {
    navigator.clipboard.writeText(styledText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
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
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
            Discord Font Generator
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px" }}>
            Type your username below and click any box to copy the style directly to your clipboard.
          </p>
        </div>

        <div
          style={{
            position: "sticky",
            top: "16px",
            zIndex: 40,
            backgroundColor: "#141518",
            border: "1px solid #232428",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Your Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Type your username..."
              maxLength={32}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#0b0c0e",
                border: "1px solid #2b2d31",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {FONT_TRANSFORMS.map((font, idx) => {
            const transformedText = username.trim() ? font.transform(username) : font.transform("Username");
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => handleCopy(transformedText, idx)}
                style={{
                  backgroundColor: "#141518",
                  border: isCopied ? "1px solid #acf6c8" : "1px solid #232428",
                  borderRadius: "10px",
                  padding: "20px",
                  minHeight: "100px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                  position: "relative",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  if (!isCopied) {
                    e.currentTarget.style.borderColor = "#2b2d31";
                    e.currentTarget.style.backgroundColor = "#18191c";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCopied) {
                    e.currentTarget.style.borderColor = "#232428";
                    e.currentTarget.style.backgroundColor = "#141518";
                  }
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    color: "#ffffff",
                    wordBreak: "break-all",
                    marginBottom: "16px",
                    lineHeight: "1.4",
                  }}
                >
                  {transformedText}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(transformedText, idx);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 0",
                    backgroundColor: "#acf6c8",
                    border: "none",
                    borderRadius: "6px",
                    color: "#000000",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}