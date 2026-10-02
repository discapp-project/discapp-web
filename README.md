# Botless

Botless currently provides one tool: a Discord Webhook Builder. It supports message content, multiple rich embeds, up to 25 fields per embed, webhook identity overrides, mention controls, thread delivery, file uploads, payload inspection, and a live preview.

The app runs from the workspace root. The builder lives in `src/app/webhook-builder/` and sends messages through `src/app/api/webhook/execute/route.ts`. The API accepts Discord webhook URLs only, caps uploads at 10 files and 24 MB total, and does not persist or log webhook URLs.

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

