import type { Metadata } from "next";
import AnsiBuilder from "./ansi-builder";

export const metadata: Metadata = {
  title: "ANSI Builder | Botless",
  description: "Build ANSI art for your server or profile.",
};

export default function AnsiBuilderPage() {
  return <AnsiBuilder />;
}
