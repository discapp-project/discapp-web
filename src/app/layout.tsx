import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#acf6a5",
};

export const metadata: Metadata = {
  title: "Botless | All In One Toolkit",
  description: "Get access to every tool on Discord as well as libraries to help make your life much easier!",
  twitter: {
    card: "summary",
    title: "Botless | All In One Toolkit",
    description: "Get access to every tool on Discord as well as libraries to help make your life much easier!",
    images: ["https://cdn.discordapp.com/attachments/1556504385213702184/1556744994335756379/image.png?backend=b2&ex=6ac54741&is=6ac3f5c1&hm=bf3659ef192e8a254efbe3342b959bc9d9fa2b62e7eccb14532e59b91f3730b5&"],
  },
  openGraph: {
    title: "Botless | All In One Toolkit",
    description: "Get access to every tool on Discord as well as libraries to help make your life much easier!",
    images: [
      {
        url: "https://cdn.discordapp.com/attachments/1556504385213702184/1556744994335756379/image.png?backend=b2&ex=6ac54741&is=6ac3f5c1&hm=bf3659ef192e8a254efbe3342b959bc9d9fa2b62e7eccb14532e59b91f3730b5&",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Structure for Discord's component embed
  const discordComponentEmbed = {
    type: 1, // Container component
    components: [
      {
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            style: 5, // Link button style
            label: "Website",
            url: "https://botless.netlify.app/",
          },
          {
            type: 2, // Button
            style: 5, // Link button style
            label: "Discord Server",
            url: "https://discord.gg/ymc3Ba4qk9",
          },
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Inject the discord:component-embed JSON payload */}
        <script
          type="application/json"
          id="discord:component-embed"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(discordComponentEmbed),
          }}
        />
      </head>
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