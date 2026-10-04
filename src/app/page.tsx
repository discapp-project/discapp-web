import Link from "next/link";
import { ArrowUpRight, Webhook, Library, BadgePlus, LayoutPanelTop } from "lucide-react";
export default function Home() {
  return (
    <main className="page-wrap directory-page">
      <header className="directory-header">
        <p className="page-kicker">DISCORD TOOLS</p>
        <h1>Build for your community.</h1>
        <p>Compose, preview, and send webhook messages.</p>
      </header>
      
      <Link className="tool-link" href="/webhook-builder">
        <span className="tool-icon webhook-icon" aria-hidden="true"><Webhook size={19} /></span>
        <span className="tool-copy">
          <span className="tool-title">Webhook Builder</span>
          <span className="tool-description">Create Discord messages with embeds, delivery options, and live preview.</span>
        </span>
        <ArrowUpRight className="tool-arrow" size={16} aria-hidden="true" />
      </Link>

      <Link className="tool-link" href="/automod-library">
        <span className="tool-icon library-icon" aria-hidden="true"><Library size={19} /></span>
        <span className="tool-copy">
          <span className="tool-title">Automod Library</span>
          <span className="tool-description">View and copy automod rules and regexes.</span>
        </span>
        <ArrowUpRight className="tool-arrow" size={16} aria-hidden="true" />
      </Link>

      <Link className="tool-link" href="/role-icon-maker">
        <span className="tool-icon badge-plus" aria-hidden="true"><BadgePlus size={19} /></span>
        <span className="tool-copy">
          <span className="tool-title">Role Icon Maker</span>
          <span className="tool-description">Create custom role icons for your Discord server.</span>
        </span>
        <ArrowUpRight className="tool-arrow" size={16} aria-hidden="true" />
      </Link>

      <Link className="tool-link" href="/web-embed-builder">
        <span className="tool-icon layout-panel-top" aria-hidden="true"><LayoutPanelTop size={19} /></span>
        <span className="tool-copy">
          <span className="tool-title">Web Embed Builder</span>
          <span className="tool-description">Simple tool to help you configure discord embeds for your site!</span>
        </span>
        <ArrowUpRight className="tool-arrow" size={16} aria-hidden="true" />
      </Link>
    </main>
  );
}
