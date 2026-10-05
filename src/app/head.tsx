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
              content: "# **[Botless | All In One Toolkit](https://botless.netlify.app/)**\nGet access to every tool on Discord as well as libraries to help make your life much easier!",
            },
          ],
          accessory: {
            type: 11,
            media: {
              url: "https://cdn.discordapp.com/attachments/1556504385213702184/1556744994335756379/image.png",
            },
          },
        },
        {
          type: 14,
        },
        {
          type: 1,
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
    <>
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
