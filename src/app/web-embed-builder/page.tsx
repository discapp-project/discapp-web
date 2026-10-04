import type { Metadata } from "next";
import WebEmbedBuilder from "./web-embed-builder";

export const metadata: Metadata = {
  title: "Webhook Builder | Botless",
  description: "Compose, preview, and send custom Discord webhook messages.",
};

export default function WebEmbedBuilderPage() {
  return <WebEmbedBuilder />;
}
