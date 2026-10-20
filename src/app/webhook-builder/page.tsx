import type { Metadata } from "next";
import WebhookBuilder from "./webhook-builder";

export const metadata: Metadata = {
  title: "Webhook Builder | Discapp",
  description: "Compose, preview, edit, and send custom Discord webhook messages.",
};

export default function WebhookBuilderPage() {
  return <WebhookBuilder />;
}
