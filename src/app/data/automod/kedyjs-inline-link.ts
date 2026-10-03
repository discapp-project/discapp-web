import type { RegexRule } from "@/app/types/automod";

export const kedyjsInlineLink: RegexRule[] = [
  {
    id: "kedyjs-inline-link",
    title: "Inline Link Filter",
    category: "Spam & Links",
    description:
      "Filter for detecting and blocking inline links! From github.com/kedyjs ",
    patterns: [
      {
        label: "Block Excessive Inline Links",
        pattern:
          "\[.*[a-z0-9_\-]+\.[a-z]{2,}[\/]?.*\]\(<?(?:https?://)?[a-z0-9_\-\.]*[a-z0-9_\-]+\.[a-z]{2,}.*>?\)",
      },
    ],
    source: { type: "user", name: "kedyjs" },
  },
];