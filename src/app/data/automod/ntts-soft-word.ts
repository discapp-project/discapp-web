import type { RegexRule } from "@/app/types/automod";

export const nttsSoftWord: RegexRule[] = [
  {
    id: "ntts-soft-word",
    title: "NTTS Soft Word Filter",
    category: "Toxicity & Bypass",
    description:
      "Soft word filter - Part of the No Text To Speech (NTTS) Discord server's automod.",
    patterns: [
      {
        label: "Soft Custom Words Regex",
        pattern:
          "discord\.(com[\\\/]invite|gg)[\\\/].*",
      },
      {
        label: "Soft Custom Words Regex 2",
        pattern:
          "<(?:https?|ht|tp|://|discord|\.gg)[^>]*\n[^>]*>",
      },
      {
        label: "Soft Custom Words Regex 3",
        pattern:
          "discord(app)?\.com[\\\/]invite[\\\/].*|discord\.gg[\\\/].*",
      },
    ],
    wordLists: [
      {
        label: "Soft Custom Words List",
        words: "*.cf/*, *.ga/*, *.gq/*, *.ml/*, *.nz/*, *.tk/*, *@everyone*, *@here*, *barefoot.pics*, child diddl*, d0cksbi*, d0x*, db1n, dbin, diddy, dih, dihk*, *discord.com/application-directory/*, *discord.com/billing*, *discord.com/discovery/applications*, *discord.com/gift*, *discord.com/invite/*, discord.com/invite\*, *discord.com/oauth2/authorize*, *discord.gg/*, *discord.gg\*, *discord.gift/*, *discord.new/*, *discord.nfp.is/*, dob1n, dobin, docksbi*, dox*, dox, *doxbin*, doxed, doxing, doxx, doxxed, doxxing, *drop ship*, *dropship*, dxb1n, dxbin, dxxed, *ed.tc*, epstein, *ezstat.ru*, fucktard*, *gamer.hair*, *gamer.tattoo*, *grabify.link*, groom*, *gyat*, hawk tuah, horny, *https://\discord.gg\/*, *imagevault.cloud*, incest, *iplis.ru*, *iplog.co*, *iplogger.cn*, *iplogger.co*, *iplogger.com*, *iplogger.info*, *iplogger.org*, *iplogger.ru*, kid diddl*, kill urself, kill yourself, kkk, kys, *maper.info*, *massive.boats*, *massive.mom*, *mymassive.store*, *mymassive.top*, *mymassive.yachts*, *myprivate.pics*, n word, n-word, *noodshare.pics*, nude*, nword, *opensea.io/*, *plz.life*, retard*, retarted, *screenshare.pics*, *sellix.io/*, *shareit.pics*, *shipment.website*, sped, *stonks.boats*, *stonks.fun*, *stopify.co*, *sugma.mom*, swastika, *t.me/*, tard, tarded, *telegram.com/*, *telegram.me/*, *temu.*, *temu.com*, *temu.com/s/*, *toes.beauty*, *tuah, *whatsapp.com*, *wl.gl*, *yip.su*, *yum.mom*, zoophile",
      },
    ],
    source: { type: "server", name: "No Text To Speech" },
  },
];