import type { RegexRule } from "@/app/types/automod";

export const kedyjsInviteBlock: RegexRule[] = [
  {
    id: "kedyjs-invite-block",
    title: "Invite Link Filter",
    category: "Spam & Links",
    description:
      "Block Server Invite Links! From github.com/kedyjs",
    patterns: [
      {
        label: "Discord Invite Link Regex",
        pattern:
          "(?:https?://)?(?:www.|ptb.|canary.)?(?:dsc\.gg|invite\.gg|discord\.link|(?:discord\.(?:gg|io|me|li|id))|disboard\.org|discord(?:app)?\.(?:com|gg)/(?:invite|servers))/[a-z0-9-_]+",
      },
    ],
    source: { type: "user", name: "kedyjs" },
  },
];