import type { Metadata } from "next";
import RegexCreator from "./regex-creator";

export const metadata: Metadata = {
  title: "Regex Creator | Discapp",
  description: "Create regexs for your Discord Automod.",
};

export default function RegexCreatorPage() {
  return <RegexCreator />;
}
