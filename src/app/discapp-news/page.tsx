import type { Metadata } from "next";
import DiscappNews from "./discapp-news";

export const metadata: Metadata = {
  title: "Discapp News | Discapp",
  description: "Latest announcements and updates from the Discapp platform.",
};

export default function DiscappNewsPage() {
  return <DiscappNews />;
}
