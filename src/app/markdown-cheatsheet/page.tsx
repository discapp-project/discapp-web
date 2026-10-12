import type { Metadata } from "next";
import MarkdownCheatsheet from "./markdown-cheatsheet";

export const metadata: Metadata = {
  title: "Markdown Cheatsheet | Discapp",
  description: "Quick reference for Markdown syntax.",
};

export default function MarkdownCheatsheetPage() {
  return <MarkdownCheatsheet />;
}
