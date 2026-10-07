// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

// Interface for layout props
interface RootLayoutProps {
  children: React.ReactNode;
}

export const viewport: Viewport = {
  themeColor: "#acf6a5",
};

export const metadata: Metadata = {
  title: "Botless | All In One Toolkit",
  description: "Get access to every tool on Discord as well as libraries to help make your life much easier!",
  openGraph: {
    title: "Botless | All In One Toolkit",
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
            <Link className="brand" href="/">BOTLESS</Link>
            <Link className="topbar-link" href="https://discord.gg">Join the Community!</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
