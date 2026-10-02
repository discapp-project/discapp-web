import Link from "next/link";
import { ArrowUpRight, Webhook } from "lucide-react";

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
    </main>
  );
}
