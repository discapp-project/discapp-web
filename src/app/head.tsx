// app/head.tsx

export default function Head() {
  const discordComponentEmbed = {
    component: {
      type: 17, 
      accent_color: 11335333, 
      components: [
        {
          type: 9, 
          components: [
            {
              type: 10, 
              content: "**Discapp | All In One Toolkit**\nGet access to every tool on Discord as well as libraries to help make your life much easier!"
            }
          ],
          accessory: {
            type: 11, 
            media: {
              url: "https://discapp.org"
            }
          }
        },
        {
          type: 14 
        },
        {
          type: 1, 
          components: [
            {
              type: 2, 
              style: 5, 
              label: "Website",
              url: "https://discapp.org"
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
      <meta property="og:title" content="Discapp | All In One Toolkit" />
      <meta property="og:description" content="Get access to every tool on Discord as well as libraries to help make your life much easier!" />
      <meta property="og:url" content="https://discapp.org" />

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
