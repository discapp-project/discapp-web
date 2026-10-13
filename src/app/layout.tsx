// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import BugReportButton from "./components/BugReportButton";
import "./globals.css";

// Interface for layout props
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
    url: "https://netlify.app",
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
        </div>
      </body>
    </html>
  );
}
