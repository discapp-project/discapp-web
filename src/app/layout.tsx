import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Botless | Discord Creator Toolkit",
  description: "Free, browser-based utilities for Discord creators and community administrators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <nav className="topbar" aria-label="Main navigation">
            <Link className="brand" href="/">BOTLESS</Link>
            <Link className="topbar-link" href="https://discord.gg/ymc3Ba4qk9">Support</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
