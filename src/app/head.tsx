// app/head.tsx

export default function Head() {
  const discordComponentEmbed = {
    component: {
      type: 17, // Container component
      accent_color: 11335333, // Hex #acf6a5 converted to decimal number
      components: [
        {
          type: 9, // Section component
          components: [
            {
              type: 10, // Text display component
              content: "**Botless | All In One Toolkit**\nGet access to every tool on Discord as well as libraries to help make your life much easier!"
            }
          ],
          accessory: {
            type: 11, // Thumbnail accessory format
            media: {
              // Ensure this points directly to your permanent production icon asset!
              url: "https://netlify.app"
            }
          }
        },
        {
          type: 14 // Separator line component
        },
        {
          type: 1, // Action Row component to hold buttons
          components: [
            {
              type: 2, // Button component
              style: 5, // Style 5 = Link button
              label: "Website",
              url: "https://netlify.app"
            },
            {
              type: 2,
              style: 5,
              label: "Discord Server",
              url: "https://discord.gg"
            }
          ]
        }
      ]
    }
  };

  return (
    <>
      {/* Essential metadata fallbacks for the Discord Crawler */}
      <meta property="og:title" content="Botless | All In One Toolkit" />
      <meta property="og:description" content="Get access to every tool on Discord as well as libraries to help make your life much easier!" />
      <meta property="og:url" content="https://netlify.app" />

      {/* Validated Discord Native Component Payload */}
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(discordComponentEmbed),
        }}
      />
    </>
  );
}
