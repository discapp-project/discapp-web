import type { RegexRule } from "@/app/types/automod";

export const nttsNonEnglish: RegexRule[] = [
  {
    id: "ntts-non-english",
    title: "NTTS Non English Characters",
    category: "Exploits & Tokens",
    description:
      "Non-English characters - Part of the No Text To Speech (NTTS) Discord server's automod.",
    patterns: [
      {
        label: "Block Non-English Characters",
        pattern:
          "[^\x20-\x7E\n\p{Emoji}\p{Emoji_Component}•…—–:::≈‘ʼ’°º´²³×¢€₹£§ツ¯„“”Σπ«»→←♡]",
      },
    ],
    wordLists: [
      {
        label: "Non-English Character List",
        words: "*⁠*, *̶*, *▪️*, *𝖆*, *𝕬*, *𝖊*, *𝕰*, *𝖎*, *𝕴*, *𝖔*, *𝕺*, *𝖘*, *𝕾*, *𝖚*, *𝖀*, *ᴢ*, *Ζ*, *а*, *А*, *В*, *е*, *Е*, *ѕ*, *Ѕ*, *і*, *І*, *ј*, *Ј*, *к*, *К*, *м*, *М*, *н*, *Н*, *о*, *О*, *п*, *П*, *р*, *Р*, *с*, *С*, *т*, *Т*, *у*, *У*, *х*, *Х*, *ц*, *Ц*, *Ь*",
      },
    ],
    source: { type: "server", name: "No Text To Speech" },
  },
];