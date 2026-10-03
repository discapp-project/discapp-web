import type { RegexRule } from "@/app/types/automod";

export const nttsMediumWord: RegexRule[] = [
  {
    id: "ntts-medium-word",
    title: "NTTS Medium Word Filter",
    category: "Toxicity & Bypass",
    description:
      "Medium word filter - Part of the No Text To Speech (NTTS) Discord server's automod.",
    patterns: [
      {
        label: "Medium Custom Words Regex",
        pattern:
          "ni?g?\|\|.*\|\|",
      },
    ],
    wordLists: [
      {
        label: "Medium Custom Words List",
        words: "back shot*, backshot*, bj, blowjob, boner*, boob*, boobs, clit, clitoris, cock, cocks, coem, coems, coom, cooming, cp, cum*, cuming*, cummies, cummy, cunny, *cutt.us*, cvm*, dildo*, e-sex, *e621.net*, edging, ejaculat*, esex, fleshlight, foid, footjob, foreskin, g string, g00n, goon*, handjob, hent, hentai, hitler, https://pnrtscr.com/ck08e6, ishowmeat, jelq*, *jerkmate*, jiz*, jizz*, jork*, koom, kum, kvm, loli, lolicon, lolli, lollicon, masterbait, masterbate*, masturb*, masturbate, nazi, nazis, niger, nnn, no nut, nut nov*, nutted, nutting, oil up, oiled up, oiling up, only fans*, *only-fans*, onlyfans, onlyfans*, *p0rn*, p0rn, peenus, *penis*, penus, *porn*, porn, pornhub, *pornhub.com*, pron, pronhub, rape, raped, raping, reape, seemen, seggs*, semen, sex, smegma, smegma*, smex, sperm, tiddie, tiddies, tiddy, tit, titi*, tits*, titties, titty, troon, troons, vagina*, vegina",
      },
    ],
    source: { type: "server", name: "No Text To Speech" },
  },
];