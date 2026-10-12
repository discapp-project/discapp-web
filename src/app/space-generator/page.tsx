import type { Metadata } from "next";
import SpaceGenerator from "./space-generator";

export const metadata: Metadata = {
  title: "Space Generator | Botless",
  description: "Generate custom space-themed content for your Discord server.",
};

export default function SpaceGeneratorPage() {
  return <SpaceGenerator />;
}