import type { Metadata } from "next";
import GradientFinder from "./gradient-finder";

export const metadata: Metadata = {
  title: "Gradient Finder | Discapp",
  description: "Find the perfect gradient for your roles.",
};

export default function GradientFinderPage() {
  return <GradientFinder />;
}
