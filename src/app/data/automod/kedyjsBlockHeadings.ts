import type { RegexRule } from "@/app/types/automod";

export const kedyjsBlockHeadings: RegexRule[] = [
  {
    id: "kedyjs-block-headings",
    title: "Headings Filter",
    category: "Spam & Links",
    description:
      "Filter to block headings! From github.com/kedyjs",
    patterns: [
      {
        label: "Headings Regex",
        pattern:
          "^(> )?#{1,3}\s.*$",
      },
    ],
    source: { type: "user", name: "kedyjs" },
  },
];