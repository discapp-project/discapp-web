import type { Metadata } from "next";
import FontGenerator from "./font-generator";

export const metadata: Metadata = {
  title: "Font Generator | Discapp",
  description: "Generate fonts for your Discord display name.",
};

export default function FontGeneratorPage() {
  return <FontGenerator />;
}
