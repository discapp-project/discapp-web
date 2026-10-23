// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import BugReportButton from "./components/BugReportButton";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const viewport: Viewport = {
  themeColor: "#acf6a5",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://discapp.org"),
  manifest: '/manifest.json',
  openGraph: {
    images: [
      {
        url: '/discapp-mini-nobg.png',
        width: 1200,
        height: 630,
        alt: 'Discapp Thumbnail',
      },
    ],
  },
  twitter: {
    card: 'summary',
    images: ['/discapp-mini-nobg.png'],
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.variable}>
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