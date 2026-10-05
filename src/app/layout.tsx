import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#acf6a5",
};

export const metadata: Metadata = {
  title: "Botless | All In One Toolkit",
  description: "Get access to every tool on Discord as well as libraries to help make your life much easier!",
  openGraph: {
    title: "Botless | All In One Toolkit",
    description: "Get access to every tool on Discord as well as libraries to help make your life much easier!",
    images: [
      {
        url: "https://cdn.discordapp.com/attachments/1556504385213702184/1556744994335756379/image.png?backend=b2&ex=6ac54741&is=6ac3f5c1&hm=bf3659ef192e8a254efbe3342b959bc9d9fa2b62e7eccb14532e59b91f3730b5&",
      },
    ],
  },
  other: {
    "discord:button:0:label": "Website",
    "discord:button:0:url": "https://botless.netlify.app/",
    "discord:button:1:label": "Discord Server",
    "discord:button:1:url": "https://discord.gg/ymc3Ba4qk9",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <nav className="topbar" aria-label="Main navigation">
            <Link className="brand" href="/">BOTLESS</Link>
            <Link className="topbar-link" href="https://discord.gg/ymc3Ba4qk9">Community</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}