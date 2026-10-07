"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlignLeft,
  Code2,
  Eye,
  EyeOff,
  ExternalLink,
  Grid,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Minus,
  Plus,
  Radio,
  Send,
  SeparatorHorizontal,
  Settings,
  Sparkles,
  Trash2,
  Check,
} from "lucide-react";

type Tab = "message" | "embeds" | "delivery" | "json" | "preview";
type EmbedMode = "standard" | "cv2";
type CompV2BlockType = "text" | "button" | "separator" | "fields" | "media" | "action_row";

type CompV2Button = {
  id: string;
  label: string;
  style: "primary" | "secondary" | "success" | "danger" | "link";
  customId?: string;
  url?: string;
  disabled?: boolean;
};

type EmbedFieldDraft = { id: string; name: string; value: string; inline: boolean };

type CompV2Block = {
  id: string;
  type: CompV2BlockType;
  content?: string;
  separatorStyle?: "line" | "blank";
  buttons?: CompV2Button[];
  fields?: EmbedFieldDraft[];
  mediaUrl?: string;
};

type EmbedDraft = {
  id: string;
  mode: EmbedMode;
  hasColor: boolean;
  color: string;
  authorName: string;
  authorUrl: string;
  authorIconUrl: string;
  title: string;
  titleUrl: string;
  description: string;
  thumbnailUrl: string;
  imageUrl: string;
  footerText: string;
  footerIconUrl: string;
  timestamp: string;
  fields: EmbedFieldDraft[];
  blocks: CompV2Block[];
};

type SendResult = { kind: "success" | "error"; message: string };

type DiscordEmbed = {
  author?: { name: string; url?: string; icon_url?: string };
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  thumbnail?: { url: string };
  image?: { url: string };
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  components?: unknown[];
};

const emptyEmbed = (id: string, mode: EmbedMode = "standard"): EmbedDraft => ({
  id,
  mode,
  hasColor: true,
  color: "#5865f2",
  authorName: "",
  authorUrl: "",
  authorIconUrl: "",
  title: "",
  titleUrl: "",
  description: "",
  thumbnailUrl: "",
  imageUrl: "",
  footerText: "",
  footerIconUrl: "",
  timestamp: "",
  fields: [],
  blocks: [],
});

function buttonStyleToType(style: CompV2Button["style"]) {
  switch (style) {
    case "primary": return 1;
    case "secondary": return 2;
    case "success": return 3;
    case "danger": return 4;
    case "link": return 5;
    default: return 1;
  }
}

function toDiscordCompV2Component(block: CompV2Block) {
  switch (block.type) {
    case "text":
      return { type: 10, content: block.content ?? "" };
    case "separator":
      return { type: 11, divider: block.separatorStyle === "line" };
    case "action_row":
    case "button":
      return {
        type: 1,
        components: (block.buttons ?? []).map((btn) => ({
          type: 2,
          style: buttonStyleToType(btn.style),
          label: btn.label,
          ...(btn.style === "link" ? { url: btn.url ?? "" } : { custom_id: btn.customId ?? `btn_${btn.id}` }),
          disabled: !!btn.disabled,
        })),
      };
    case "media":
      return { type: 12, items: block.mediaUrl ? [{ media: { url: block.mediaUrl } }] : [] };
    default:
      return null;
  }
}

function toDiscordEmbed(draft: EmbedDraft): DiscordEmbed | null {
  const embed: DiscordEmbed = {};

  if (draft.mode === "standard") {
    if (draft.authorName.trim()) {
      embed.author = {
        name: draft.authorName.trim(),
        ...(draft.authorUrl.trim() && { url: draft.authorUrl.trim() }),
        ...(draft.authorIconUrl.trim() && { icon_url: draft.authorIconUrl.trim() }),
      };
    }

    if (draft.title.trim()) embed.title = draft.title.trim();
    if (draft.titleUrl.trim()) embed.url = draft.titleUrl.trim();
    if (draft.description.trim()) embed.description = draft.description.trim();

    if (draft.hasColor && draft.color) {
      embed.color = Number.parseInt(draft.color.replace("#", ""), 16);
    }

    if (draft.thumbnailUrl.trim()) embed.thumbnail = { url: draft.thumbnailUrl.trim() };
    if (draft.imageUrl.trim()) embed.image = { url: draft.imageUrl.trim() };

    if (draft.footerText.trim()) {
      embed.footer = {
        text: draft.footerText.trim(),
        ...(draft.footerIconUrl.trim() && { icon_url: draft.footerIconUrl.trim() }),
      };
    }

    if (draft.timestamp) {
      const ts = new Date(draft.timestamp);
      if (!Number.isNaN(ts.getTime())) embed.timestamp = ts.toISOString();
    }

    const fields = draft.fields
      .filter((field) => field.name.trim() && field.value.trim())
      .map((field) => ({ name: field.name.trim(), value: field.value.trim(), inline: field.inline }));

    if (fields.length) embed.fields = fields;
  } else {
    // Components V2 Mode
    if (draft.hasColor && draft.color) {
      embed.color = Number.parseInt(draft.color.replace("#", ""), 16);
    }

    const fieldBlocks = draft.blocks.filter((b) => b.type === "fields");
    const fields = fieldBlocks
      .flatMap((b) => b.fields ?? [])
      .filter((field) => field.name.trim() && field.value.trim())
      .map((field) => ({ name: field.name.trim(), value: field.value.trim(), inline: field.inline }));

    if (fields.length) embed.fields = fields;

    const compV2Components = draft.blocks
      .filter((b) => b.type !== "fields")
      .map(toDiscordCompV2Component)
      .filter((c): c is NonNullable<ReturnType<typeof toDiscordCompV2Component>> => c !== null);

    if (compV2Components.length > 0) embed.components = compV2Components;
  }

  return Object.keys(embed).length > 0 ? embed : null;
}

function Control({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#b5bac1", fontWeight: 600 }}>
        <span>{label}</span>
        {maxLength !== undefined && <span style={{ opacity: 0.6 }}>{value.length}/{maxLength}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "6px",
          border: "1px solid #1e1f22",
          backgroundColor: "#1e1f22",
          color: "#f2f3f5",
          fontSize: "13px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function DiscordButtonPreview({ btn }: { btn: CompV2Button }) {
  const getStyles = () => {
    switch (btn.style) {
      case "primary": return { bg: "#5865f2", color: "#fff" };
      case "secondary": return { bg: "#4e5058", color: "#fff" };
      case "success": return { bg: "#23a55a", color: "#fff" };
      case "danger": return { bg: "#f23f43", color: "#fff" };
      case "link": return { bg: "#4e5058", color: "#b5bac1" };
      default: return { bg: "#5865f2", color: "#fff" };
    }
  };

  const style = getStyles();

  return (
    <button
      type="button"
      disabled={btn.disabled}
      style={{
        padding: "8px 16px",
        backgroundColor: style.bg,
        color: style.color,
        border: "none",
        borderRadius: "3px",
        fontWeight: 500,
        fontSize: "13px",
        cursor: btn.disabled ? "not-allowed" : "pointer",
        opacity: btn.disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span>{btn.label || "Button"}</span>
      {btn.style === "link" && <ExternalLink size={12} />}
    </button>
  );
}

export default function WebhookBuilder() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showWebhookUrl, setShowWebhookUrl] = useState(false);
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [threadId, setThreadId] = useState("");
  const [tts, setTts] = useState(false);
  const [useCompV2, setUseCompV2] = useState(true);
  const [suppressNotifications, setSuppressNotifications] = useState(false);
  const [embeds, setEmbeds] = useState<EmbedDraft[]>([]);
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("message");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  // Raw JSON state for editable JSON editor
  const [rawJsonInput, setRawJsonInput] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const activeEmbed = embeds.find((embed) => embed.id === activeEmbedId) ?? embeds[0] ?? null;
  const discordEmbeds = useMemo(() => embeds.map(toDiscordEmbed).filter((e): e is DiscordEmbed => e !== null), [embeds]);

  const payload = useMemo(() => {
    let flags = 0;
    if (suppressNotifications) flags |= 4096;
    if (useCompV2) flags |= 8192;

    return {
      ...(content.length > 0 && { content }),
      ...(username.trim() && { username: username.trim() }),
      ...(avatarUrl.trim() && { avatar_url: avatarUrl.trim() }),
      ...(tts && { tts: true }),
      ...(discordEmbeds.length > 0 && { embeds: discordEmbeds }),
      ...(flags > 0 && { flags }),
    };
  }, [avatarUrl, content, discordEmbeds, suppressNotifications, tts, useCompV2, username]);

  const payloadJson = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  // Keep json editor content in sync unless user is editing
  const jsonEditorValue = rawJsonInput !== null ? rawJsonInput : payloadJson;

  const handleApplyJson = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonEditorValue);

      if (typeof parsed.content === "string") setContent(parsed.content);
      if (typeof parsed.username === "string") setUsername(parsed.username);
      if (typeof parsed.avatar_url === "string") setAvatarUrl(parsed.avatar_url);
      if (typeof parsed.tts === "boolean") setTts(parsed.tts);

      if (typeof parsed.flags === "number") {
        setSuppressNotifications((parsed.flags & 4096) !== 0);
        setUseCompV2((parsed.flags & 8192) !== 0);
      }

      if (Array.isArray(parsed.embeds)) {
        const importedEmbeds: EmbedDraft[] = parsed.embeds.map((emb: DiscordEmbed) => {
          const id = crypto.randomUUID();
          return {
            id,
            mode: "standard",
            hasColor: emb.color !== undefined,
            color: emb.color ? `#${emb.color.toString(16).padStart(6, "0")}` : "#5865f2",
            authorName: emb.author?.name ?? "",
            authorUrl: emb.author?.url ?? "",
            authorIconUrl: emb.author?.icon_url ?? "",
            title: emb.title ?? "",
            titleUrl: emb.url ?? "",
            description: emb.description ?? "",
            thumbnailUrl: emb.thumbnail?.url ?? "",
            imageUrl: emb.image?.url ?? "",
            footerText: emb.footer?.text ?? "",
            footerIconUrl: emb.footer?.icon_url ?? "",
            timestamp: emb.timestamp ? new Date(emb.timestamp).toISOString().slice(0, 16) : "",
            fields: Array.isArray(emb.fields)
              ? emb.fields.map((f) => ({
                  id: crypto.randomUUID(),
                  name: f.name,
                  value: f.value,
                  inline: !!f.inline,
                }))
              : [],
            blocks: [],
          };
        });

        setEmbeds(importedEmbeds);
        if (importedEmbeds.length > 0) setActiveEmbedId(importedEmbeds[0].id);
      }

      setRawJsonInput(null);
      setResult({ kind: "success", message: "JSON imported and applied successfully." });
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON format.");
    }
  };

  const deleteWebhookFromDiscord = async () => {
    if (!webhookUrl.trim()) return;
    if (!confirm("Are you sure you want to permanently delete this webhook from Discord?")) return;

    try {
      const res = await fetch(webhookUrl.trim(), { method: "DELETE" });
      if (res.ok) {
        setWebhookUrl("");
        setResult({ kind: "success", message: "Webhook permanently deleted from Discord." });
      } else {
        setResult({ kind: "error", message: `Failed to delete webhook (${res.status}).` });
      }
    } catch {
      setResult({ kind: "error", message: "Network error while attempting to delete webhook." });
    }
  };

  const updateEmbed = (id: string, changes: Partial<EmbedDraft>) => {
    setEmbeds((current) => current.map((embed) => (embed.id === id ? { ...embed, ...changes } : embed)));
  };

  const addEmbed = (mode: EmbedMode = "standard") => {
    if (embeds.length >= 10) return;
    const nextEmbed = emptyEmbed(crypto.randomUUID(), mode);
    setEmbeds((current) => [...current, nextEmbed]);
    setActiveEmbedId(nextEmbed.id);
    setActiveTab("embeds");
  };

  const removeEmbed = (id: string) => {
    const nextEmbeds = embeds.filter((embed) => embed.id !== id);
    setEmbeds(nextEmbeds);
    setActiveEmbedId(nextEmbeds[0]?.id ?? null);
  };

  const addBlockToEmbed = (type: CompV2BlockType) => {
    if (!activeEmbed) return;
    const newBlock: CompV2Block = {
      id: crypto.randomUUID(),
      type,
      ...(type === "text" && { content: "" }),
      ...(type === "separator" && { separatorStyle: "line" }),
      ...(type === "action_row" && {
        buttons: [{ id: crypto.randomUUID(), label: "Button", style: "primary", customId: `btn_${Date.now()}` }],
      }),
      ...(type === "fields" && { fields: [{ id: crypto.randomUUID(), name: "", value: "", inline: false }] }),
      ...(type === "media" && { mediaUrl: "" }),
    };

    updateEmbed(activeEmbed.id, { blocks: [...activeEmbed.blocks, newBlock] });
  };

  const updateBlock = (blockId: string, changes: Partial<CompV2Block>) => {
    if (!activeEmbed) return;
    updateEmbed(activeEmbed.id, {
      blocks: activeEmbed.blocks.map((b) => (b.id === blockId ? { ...b, ...changes } : b)),
    });
  };

  const removeBlock = (blockId: string) => {
    if (!activeEmbed) return;
    updateEmbed(activeEmbed.id, {
      blocks: activeEmbed.blocks.filter((b) => b.id !== blockId),
    });
  };

  const sendWebhook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/webhook/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: rawJsonInput !== null ? rawJsonInput : payloadJson,
      });
      setResult({
        kind: response.ok ? "success" : "error",
        message: response.ok ? "Webhook delivered successfully." : `Status ${response.status}`,
      });
    } catch {
      setResult({ kind: "error", message: "Failed to send payload." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto", color: "#f2f3f5", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Discord Webhook Builder</h1>
        <p style={{ color: "#949ba4", fontSize: "14px", marginTop: "4px" }}>Design standard embeds or build custom Components V2 embeds</p>
      </header>

      <form onSubmit={sendWebhook}>
        {/* Top Control Panel */}
        <div style={{ backgroundColor: "#2b2d31", padding: "20px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #35363c" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#b5bac1", letterSpacing: "0.5px" }}>DISCORD WEBHOOK URL</span>
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                type="button"
                onClick={() => setShowWebhookUrl((v) => !v)}
                style={{ background: "none", border: "none", color: "#b5bac1", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {showWebhookUrl ? <EyeOff size={14} /> : <Eye size={14} />} Toggle Visibility
              </button>
              {webhookUrl && (
                <button
                  type="button"
                  onClick={deleteWebhookFromDiscord}
                  style={{ background: "none", border: "none", color: "#f23f43", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={14} /> Delete Webhook
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type={showWebhookUrl ? "text" : "password"}
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: "6px", border: "1px solid #1e1f22", backgroundColor: "#1e1f22", color: "#fff", fontSize: "14px" }}
            />
            {webhookUrl && (
              <button
                type="button"
                onClick={() => setWebhookUrl("")}
                style={{ padding: "10px 16px", backgroundColor: "#313338", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={isSending}
              style={{ padding: "10px 20px", backgroundColor: "#23a55a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Send size={16} />
              {isSending ? "Sending..." : "Send Webhook"}
            </button>
          </div>
          {result && (
            <div style={{ marginTop: "12px", padding: "10px", borderRadius: "6px", backgroundColor: result.kind === "success" ? "rgba(35, 165, 90, 0.15)" : "rgba(242, 63, 67, 0.15)", border: `1px solid ${result.kind === "success" ? "#23a55a" : "#f23f43"}`, color: result.kind === "success" ? "#23a55a" : "#f23f43", fontSize: "13px" }}>
              {result.message}
            </div>
          )}
        </div>

        {/* Builder View */}
        <div>
          {/* Main Navigation Tabs */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #35363c", marginBottom: "20px" }}>
            {[
              { id: "message", label: "Message", icon: MessageSquare },
              { id: "embeds", label: `Embeds (${embeds.length})`, icon: Layers },
              { id: "delivery", label: "Delivery", icon: Settings },
              { id: "json", label: "JSON", icon: Code2 },
              { id: "preview", label: "Preview", icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as Tab)}
                  style={{
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === tab.id ? "2px solid #5865f2" : "2px solid transparent",
                    color: activeTab === tab.id ? "#fff" : "#949ba4",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* MESSAGE TAB */}
          {activeTab === "message" && (
            <div style={{ backgroundColor: "#2b2d31", padding: "20px", borderRadius: "8px", border: "1px solid #35363c" }}>
              <Control label="Main Message Content" value={content} onChange={setContent} maxLength={2000} placeholder="Type standard message content or leave empty if sending only embeds..." />
            </div>
          )}

          {/* EMBEDS TAB */}
          {activeTab === "embeds" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", color: "#b5bac1", fontWeight: 600 }}>EMBED STACK ({embeds.length}/10)</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => addEmbed("standard")}
                    style={{ padding: "8px 14px", backgroundColor: "#5865f2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Plus size={14} /> Add Standard Embed
                  </button>
                  <button
                    type="button"
                    onClick={() => addEmbed("cv2")}
                    style={{ padding: "8px 14px", backgroundColor: "#313338", color: "#fff", border: "1px solid #5865f2", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Sparkles size={14} color="#5865f2" /> Add Components V2 Canvas
                  </button>
                </div>
              </div>

              {/* Embed List Selector */}
              {embeds.length > 0 && (
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
                  {embeds.map((e, idx) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setActiveEmbedId(e.id)}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: activeEmbed?.id === e.id ? "#35363c" : "#2b2d31",
                        color: activeEmbed?.id === e.id ? "#fff" : "#949ba4",
                        border: activeEmbed?.id === e.id ? "1px solid #5865f2" : "1px solid transparent",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {e.mode === "cv2" ? <Sparkles size={12} color="#5865f2" /> : null}
                      <span>{e.title || `Embed #${idx + 1}`}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeEmbed && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", backgroundColor: "#2b2d31", padding: "20px", borderRadius: "8px", border: "1px solid #35363c" }}>
                  {/* Mode Selector Toggle */}
                  <div style={{ display: "flex", backgroundColor: "#1e1f22", borderRadius: "6px", padding: "4px", border: "1px solid #35363c" }}>
                    <button
                      type="button"
                      onClick={() => updateEmbed(activeEmbed.id, { mode: "standard" })}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: activeEmbed.mode === "standard" ? "#35363c" : "transparent",
                        color: activeEmbed.mode === "standard" ? "#fff" : "#949ba4",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Standard Embed
                    </button>
                    <button
                      type="button"
                      onClick={() => updateEmbed(activeEmbed.id, { mode: "cv2" })}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: activeEmbed.mode === "cv2" ? "#35363c" : "transparent",
                        color: activeEmbed.mode === "cv2" ? "#fff" : "#949ba4",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Sparkles size={14} color="#5865f2" /> Components V2 Canvas
                    </button>
                  </div>

                  {/* Accent Color Toggle */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#1e1f22", padding: "14px", borderRadius: "6px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", userSelect: "none" }}>
                      <input
                        type="checkbox"
                        checked={activeEmbed.hasColor}
                        onChange={(e) => updateEmbed(activeEmbed.id, { hasColor: e.target.checked })}
                      />
                      <span style={{ fontWeight: 600 }}>Enable Accent Side Strip Color</span>
                    </label>
                    {activeEmbed.hasColor && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="color"
                          value={activeEmbed.color}
                          onChange={(e) => updateEmbed(activeEmbed.id, { color: e.target.value })}
                          style={{ border: "none", background: "none", cursor: "pointer", width: "36px", height: "36px" }}
                        />
                        <input
                          type="text"
                          value={activeEmbed.color}
                          onChange={(e) => updateEmbed(activeEmbed.id, { color: e.target.value })}
                          style={{ flex: 1, padding: "8px 12px", borderRadius: "4px", border: "1px solid #35363c", backgroundColor: "#2b2d31", color: "#fff", fontSize: "13px" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* STANDARD EMBED FORM */}
                  {activeEmbed.mode === "standard" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {/* Author */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#b5bac1", letterSpacing: "0.5px" }}>AUTHOR</span>
                        <Control label="Author Name" value={activeEmbed.authorName} onChange={(val) => updateEmbed(activeEmbed.id, { authorName: val })} maxLength={256} />
                        <Control label="Author URL" value={activeEmbed.authorUrl} onChange={(val) => updateEmbed(activeEmbed.id, { authorUrl: val })} placeholder="https://..." />
                        <Control label="Author Icon URL" value={activeEmbed.authorIconUrl} onChange={(val) => updateEmbed(activeEmbed.id, { authorIconUrl: val })} placeholder="https://..." />
                      </div>

                      {/* Title & Body */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#b5bac1", letterSpacing: "0.5px" }}>TITLE & DESCRIPTION</span>
                        <Control label="Title" value={activeEmbed.title} onChange={(val) => updateEmbed(activeEmbed.id, { title: val })} maxLength={256} />
                        <Control label="Title URL" value={activeEmbed.titleUrl} onChange={(val) => updateEmbed(activeEmbed.id, { titleUrl: val })} placeholder="https://..." />
                        <Control label="Description" value={activeEmbed.description} onChange={(val) => updateEmbed(activeEmbed.id, { description: val })} maxLength={4096} />
                      </div>

                      {/* Media */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#b5bac1", letterSpacing: "0.5px" }}>MEDIA ATTACHMENTS</span>
                        <Control label="Thumbnail URL" value={activeEmbed.thumbnailUrl} onChange={(val) => updateEmbed(activeEmbed.id, { thumbnailUrl: val })} placeholder="https://..." />
                        <Control label="Banner Image URL" value={activeEmbed.imageUrl} onChange={(val) => updateEmbed(activeEmbed.id, { imageUrl: val })} placeholder="https://..." />
                      </div>

                      {/* Standard Fields */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#b5bac1", letterSpacing: "0.5px" }}>FIELDS</span>
                        {activeEmbed.fields.map((field, fIdx) => (
                          <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#232428", padding: "12px", borderRadius: "6px", border: "1px solid #2b2d31" }}>
                            <Control label="Field Name" value={field.name} onChange={(val) => {
                              const next = [...activeEmbed.fields];
                              next[fIdx].name = val;
                              updateEmbed(activeEmbed.id, { fields: next });
                            }} />
                            <Control label="Field Value" value={field.value} onChange={(val) => {
                              const next = [...activeEmbed.fields];
                              next[fIdx].value = val;
                              updateEmbed(activeEmbed.id, { fields: next });
                            }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#b5bac1", cursor: "pointer" }}>
                                <input type="checkbox" checked={field.inline} onChange={(e) => {
                                  const next = [...activeEmbed.fields];
                                  next[fIdx].inline = e.target.checked;
                                  updateEmbed(activeEmbed.id, { fields: next });
                                }} /> Inline Field
                              </label>
                              <button type="button" onClick={() => {
                                const next = activeEmbed.fields.filter((_, i) => i !== fIdx);
                                updateEmbed(activeEmbed.id, { fields: next });
                              }} style={{ background: "none", border: "none", color: "#f23f43", cursor: "pointer", fontSize: "12px" }}>
                                Remove Field
                              </button>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => updateEmbed(activeEmbed.id, { fields: [...activeEmbed.fields, { id: crypto.randomUUID(), name: "", value: "", inline: false }] })} style={{ padding: "8px 12px", backgroundColor: "#1e1f22", color: "#fff", border: "1px solid #35363c", borderRadius: "6px", fontSize: "12px", cursor: "pointer", alignSelf: "flex-start", fontWeight: 600 }}>
                          + Add Field
                        </button>
                      </div>

                      {/* Footer & Timestamp */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#b5bac1", letterSpacing: "0.5px" }}>FOOTER & TIMESTAMP</span>
                        <Control label="Footer Text" value={activeEmbed.footerText} onChange={(val) => updateEmbed(activeEmbed.id, { footerText: val })} maxLength={2048} />
                        <Control label="Footer Icon URL" value={activeEmbed.footerIconUrl} onChange={(val) => updateEmbed(activeEmbed.id, { footerIconUrl: val })} placeholder="https://..." />
                        <Control label="Timestamp" type="datetime-local" value={activeEmbed.timestamp} onChange={(val) => updateEmbed(activeEmbed.id, { timestamp: val })} />
                      </div>
                    </div>
                  )}

                  {/* COMPONENTS V2 CANVAS MODE */}
                  {activeEmbed.mode === "cv2" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ backgroundColor: "#232428", padding: "16px", borderRadius: "8px", border: "1px dashed #35363c" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#b5bac1", display: "block", marginBottom: "10px", letterSpacing: "0.5px" }}>ADD COMPONENTS TO CANVAS</span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button type="button" onClick={() => addBlockToEmbed("text")} style={{ padding: "8px 12px", backgroundColor: "#2b2d31", color: "#fff", border: "1px solid #35363c", borderRadius: "6px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><AlignLeft size={14} /> Text</button>
                          <button type="button" onClick={() => addBlockToEmbed("fields")} style={{ padding: "8px 12px", backgroundColor: "#2b2d31", color: "#fff", border: "1px solid #35363c", borderRadius: "6px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><Grid size={14} /> Fields</button>
                          <button type="button" onClick={() => addBlockToEmbed("action_row")} style={{ padding: "8px 12px", backgroundColor: "#2b2d31", color: "#fff", border: "1px solid #35363c", borderRadius: "6px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><Radio size={14} /> Action Row (Buttons)</button>
                          <button type="button" onClick={() => addBlockToEmbed("separator")} style={{ padding: "8px 12px", backgroundColor: "#2b2d31", color: "#fff", border: "1px solid #35363c", borderRadius: "6px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><SeparatorHorizontal size={14} /> Separator</button>
                          <button type="button" onClick={() => addBlockToEmbed("media")} style={{ padding: "8px 12px", backgroundColor: "#2b2d31", color: "#fff", border: "1px solid #35363c", borderRadius: "6px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><ImageIcon size={14} /> Media Block</button>
                        </div>
                      </div>

                      {/* Canvas Empty State */}
                      {activeEmbed.blocks.length === 0 && (
                        <div style={{ padding: "40px 20px", textAlign: "center", color: "#949ba4", border: "2px dashed #2b2d31", borderRadius: "8px" }}>
                          <p style={{ fontSize: "14px", fontWeight: 600 }}>Blank Canvas</p>
                          <p style={{ fontSize: "12px", marginTop: "4px" }}>Click any button above to build your custom embed UI</p>
                        </div>
                      )}

                      {/* Canvas Component Stack */}
                      {activeEmbed.blocks.map((block) => (
                        <div key={block.id} style={{ backgroundColor: "#232428", padding: "16px", borderRadius: "8px", border: "1px solid #2b2d31", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#949ba4", letterSpacing: "0.5px" }}>
                            <span>COMPONENT: {block.type.toUpperCase()}</span>
                            <button type="button" onClick={() => removeBlock(block.id)} style={{ background: "none", border: "none", color: "#f23f43", cursor: "pointer" }}><Trash2 size={14} /></button>
                          </div>

                          {/* Text Component */}
                          {block.type === "text" && (
                            <Control label="Text Content" value={block.content ?? ""} onChange={(val) => updateBlock(block.id, { content: val })} placeholder="Type text block content..." />
                          )}

                          {/* Fields Component */}
                          {block.type === "fields" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {(block.fields ?? []).map((field, fIdx) => (
                                <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#1e1f22", padding: "10px", borderRadius: "6px" }}>
                                  <Control label="Field Name" value={field.name} onChange={(val) => {
                                    const nextFields = [...(block.fields ?? [])];
                                    nextFields[fIdx].name = val;
                                    updateBlock(block.id, { fields: nextFields });
                                  }} />
                                  <Control label="Field Value" value={field.value} onChange={(val) => {
                                    const nextFields = [...(block.fields ?? [])];
                                    nextFields[fIdx].value = val;
                                    updateBlock(block.id, { fields: nextFields });
                                  }} />
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#b5bac1", cursor: "pointer" }}>
                                      <input type="checkbox" checked={field.inline} onChange={(e) => {
                                        const nextFields = [...(block.fields ?? [])];
                                        nextFields[fIdx].inline = e.target.checked;
                                        updateBlock(block.id, { fields: nextFields });
                                      }} /> Inline
                                    </label>
                                    <button type="button" onClick={() => {
                                      const nextFields = (block.fields ?? []).filter((_, i) => i !== fIdx);
                                      updateBlock(block.id, { fields: nextFields });
                                    }} style={{ background: "none", border: "none", color: "#f23f43", cursor: "pointer", fontSize: "12px" }}>Remove</button>
                                  </div>
                                </div>
                              ))}
                              <button type="button" onClick={() => updateBlock(block.id, { fields: [...(block.fields ?? []), { id: crypto.randomUUID(), name: "", value: "", inline: false }] })} style={{ padding: "6px 12px", backgroundColor: "#1e1f22", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer", alignSelf: "flex-start", fontWeight: 500 }}>+ Add Field</button>
                            </div>
                          )}

                          {/* Action Row Component */}
                          {block.type === "action_row" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {(block.buttons ?? []).map((btn, bIdx) => (
                                <div key={btn.id} style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#1e1f22", padding: "10px", borderRadius: "6px" }}>
                                  <Control label="Button Label" value={btn.label} onChange={(val) => {
                                    const nextBtns = [...(block.buttons ?? [])];
                                    nextBtns[bIdx].label = val;
                                    updateBlock(block.id, { buttons: nextBtns });
                                  }} />
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ fontSize: "12px", color: "#b5bac1", fontWeight: 600 }}>Button Style</span>
                                    <select value={btn.style} onChange={(e) => {
                                      const nextBtns = [...(block.buttons ?? [])];
                                      nextBtns[bIdx].style = e.target.value as CompV2Button["style"];
                                      updateBlock(block.id, { buttons: nextBtns });
                                    }} style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2b2d31", border: "1px solid #35363c", color: "#fff", borderRadius: "4px", fontSize: "13px" }}>
                                      <option value="primary">Primary (Blue)</option>
                                      <option value="secondary">Secondary (Grey)</option>
                                      <option value="success">Success (Green)</option>
                                      <option value="danger">Danger (Red)</option>
                                      <option value="link">Link (URL)</option>
                                    </select>
                                  </div>
                                  {btn.style === "link" ? (
                                    <Control label="URL Link" value={btn.url ?? ""} onChange={(val) => {
                                      const nextBtns = [...(block.buttons ?? [])];
                                      nextBtns[bIdx].url = val;
                                      updateBlock(block.id, { buttons: nextBtns });
                                    }} placeholder="https://..." />
                                  ) : (
                                    <Control label="Custom ID" value={btn.customId ?? ""} onChange={(val) => {
                                      const nextBtns = [...(block.buttons ?? [])];
                                      nextBtns[bIdx].customId = val;
                                      updateBlock(block.id, { buttons: nextBtns });
                                    }} placeholder="custom_id" />
                                  )}
                                  <button type="button" onClick={() => {
                                    const nextBtns = (block.buttons ?? []).filter((_, i) => i !== bIdx);
                                    updateBlock(block.id, { buttons: nextBtns });
                                  }} style={{ background: "none", border: "none", color: "#f23f43", cursor: "pointer", fontSize: "12px", alignSelf: "flex-end" }}>Remove Button</button>
                                </div>
                              ))}
                              {(block.buttons ?? []).length < 5 && (
                                <button type="button" onClick={() => updateBlock(block.id, { buttons: [...(block.buttons ?? []), { id: crypto.randomUUID(), label: "Button", style: "primary", customId: `btn_${Date.now()}` }] })} style={{ padding: "6px 12px", backgroundColor: "#1e1f22", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer", alignSelf: "flex-start", fontWeight: 500 }}>+ Add Button</button>
                              )}
                            </div>
                          )}

                          {/* Separator Component */}
                          {block.type === "separator" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ fontSize: "12px", color: "#b5bac1", fontWeight: 600 }}>Separator Type</span>
                              <select value={block.separatorStyle ?? "line"} onChange={(e) => updateBlock(block.id, { separatorStyle: e.target.value as "line" | "blank" })} style={{ width: "100%", padding: "8px 10px", backgroundColor: "#1e1f22", border: "1px solid #35363c", color: "#fff", borderRadius: "4px", fontSize: "13px" }}>
                                <option value="line">Divider Line</option>
                                <option value="blank">Blank Space</option>
                              </select>
                            </div>
                          )}

                          {/* Media Component */}
                          {block.type === "media" && (
                            <Control label="Media URL" value={block.mediaUrl ?? ""} onChange={(val) => updateBlock(block.id, { mediaUrl: val })} placeholder="https://..." />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="button" onClick={() => removeEmbed(activeEmbed.id)} style={{ color: "#f23f43", background: "none", border: "none", cursor: "pointer", fontSize: "13px", alignSelf: "flex-start", marginTop: "10px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Trash2 size={14} /> Delete Embed
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DELIVERY SETTINGS TAB */}
          {activeTab === "delivery" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#2b2d31", padding: "20px", borderRadius: "8px", border: "1px solid #35363c" }}>
              <Control label="Custom Webhook Username" value={username} onChange={setUsername} placeholder="Overrides default webhook name" />
              <Control label="Custom Webhook Avatar URL" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://..." />
              <Control label="Thread ID" value={threadId} onChange={setThreadId} placeholder="Target thread ID" />
              
              <div style={{ borderTop: "1px solid #35363c", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#b5bac1", letterSpacing: "0.5px" }}>FLAGS & DELIVERY SETTINGS</span>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={tts} onChange={(e) => setTts(e.target.checked)} />
                  <span>Text-to-Speech (TTS)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={suppressNotifications} onChange={(e) => setSuppressNotifications(e.target.checked)} />
                  <span>Suppress Notifications (Silent Message)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={useCompV2} onChange={(e) => setUseCompV2(e.target.checked)} />
                  <span>Enable Components V2 Flag (8192)</span>
                </label>
              </div>
            </div>
          )}

          {/* EDITABLE JSON TAB */}
          {activeTab === "json" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#2b2d31", padding: "20px", borderRadius: "8px", border: "1px solid #35363c" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#b5bac1", letterSpacing: "0.5px" }}>JSON PAYLOAD EDITOR</span>
                <button
                  type="button"
                  onClick={handleApplyJson}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: "#5865f2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Check size={14} /> Apply JSON to Form
                </button>
              </div>

              {jsonError && (
                <div style={{ padding: "10px", backgroundColor: "rgba(242, 63, 67, 0.15)", border: "1px solid #f23f43", color: "#f23f43", borderRadius: "6px", fontSize: "13px" }}>
                  {jsonError}
                </div>
              )}

              <textarea
                value={jsonEditorValue}
                onChange={(e) => setRawJsonInput(e.target.value)}
                placeholder="Paste or edit raw Discord payload JSON here..."
                rows={18}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "6px",
                  border: "1px solid #35363c",
                  backgroundColor: "#1e1f22",
                  color: "#a6da35",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === "preview" && (
            <div style={{ backgroundColor: "#2b2d31", padding: "24px", borderRadius: "8px", border: "1px solid #35363c" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "13px", color: "#b5bac1", fontWeight: 700, letterSpacing: "0.5px" }}>DISCORD LIVE PREVIEW</h3>
                <span style={{ fontSize: "12px", color: "#23a55a", backgroundColor: "rgba(35, 165, 90, 0.1)", padding: "4px 8px", borderRadius: "4px", border: "1px solid #23a55a" }}>Realtime Render</span>
              </div>

              {/* Chat View Box */}
              <div style={{ backgroundColor: "#313338", padding: "20px", borderRadius: "8px", maxWidth: "680px" }}>
                {/* User Header */}
                <div style={{ display: "flex", gap: "14px", marginBottom: "8px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#5865f2", overflow: "hidden", flexShrink: 0 }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "16px" }}>W</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 600, color: "#fff", fontSize: "15px" }}>{username || "Webhook"}</span>
                      <span style={{ backgroundColor: "#5865f2", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "1px 4px", borderRadius: "3px" }}>BOT</span>
                      <span style={{ color: "#949ba4", fontSize: "12px", marginLeft: "4px" }}>Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Content Text */}
                    {content && <div style={{ color: "#dbdee1", fontSize: "14px", marginTop: "4px", whiteSpace: "pre-wrap", lineHeight: "1.4" }}>{content}</div>}

                    {/* Embed Stack Preview */}
                    {discordEmbeds.map((embed, i) => {
                      const draft = embeds[i];
                      return (
                        <div
                          key={i}
                          style={{
                            borderLeft: draft?.hasColor ? `4px solid ${draft?.color}` : "none",
                            backgroundColor: "#2b2d31",
                            padding: "16px",
                            borderRadius: "4px",
                            marginTop: "8px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            maxWidth: "520px",
                          }}
                        >
                          {/* Author */}
                          {embed.author?.name && (
                            <div style={{ color: "#fff", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                              {embed.author.icon_url && (
                                <img src={embed.author.icon_url} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
                              )}
                              <span>{embed.author.name}</span>
                            </div>
                          )}

                          {/* Title & Thumbnail Layout */}
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                              {embed.title && (
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>
                                  {embed.url ? <a href={embed.url} target="_blank" rel="noreferrer" style={{ color: "#00a8fc", textDecoration: "none" }}>{embed.title}</a> : embed.title}
                                </div>
                              )}
                              {embed.description && (
                                <div style={{ color: "#dbdee1", fontSize: "13px", whiteSpace: "pre-wrap", lineHeight: "1.35" }}>{embed.description}</div>
                              )}
                            </div>
                            {embed.thumbnail?.url && (
                              <img src={embed.thumbnail.url} alt="" style={{ width: "80px", height: "80px", borderRadius: "4px", objectFit: "cover" }} />
                            )}
                          </div>

                          {/* Render Components V2 Canvas Blocks */}
                          {draft?.mode === "cv2" && draft?.blocks.map((block) => {
                            if (block.type === "text" && block.content) {
                              return <div key={block.id} style={{ color: "#dbdee1", fontSize: "13px" }}>{block.content}</div>;
                            }

                            if (block.type === "separator") {
                              return block.separatorStyle === "line" ? (
                                <div key={block.id} style={{ borderTop: "1px solid #35363c", margin: "6px 0" }} />
                              ) : (
                                <div key={block.id} style={{ height: "12px" }} />
                              );
                            }

                            if (block.type === "action_row" && block.buttons?.length) {
                              return (
                                <div key={block.id} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                                  {block.buttons.map((btn) => (
                                    <DiscordButtonPreview key={btn.id} btn={btn} />
                                  ))}
                                </div>
                              );
                            }

                            if (block.type === "media" && block.mediaUrl) {
                              return (
                                <img key={block.id} src={block.mediaUrl} alt="" style={{ width: "100%", borderRadius: "4px", marginTop: "4px" }} />
                              );
                            }

                            return null;
                          })}

                          {/* Fields */}
                          {embed.fields && embed.fields.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
                              {embed.fields.map((f, fIdx) => (
                                <div key={fIdx} style={{ flex: f.inline ? "0 0 calc(33.33% - 12px)" : "1 0 100%", fontSize: "13px" }}>
                                  <div style={{ color: "#b5bac1", fontWeight: 600, marginBottom: "2px" }}>{f.name}</div>
                                  <div style={{ color: "#dbdee1" }}>{f.value}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Large Banner Image */}
                          {embed.image?.url && (
                            <img src={embed.image.url} alt="" style={{ maxWidth: "100%", borderRadius: "4px", marginTop: "8px" }} />
                          )}

                          {/* Footer & Timestamp */}
                          {(embed.footer?.text || draft?.timestamp) && (
                            <div style={{ color: "#949ba4", fontSize: "11px", marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                              {embed.footer?.icon_url && (
                                <img src={embed.footer.icon_url} alt="" style={{ width: "16px", height: "16px", borderRadius: "50%" }} />
                              )}
                              <span>
                                {embed.footer?.text}
                                {embed.footer?.text && draft?.timestamp ? " • " : ""}
                                {draft?.timestamp ? new Date(draft.timestamp).toLocaleString() : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </main>
  );
}