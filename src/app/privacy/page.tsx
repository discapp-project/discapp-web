import type { Metadata } from "next";
import Privacy from "./privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Discapp",
  description: "Learn how we handle your privacy.",
};

export default function PrivacyPage() {
  return <Privacy />;
}
