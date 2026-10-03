export type CategoryType =
  | "Spam & Links"
  | "Phishing & Scams"
  | "Toxicity & Bypass"
  | "Exploits & Tokens";

export interface PatternItem {
  label?: string;
  pattern: string;
}

export interface WordListItem {
  label?: string;
  words: string;
}

export interface RuleSource {
  type: "user" | "server";
  name: string;
}

export interface RegexRule {
  id: string;
  title: string;
  category: CategoryType;
  description: string;
  patterns: PatternItem[];
  wordLists?: WordListItem[];
  source: RuleSource;
}