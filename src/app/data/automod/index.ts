import type { RegexRule } from "@/app/types/automod";
import { nttsScamNuker } from "./ntts-scam-nuke";
import { nttsHardWord } from "./ntts-hard-word";
import { nttsMediumWord } from "./ntts-medium-word";
import { nttsSoftWord } from "./ntts-soft-word";
import { nttsNonEnglish } from "./ntts-non-english";
import { kedyjsInviteBlock } from "./kedyjs-invite-block";
import { kedyjsEmojiSpam } from "./kedyjs-emoji-spam";
import { kedyjsInlineLink } from "./kedyjs-inline-link";
import { kedyjsBlockHeadings } from "./kedyjsBlockHeadings";
import { kedyjsBlockSubtext } from "./kedyjsBlockSubtext";

export const REGEX_LIBRARY: RegexRule[] = [
  ...nttsScamNuker,
  ...nttsHardWord,
  ...nttsMediumWord,
  ...nttsSoftWord,
  ...nttsNonEnglish,
  ...kedyjsInviteBlock,
  ...kedyjsEmojiSpam,
  ...kedyjsInlineLink,
  ...kedyjsBlockHeadings,
  ...kedyjsBlockSubtext
];

export const CATEGORIES: Array<"All" | RegexRule["category"]> = [
  "All",
  "Spam & Links",
  "Phishing & Scams",
  "Toxicity & Bypass",
  "Exploits & Tokens",
];