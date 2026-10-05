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
    url: "https://botless.netlify.app/",
    images: [
      {
        url: "https://cdn.discordapp.com/attachments/1556504385213702184/1556744994335756379/image.png?backend=b2&ex=6ac54741&is=6ac3f5c1&hm=bf3659ef192e8a254efbe3342b959bc9d9fa2b62e7eccb14532e59b91f3730b5&",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Configured according to Discord Components V2 schema
  const discordComponentEmbed = {
    component: {
      type: 17, // Container type
      accent_color: 11335333, // Hex #acf6a5 converted to decimal
      components: [
        {
          type: 9, // Section component
          components: [
            {
              type: 10, // Text display
              content: "# **[Botless | All In One Toolkit](https://botless.netlify.app/)**\nGet access to every tool on Discord as well as libraries to help make your life much easier!",
            },
          ],
          accessory: {
            type: 11, // Thumbnail image accessory
            media: {
              url: "https://cdn.discordapp.com/attachments/1556504385213702184/1556744994335756379/image.png?backend=b2&ex=6ac54741&is=6ac3f5c1&hm=bf3659ef192e8a254efbe3342b959bc9d9fa2b62e7eccb14532e59b91f3730b5&",
            },
          },
        },
        {
          type: 14, // Divider spacing
        },
        {
          type: 1, // Action row for buttons
          components: [
            {
              type: 2,
              style: 5,
              label: "Website",
              url: "https://botless.netlify.app/",
            },
            {
              type: 2,
              style: 5,
              label: "Discord Server",
              url: "https://discord.gg/ymc3Ba4qk9",
            },
          ],
        },
      ],
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          id="discord:component-embed"
          type="application/vnd.discord.component-embed+json"
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