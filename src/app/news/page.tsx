import type { Metadata } from "next";
import News from "./news";

export const metadata: Metadata = {
  title: "News | Discapp",
  description: "Latest announcements and updates from the Discapp platform.",
};

export default function NewsPage() {
  return <News />;
}
