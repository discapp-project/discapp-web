import type { RegexRule } from "@/app/types/automod";

export const kedyjsBlockSubtext: RegexRule[] = [
  {
    id: "kedyjs-block-subtext",
    title: "Subtext Filter",
    category: "Spam & Links",
    description:
      "Filter to block subtext! From github.com/kedyjs",
    patterns: [
      {
        label: "Subtext Regex",
        pattern:
          "(?m)^-#\s.*$",
      },
    ],
    source: { type: "user", name: "kedyjs" },
  },
];