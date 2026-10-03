import type { RegexRule } from "@/app/types/automod";

export const kedyjsEmojiSpam: RegexRule[] = [
  {
    id: "kedyjs-emoji-spam",
    title: "Emoji Spam Filter",
    category: "Spam & Links",
    description:
      "Filter for detecting and blocking emoji spam! From github.com/kedyjs ",
    patterns: [
      {
        label: "Block Excessive Emoji Spam",
        pattern:
          "(?s)(?i)((|\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[0-9#\*]\u{fe0f}).*){7,}",
      },
    ],
    source: { type: "user", name: "kedyjs" },
  },
];