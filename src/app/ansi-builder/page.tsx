import type { Metadata } from "next";
import AnsiBuilder from "./ansi-builder";

export const metadata: Metadata = {
  title: "ANSI Builder | Discapp",
  description: "Build ANSI art for your server or profile.",
};

export default function AnsiBuilderPage() {
  return <AnsiBuilder />;
}
