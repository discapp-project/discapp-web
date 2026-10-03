import type { RegexRule } from "@/app/types/automod";

export const nttsScamNuker: RegexRule[] = [
  {
    id: "ntts-scam-nuker",
    title: "NTTS Scam Nuker",
    category: "Phishing & Scams",
    description:
      "Scam Nuker - Part of the No Text To Speech (NTTS) Discord server's automod.",
    patterns: [
      {
        label: "Discord NSFW Scam Blockers",
        pattern:
          "(nude(s|z)?|teen(s|z)?|sex|porn|xxx|leak(s|z)?|onlyfans|tiktok|🔞).*\n*(https:\/\/)?(discord\.gg\/|discord\.com\/invite\/)",
      },
      {
        label: "Discord NSFW Scam Blockers 2",
        pattern: "(https:\/\/)?(discord\.gg\/|discord\.com\/invite\/)(.){0,8}(nude(s|z)?|teen(s|z)?|sex|porn|xxx|leak(s|z)?|onlyfans|tiktok)",
      },
      {
        label: "Roblox Phishing Link",
        pattern: "roblox\.com\/users\/1.*]\(https:\/\/shrturl\.biz",
      },
      {
        label: "Steam Phishing Links",
        pattern: "steamcommunity\.com\/.*\]\(https:\/\/(exi\.link|sc\.link|bit\.ly|u\.to|cutt\.ly|udhdh\.site|qptr\.ru|bitly\.cx|envs\.sh|shorturl\.at|gg\.gg|hurlurl\.com|t\.ly)",
      },
      {
        label: "Steam Phishing Link 2",
        pattern: "(\$|steam|gift).*\s(\[steam.*\]\(.*\))",
      },
      {
        label: "Steam Phishing Link 3",
        pattern: "(\$.*steam|\$.*gift).*\s(http(s?)\:\/\/st)",
      },
      {
        label: "Steam Phishing Link 4",
        pattern: "https:\/\/s[ctz]y?[ace][aemnu][a-z]{1,4}o[mn][a-z]{4,8}[iy][a-z]?\.com\/",
      },
      {
        label: "Mr Beast Casino Blocker",
        pattern: "(.*\.discordapp\.(net|com)\/attachments\/[0-9]{18,19}\/[0-9]{18,19}\/([1-4]|image)\.(png|jpg).*\s*){4}",
      },
    ],
    wordLists: [
      {
        label: "Scam Nuker Word List",
        words: "*check my bi0, *check my bi0*, check my bio 😁, discordapp.com/invite\*, *girl in cam* *https://steamcomumnity.com/*, https://u.to/i1YTIQ, *https://www.roblox.com.kg*, *is in cam naked*, *join girl in cam*, *media.discordapp.net/attachments/1294380382661116045/*, *on cam look*, *she in cam look*, she's squirting*, *steamcommunity.com/gift*, *stenmcommnunnity.com*, wtf this girl doing... *",
      },
    ],
    source: { type: "server", name: "No Text To Speech" },
  },
];