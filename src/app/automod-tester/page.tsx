import type { Metadata } from "next";
import AutomodTester from "./automod-tester";

export const metadata: Metadata = {
  title: "Automod Tester | Botless",
  description: "Test automod regexes and keywords before implementation.",
};

export default function AutomodTesterPage() {
  return <AutomodTester />;
}
