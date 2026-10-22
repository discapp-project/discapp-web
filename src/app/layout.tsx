// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import BugReportButton from "./components/BugReportButton";
import "./globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const viewport: Viewport = {
  themeColor: "#acf6a5",
};

export const metadata: Metadata = {
  title: "Discapp | All In One Toolkit",
  description: "Get access to every tool on Discord as well as libraries to help make your life much easier!",
  openGraph: {
    title: "Discapp | All In One Toolkit",
    description: "Get access to every tool on Discord as well as libraries to help make your life much easier!",
    url: "https://discapp.org",
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <nav className="topbar" aria-label="Main navigation">
            <Link className="brand" href="/">DISCAPP</Link>
            <div className="topbar-actions">
              <Link className="topbar-link" href="https://discord.gg/ymc3Ba4qk9">Join the Community!</Link>
              <BugReportButton />
            </div>
          </nav>
          {children}
          <footer className="global-footer">
            <nav className="global-footer-links" aria-label="Footer">
              <a>© {new Date().getFullYear()} Discapp. All rights reserved.</a>
              <a href="mailto:support@discapp.org">support@discapp.org</a>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms-of-use">Terms of Use</Link>
            </nav>
            <p className="global-footer-disclaimer">
              Discapp is not endorsed by, directly affiliated with, maintained, authorized, or sponsored by Discord Inc.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}