import type { RegexRule } from "@/app/types/automod";

export const nttsHardWord: RegexRule[] = [
  {
    id: "ntts-hard-word",
    title: "NTTS Hard Word Filter",
    category: "Toxicity & Bypass",
    description:
      "Hard word filter - Part of the No Text To Speech (NTTS) Discord server's automod.",
    patterns: [
      {
        label: "Hard Custom Words Regex",
        pattern:
          "\b([k]{0,1})n([i1!e]{1,5})([gjbpq]{1,})([a]{1,}([sz]{0,}))\b",
      },
    ],
    wordLists: [
      {
        label: "Hard Custom Words List",
        words: "🇳🇮🇬🇬🇪🇷, *1gga*, aggin, beaner, chank, chigga, ching chong, chink, chinks, coon, *f@g*, f@g, f2ggot, f4g, fag, faggot*, fagot, fags, fags*, figger, fniger, fnigers, *gg3r, *igga*, JIGABOO, jiggaboo, kyke*, kyke, *lgga*, moon cricket, n!g*, N11G3RS, n1gg3r, n1gger, nega, negar, neggar, *negger*, NEGGER*, Neggers, neggir, negro, nga*, ngga*, *n*gger*, n*gger*, ngger*, n*ggers, nibber, niccker, nicker*, nickher*, nig, nig||*, niga*, niger*, nigg*, *nigger*, nigger, *nigger, *NIGGER*, *nigha*, nigher, *nighty_z*, niglet, nigr*, nigr, *niqqer*, ni⁥g⁥⁥⁥ge⁥⁥r, njggers, nlgger, ntupid sigga, ntupid sigger, numb digga, numb digger, nxger*, nіgger, nіggers, nіggеr, porch monkey, reggin, rigga, sreggin, stupid digger, *theync.com*, trann*, trannie, tranny, v1gger, veneco, vigger, whigger, wigger, zhid, zhyd, *卐*",
      },
    ],
    source: { type: "server", name: "No Text To Speech" },
  },
];