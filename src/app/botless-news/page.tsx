import type { Metadata } from "next";
import BotlessNews from "./botless-news";

export const metadata: Metadata = {
  title: "Botless News | Botless",
  description: "Latest announcements and updates from the Botless platform.",
};

export default function BotlessNewsPage() {
  return <BotlessNews />;
}
