# Botless

Botless currently provides a Discord Webhook Builder and an AutoMod Regex Library. The webhook builder supports message content, multiple rich embeds, up to 25 fields per embed, webhook identity overrides, mention controls, thread delivery, file uploads, payload inspection, and a live preview. The AutoMod library provides searchable regex rules, explanations, examples, copying, and a live tester.

The app runs from the workspace root. The builder lives in `src/app/webhook-builder/` and sends messages through `src/app/api/webhook/execute/route.ts`. The AutoMod library lives in `src/app/automod-library/`. The API accepts Discord webhook URLs only, caps uploads at 10 files and 24 MB total, and does not persist or log webhook URLs.

Webhook URLs are credentials. The browser sends the URL to this app's API route, which forwards it to Discord over HTTPS. Do not use a webhook URL you are not authorized to control.

## Run locally

From this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run lint
npm run build
npm start
```

