import type { Metadata } from "next";
import VanityChecker from "./vanity-checker";

export const metadata: Metadata = {
  title: "Vanity URL Checker | Discapp",
  description: "Check if a custom Discord vanity URL is available.",
};

export default function VanityCheckerPage() {
  return <VanityChecker />;
}
