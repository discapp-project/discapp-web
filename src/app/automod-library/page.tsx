import type { Metadata } from "next";
import AutomodLibrary from "./automod-library";

export const metadata: Metadata = {
  title: "Automod Library | Discapp",
  description: "View and copy automod rules and regexes.",
};

export default function AutomodLibraryPage() {
  return <AutomodLibrary />;
}
