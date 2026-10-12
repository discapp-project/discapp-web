import type { Metadata } from "next";
import WebhookJsonFormatter from "./webhook-json-formatter";

export const metadata: Metadata = {
  title: "Webhook JSON Formatter | Discapp",
  description: "Format and validate your Discord webhook JSON payloads.",
};

export default function WebhookJsonFormatterPage() {
  return <WebhookJsonFormatter />;
}
