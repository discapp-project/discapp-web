"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Code2,
  CopyPlus,
  Eye,
  EyeOff,
  Paperclip,
  Plus,
  Send,
  Trash2,
} from "lucide-react";

type Tab = "message" | "embeds" | "delivery" | "json";
type EmbedFieldDraft = { id: string; name: string; value: string; inline: boolean };
type EmbedDraft = {
  id: string;
  authorName: string;
  authorUrl: string;
  authorIconUrl: string;
  title: string;
  titleUrl: string;
  description: string;
  color: string;
  thumbnailUrl: string;
  imageUrl: string;
  footerText: string;
  footerIconUrl: string;
  timestamp: string;
  fields: EmbedFieldDraft[];
};
type AttachmentDraft = { id: string; file: File; previewUrl: string | null };

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
};

type SendResult = { kind: "success" | "error"; message: string };

const emptyEmbed = (id: string): EmbedDraft => ({
  id,
  authorName: "",
  authorUrl: "",
  authorIconUrl: "",
  title: "",
  titleUrl: "",
  description: "",
  color: "#acf6c8",
  thumbnailUrl: "",
  imageUrl: "",
  footerText: "",
  footerIconUrl: "",
  timestamp: "",
  fields: [],
});

function isWebUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function safeFilename(file: File) {
  return file.name.split(/[\\/]/).pop()?.replace(/[\r\n\0]/g, "_").slice(0, 100) || "attachment";
}

function resolveMediaUrl(value: string, attachments: AttachmentDraft[]) {
  if (value.startsWith("attachment://")) {
    const fileName = value.slice("attachment://".length);
    return attachments.find((attachment) => safeFilename(attachment.file) === fileName)?.previewUrl ?? null;
  }
  return isWebUrl(value) ? value : null;
}

function toDiscordEmbed(draft: EmbedDraft): DiscordEmbed | null {
  const embed: DiscordEmbed = {};
  const authorName = draft.authorName.trim();
  const footerText = draft.footerText.trim();
  const fields = draft.fields
    .filter((field) => field.name.trim() && field.value.trim())
    .map((field) => ({ name: field.name.trim(), value: field.value.trim(), inline: field.inline }));

  if (authorName) {
    embed.author = { name: authorName };
    if (draft.authorUrl.trim()) embed.author.url = draft.authorUrl.trim();
    if (draft.authorIconUrl.trim()) embed.author.icon_url = draft.authorIconUrl.trim();
  }
  if (draft.title.trim()) embed.title = draft.title.trim();
  if (draft.titleUrl.trim()) embed.url = draft.titleUrl.trim();
  if (draft.description.trim()) embed.description = draft.description.trim();
  if (draft.color) embed.color = Number.parseInt(draft.color.slice(1), 16);
  if (draft.thumbnailUrl.trim()) embed.thumbnail = { url: draft.thumbnailUrl.trim() };
  if (draft.imageUrl.trim()) embed.image = { url: draft.imageUrl.trim() };
  if (footerText) {
    embed.footer = { text: footerText };
    if (draft.footerIconUrl.trim()) embed.footer.icon_url = draft.footerIconUrl.trim();
  }
  if (draft.timestamp) {
    const timestamp = new Date(draft.timestamp);
    if (!Number.isNaN(timestamp.getTime())) embed.timestamp = timestamp.toISOString();
  }
  if (fields.length) embed.fields = fields;

  return Object.keys(embed).some((key) => key !== "color") ? embed : null;
}

function embedCharacterCount(embed: EmbedDraft) {
  return embed.authorName.length + embed.title.length + embed.description.length + embed.footerText.length +
    embed.fields.reduce((total, field) => total + field.name.length + field.value.length, 0);
}

function Control({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  help,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
  help?: string;
  required?: boolean;
}) {
  return (
    <label className="builder-control">
      <span className="control-label">{label}{required && <span className="required-mark"> *</span>}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
      />
      {(help || maxLength !== undefined) && (
        <span className="control-meta">
          {help && <span>{help}</span>}
          {maxLength !== undefined && <span>{value.length}/{maxLength}</span>}
        </span>
      )}
    </label>
  );
}

function TextareaControl({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 5,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  help?: string;
}) {
  return (
    <label className="builder-control">
      <span className="control-label">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} rows={rows} />
      {(help || maxLength !== undefined) && (
        <span className="control-meta">
          {help && <span>{help}</span>}
          {maxLength !== undefined && <span>{value.length}/{maxLength}</span>}
        </span>
      )}
    </label>
  );
}

function Toggle({ label, description, checked, onChange, warning = false }: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  warning?: boolean;
}) {
  return (
    <label className={`toggle-row${warning ? " toggle-warning" : ""}`}>
      <span className="toggle-copy"><strong>{label}</strong>{description && <small>{description}</small>}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function MediaPreview({ src, label, attachments }: { src: string; label: string; attachments: AttachmentDraft[] }) {
  const resolvedUrl = resolveMediaUrl(src, attachments);
  if (!resolvedUrl) return null;
  return <div className="embed-media" role="img" aria-label={label} style={{ backgroundImage: `url(${JSON.stringify(resolvedUrl)})` }} />;
}

export default function WebhookBuilder() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showWebhookUrl, setShowWebhookUrl] = useState(false);
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [threadId, setThreadId] = useState("");
  const [tts, setTts] = useState(false);
  const [suppressNotifications, setSuppressNotifications] = useState(false);
  const [mentionEveryone, setMentionEveryone] = useState(false);
  const [mentionUsers, setMentionUsers] = useState(false);
  const [mentionRoles, setMentionRoles] = useState(false);
  const [embeds, setEmbeds] = useState<EmbedDraft[]>([]);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("message");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [copied, setCopied] = useState(false);
  const attachmentUrls = useRef(new Set<string>());

  useEffect(() => () => {
    attachmentUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const activeEmbed = embeds.find((embed) => embed.id === activeEmbedId) ?? embeds[0] ?? null;
  const discordEmbeds = useMemo(() => embeds.map(toDiscordEmbed).filter((embed): embed is DiscordEmbed => embed !== null), [embeds]);
  const totalEmbedCharacters = useMemo(() => embeds.reduce((total, embed) => total + embedCharacterCount(embed), 0), [embeds]);

  const payload = useMemo(() => {
    const allowedMentions = [
      ...(mentionEveryone ? ["everyone"] : []),
      ...(mentionUsers ? ["users"] : []),
      ...(mentionRoles ? ["roles"] : []),
    ];
    return {
      ...(content.length > 0 && { content }),
      ...(username.trim() && { username: username.trim() }),
      ...(avatarUrl.trim() && { avatar_url: avatarUrl.trim() }),
      ...(tts && { tts: true }),
      ...(discordEmbeds.length > 0 && { embeds: discordEmbeds }),
      allowed_mentions: { parse: allowedMentions },
      ...(suppressNotifications && { flags: 4096 }),
    };
  }, [avatarUrl, content, discordEmbeds, mentionEveryone, mentionRoles, mentionUsers, suppressNotifications, tts, username]);
  const payloadJson = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!webhookUrl.trim()) errors.push("Add a Discord webhook URL.");
    else {
      try {
        const parsed = new URL(webhookUrl.trim());
        if (parsed.protocol !== "https:" || !["discord.com", "discordapp.com"].includes(parsed.hostname) || !/^\/api\/webhooks\/\d{17,20}\/[A-Za-z0-9._-]+$/.test(parsed.pathname)) {
          errors.push("Use a full Discord webhook URL.");
        }
      } catch {
        errors.push("Use a full Discord webhook URL.");
      }
    }
    if (content.length > 2000) errors.push("Message content must be 2,000 characters or fewer.");
    if (!content.trim() && discordEmbeds.length === 0) errors.push("Add message text or at least one embed.");
    if (embeds.length > 10) errors.push("A message can contain up to 10 embeds.");
    if (totalEmbedCharacters > 6000) errors.push("Combined embed text must stay under 6,000 characters.");
    if (!isWebUrl(avatarUrl)) errors.push("Webhook avatar must be a valid HTTP or HTTPS URL.");

    for (const [index, embed] of embeds.entries()) {
      if (embed.fields.length > 25) errors.push(`Embed ${index + 1} can have up to 25 fields.`);
      if (embed.title.length > 256) errors.push(`Embed ${index + 1} title must be 256 characters or fewer.`);
      if (embed.description.length > 4096) errors.push(`Embed ${index + 1} description must be 4,096 characters or fewer.`);
      if (embed.authorName.length > 256) errors.push(`Embed ${index + 1} author must be 256 characters or fewer.`);
      if (embed.footerText.length > 2048) errors.push(`Embed ${index + 1} footer must be 2,048 characters or fewer.`);
      for (const field of embed.fields) {
        if (field.name.length > 256 || field.value.length > 1024) errors.push(`Fields in embed ${index + 1} must be 256 characters for the name and 1,024 for the value or fewer.`);
      }
      const mediaUrls = [embed.thumbnailUrl, embed.imageUrl];
      const otherUrls = [embed.authorUrl, embed.authorIconUrl, embed.titleUrl, embed.footerIconUrl];
      if (otherUrls.some((url) => !isWebUrl(url))) errors.push(`Embed ${index + 1} contains an invalid URL.`);
      if (mediaUrls.some((url) => !isWebUrl(url) && !attachments.some((attachment) => `attachment://${safeFilename(attachment.file)}` === url))) {
        errors.push(`Embed ${index + 1} media must use an HTTP URL or an uploaded attachment.`);
      }
    }
    if (threadId.trim() && !/^\d{17,20}$/.test(threadId.trim())) errors.push("Thread ID must be a 17–20 digit Discord ID.");
    if (attachments.length > 10) errors.push("Attach up to 10 files per message.");
    if (attachments.reduce((total, attachment) => total + attachment.file.size, 0) > 24 * 1024 * 1024) errors.push("Keep total attachments under 24 MB.");
    return [...new Set(errors)];
  }, [attachments, avatarUrl, content, discordEmbeds.length, embeds, threadId, totalEmbedCharacters, webhookUrl]);

  const addAttachments = (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = Math.max(0, 10 - attachments.length);
    const selectedFiles = Array.from(files).slice(0, remaining);
    const nextAttachments = selectedFiles.map((file) => {
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      if (previewUrl) attachmentUrls.current.add(previewUrl);
      return { id: crypto.randomUUID(), file, previewUrl };
    });
    setAttachments((current) => [...current, ...nextAttachments]);
    setResult(files.length > remaining ? { kind: "error", message: "A message can contain up to 10 attachments." } : null);
  };

  const removeAttachment = (id: string) => {
    const attachment = attachments.find((item) => item.id === id);
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
      attachmentUrls.current.delete(attachment.previewUrl);
    }
    setAttachments((current) => current.filter((item) => item.id !== id));
  };

  const setEmbedMedia = (embed: EmbedDraft, target: "imageUrl" | "thumbnailUrl", value: string) => {
    updateEmbed(embed.id, { [target]: value });
  };

  const updateEmbed = (id: string, changes: Partial<EmbedDraft>) => {
    setEmbeds((current) => current.map((embed) => embed.id === id ? { ...embed, ...changes } : embed));
  };

  const addEmbed = () => {
    if (embeds.length >= 10) return;
    const nextEmbed = emptyEmbed(crypto.randomUUID());
    setEmbeds((current) => [...current, nextEmbed]);
    setActiveEmbedId(nextEmbed.id);
    setActiveTab("embeds");
  };

  const removeEmbed = (id: string) => {
    const nextEmbeds = embeds.filter((embed) => embed.id !== id);
    setEmbeds(nextEmbeds);
    setActiveEmbedId(nextEmbeds[0]?.id ?? null);
  };

  const duplicateEmbed = (embed: EmbedDraft) => {
    if (embeds.length >= 10) return;
    const duplicate = {
      ...embed,
      id: crypto.randomUUID(),
      fields: embed.fields.map((field) => ({ ...field, id: crypto.randomUUID() })),
    };
    setEmbeds((current) => {
      const index = current.findIndex((item) => item.id === embed.id);
      const next = [...current];
      next.splice(index + 1, 0, duplicate);
      return next;
    });
    setActiveEmbedId(duplicate.id);
  };

  const moveEmbed = (id: string, direction: -1 | 1) => {
    setEmbeds((current) => {
      const index = current.findIndex((embed) => embed.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const addField = (embed: EmbedDraft) => {
    if (embed.fields.length >= 25) return;
    updateEmbed(embed.id, { fields: [...embed.fields, { id: crypto.randomUUID(), name: "", value: "", inline: false }] });
  };

  const updateField = (embed: EmbedDraft, fieldId: string, changes: Partial<EmbedFieldDraft>) => {
    updateEmbed(embed.id, { fields: embed.fields.map((field) => field.id === fieldId ? { ...field, ...changes } : field) });
  };

  const removeField = (embed: EmbedDraft, fieldId: string) => {
    updateEmbed(embed.id, { fields: embed.fields.filter((field) => field.id !== fieldId) });
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(payloadJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const sendWebhook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    if (validationErrors.length) {
      setResult({ kind: "error", message: validationErrors[0] });
      return;
    }

    setIsSending(true);
    try {
      const requestBody = attachments.length ? new FormData() : null;
      if (requestBody) {
        requestBody.set("webhookUrl", webhookUrl.trim());
        requestBody.set("threadId", threadId.trim());
        requestBody.set("payload", JSON.stringify(payload));
        attachments.forEach(({ file }) => requestBody.append("files", file, safeFilename(file)));
      }
      const response = await fetch("/api/webhook/execute", {
        method: "POST",
        ...(requestBody ? { body: requestBody } : {
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ webhookUrl: webhookUrl.trim(), threadId: threadId.trim(), payload }),
        }),
      });
      const responseBody: unknown = await response.json().catch(() => null);
      const message = typeof responseBody === "object" && responseBody !== null && "message" in responseBody && typeof responseBody.message === "string"
        ? responseBody.message
        : response.ok ? "Webhook delivered." : `Discord returned status ${response.status}.`;
      setResult({ kind: response.ok ? "success" : "error", message });
    } catch {
      setResult({ kind: "error", message: "Could not reach the webhook sender. Try again." });
    } finally {
      setIsSending(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "message", label: "Message" },
    { id: "embeds", label: `Embeds${embeds.length ? ` ${embeds.length}` : ""}` },
    { id: "delivery", label: "Delivery" },
    { id: "json", label: "JSON" },
  ];

  return (
    <main className="webhook-page">
      <header className="webhook-heading">
        <div>
          <p className="page-kicker">BOTLESS / WEBHOOKS</p>
          <h1>Webhook Builder</h1>
          <p className="webhook-subtitle">Compose a message, inspect the payload, and send it to Discord.</p>
        </div>
      </header>

      <form className="webhook-form" onSubmit={sendWebhook}>
        <section className="webhook-url-section" aria-labelledby="webhook-url-title">
          <div className="section-title-row">
            <div>
              <h2 id="webhook-url-title">Webhook URL</h2>
              <p>Treat this URL like a password. It is sent to this app to deliver your message and is not stored.</p>
            </div>
            <button className="visibility-toggle" type="button" onClick={() => setShowWebhookUrl((visible) => !visible)} aria-label={showWebhookUrl ? "Hide webhook URL" : "Show webhook URL"}>
              {showWebhookUrl ? <EyeOff size={15} /> : <Eye size={15} />}{showWebhookUrl ? "Hide" : "Show"}
            </button>
          </div>
          <input
            className="webhook-url-input"
            type={showWebhookUrl ? "text" : "password"}
            value={webhookUrl}
            onChange={(event) => setWebhookUrl(event.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            autoComplete="off"
            spellCheck={false}
            aria-label="Discord webhook URL"
          />
        </section>

        <div className="builder-layout">
          <section className="editor-column" aria-label="Webhook message editor">
            <nav className="editor-tabs" aria-label="Editor sections">
              {tabs.map((tab) => (
                <button key={tab.id} type="button" className={activeTab === tab.id ? "editor-tab is-active" : "editor-tab"} onClick={() => setActiveTab(tab.id)} aria-pressed={activeTab === tab.id}>
                  {tab.label}
                </button>
              ))}
            </nav>

            {activeTab === "message" && (
              <div className="editor-panel">
                <TextareaControl label="Message content" value={content} onChange={setContent} placeholder="Write a message..." maxLength={2000} rows={7} help="Markdown is supported by Discord." />
                <div className="attachment-section">
                  <div className="attachment-heading"><div><strong>Attachments</strong><small>Up to 10 files · 24 MB total</small></div><label className="button button-secondary file-pick-button"><Plus size={14} /> Add files<input type="file" multiple onChange={(event) => { addAttachments(event.target.files); event.currentTarget.value = ""; }} /></label></div>
                  {attachments.length > 0 && <ul className="attachment-list">{attachments.map((attachment) => <li key={attachment.id}>{attachment.previewUrl ? <span className="attachment-thumb" role="img" aria-label="Selected image attachment" style={{ backgroundImage: `url(${JSON.stringify(attachment.previewUrl)})` }} /> : <span className="attachment-file-mark">FILE</span>}<span className="attachment-info"><strong>{attachment.file.name}</strong><small>{(attachment.file.size / 1024 / 1024).toFixed(2)} MB</small></span><button type="button" className="remove-attachment" aria-label={`Remove ${attachment.file.name}`} onClick={() => removeAttachment(attachment.id)}><Trash2 size={14} /></button></li>)}</ul>}
                </div>
                <Toggle label="Text-to-speech" description="Ask Discord to read the message aloud." checked={tts} onChange={setTts} />
              </div>
            )}

            {activeTab === "embeds" && (
              <div className="editor-panel">
                <div className="embed-list-heading">
                  <div><h2>Embeds</h2><p>{embeds.length}/10 embeds · {totalEmbedCharacters}/6000 characters</p></div>
                  <button className="button button-secondary" type="button" onClick={addEmbed} disabled={embeds.length >= 10}><Plus size={15} /> Add embed</button>
                </div>
                {embeds.length === 0 ? (
                  <div className="empty-embed"><p>No embeds yet.</p><button className="text-button" type="button" onClick={addEmbed}>Create your first embed</button></div>
                ) : (
                  <>
                    <div className="embed-tabs" role="tablist" aria-label="Embeds">
                      {embeds.map((embed, index) => (
                        <button type="button" role="tab" aria-selected={activeEmbed?.id === embed.id} className={activeEmbed?.id === embed.id ? "embed-tab is-active" : "embed-tab"} key={embed.id} onClick={() => setActiveEmbedId(embed.id)}>
                          {embed.title.trim() || `Embed ${index + 1}`}
                        </button>
                      ))}
                    </div>
                    {activeEmbed && (
                      <div className="embed-editor">
                        <div className="embed-editor-toolbar">
                          <span>Embed {embeds.findIndex((embed) => embed.id === activeEmbed.id) + 1}</span>
                          <div className="icon-actions">
                            <button type="button" title="Move embed up" aria-label="Move embed up" onClick={() => moveEmbed(activeEmbed.id, -1)} disabled={embeds[0]?.id === activeEmbed.id}><ArrowUp size={15} /></button>
                            <button type="button" title="Move embed down" aria-label="Move embed down" onClick={() => moveEmbed(activeEmbed.id, 1)} disabled={embeds[embeds.length - 1]?.id === activeEmbed.id}><ArrowDown size={15} /></button>
                            <button type="button" title="Duplicate embed" aria-label="Duplicate embed" onClick={() => duplicateEmbed(activeEmbed)} disabled={embeds.length >= 10}><CopyPlus size={15} /></button>
                            <button type="button" title="Remove embed" aria-label="Remove embed" onClick={() => removeEmbed(activeEmbed.id)}><Trash2 size={15} /></button>
                          </div>
                        </div>

                        <div className="embed-color-row">
                          <label className="builder-control"><span className="control-label">Accent color</span><span className="color-input-wrap"><input type="color" value={activeEmbed.color} onChange={(event) => updateEmbed(activeEmbed.id, { color: event.target.value })} /><code>{activeEmbed.color.toUpperCase()}</code></span></label>
                          <Control label="Timestamp" type="datetime-local" value={activeEmbed.timestamp} onChange={(value) => updateEmbed(activeEmbed.id, { timestamp: value })} />
                        </div>
                        <div className="form-row">
                          <Control label="Author" value={activeEmbed.authorName} onChange={(value) => updateEmbed(activeEmbed.id, { authorName: value })} placeholder="Author name" maxLength={256} />
                          <Control label="Author URL" type="url" value={activeEmbed.authorUrl} onChange={(value) => updateEmbed(activeEmbed.id, { authorUrl: value })} placeholder="https://example.com" />
                        </div>
                        <Control label="Author icon URL" type="url" value={activeEmbed.authorIconUrl} onChange={(value) => updateEmbed(activeEmbed.id, { authorIconUrl: value })} placeholder="https://example.com/icon.png" />
                        <div className="form-row">
                          <Control label="Title" value={activeEmbed.title} onChange={(value) => updateEmbed(activeEmbed.id, { title: value })} placeholder="Embed title" maxLength={256} />
                          <Control label="Title URL" type="url" value={activeEmbed.titleUrl} onChange={(value) => updateEmbed(activeEmbed.id, { titleUrl: value })} placeholder="https://example.com" />
                        </div>
                        <TextareaControl label="Description" value={activeEmbed.description} onChange={(value) => updateEmbed(activeEmbed.id, { description: value })} placeholder="Add details to your embed..." maxLength={4096} rows={6} />

                        <div className="field-section-heading"><h3>Fields</h3><button className="text-button" type="button" onClick={() => addField(activeEmbed)} disabled={activeEmbed.fields.length >= 25}><Plus size={14} /> Add field</button></div>
                        {activeEmbed.fields.map((field, index) => (
                          <div className="field-editor" key={field.id}>
                            <div className="field-editor-heading"><span>Field {index + 1}</span><button type="button" aria-label={`Remove field ${index + 1}`} onClick={() => removeField(activeEmbed, field.id)}><Trash2 size={14} /></button></div>
                            <div className="form-row"><Control label="Name" value={field.name} onChange={(value) => updateField(activeEmbed, field.id, { name: value })} placeholder="Field name" maxLength={256} /><label className="inline-toggle"><input type="checkbox" checked={field.inline} onChange={(event) => updateField(activeEmbed, field.id, { inline: event.target.checked })} /> Inline</label></div>
                            <TextareaControl label="Value" value={field.value} onChange={(value) => updateField(activeEmbed, field.id, { value })} placeholder="Field value" maxLength={1024} rows={3} />
                          </div>
                        ))}

                        <details className="advanced-section">
                          <summary>Media and footer <ChevronDown size={14} /></summary>
                          <div className="advanced-fields">
                            <Control label="Thumbnail URL" value={activeEmbed.thumbnailUrl} onChange={(value) => setEmbedMedia(activeEmbed, "thumbnailUrl", value)} placeholder="https://example.com/thumbnail.png or choose an upload" />
                            {attachments.length > 0 && <label className="builder-control"><span className="control-label">Use attachment as thumbnail</span><select value={activeEmbed.thumbnailUrl.startsWith("attachment://") ? activeEmbed.thumbnailUrl : ""} onChange={(event) => setEmbedMedia(activeEmbed, "thumbnailUrl", event.target.value)}><option value="">None</option>{attachments.map((attachment) => <option key={attachment.id} value={`attachment://${safeFilename(attachment.file)}`}>{attachment.file.name}</option>)}</select></label>}
                            <Control label="Image URL" value={activeEmbed.imageUrl} onChange={(value) => setEmbedMedia(activeEmbed, "imageUrl", value)} placeholder="https://example.com/image.png or choose an upload" />
                            {attachments.length > 0 && <label className="builder-control"><span className="control-label">Use attachment as image</span><select value={activeEmbed.imageUrl.startsWith("attachment://") ? activeEmbed.imageUrl : ""} onChange={(event) => setEmbedMedia(activeEmbed, "imageUrl", event.target.value)}><option value="">None</option>{attachments.map((attachment) => <option key={attachment.id} value={`attachment://${safeFilename(attachment.file)}`}>{attachment.file.name}</option>)}</select></label>}
                            <div className="form-row"><Control label="Footer text" value={activeEmbed.footerText} onChange={(value) => updateEmbed(activeEmbed.id, { footerText: value })} placeholder="Footer" maxLength={2048} /><Control label="Footer icon URL" type="url" value={activeEmbed.footerIconUrl} onChange={(value) => updateEmbed(activeEmbed.id, { footerIconUrl: value })} placeholder="https://example.com/icon.png" /></div>
                          </div>
                        </details>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="editor-panel delivery-panel">
                <h2>Webhook identity</h2>
                <p>These values override the webhook&apos;s default name and avatar for this message only.</p>
                <Control label="Display name" value={username} onChange={setUsername} placeholder="Leave blank to use the webhook name" maxLength={80} />
                <Control label="Avatar image URL" type="url" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://example.com/avatar.png" />
                <div className="delivery-divider" />
                <h2>Destination</h2>
                <Control label="Thread ID (optional)" value={threadId} onChange={setThreadId} placeholder="17–20 digit thread ID" help="Use this for an existing thread or forum post." />
                <div className="delivery-divider" />
                <h2>Mentions</h2>
                <p>Mentions are suppressed by default. Choose which mention types Discord may notify.</p>
                <Toggle label="@everyone and @here" description="May notify everyone with access to the channel." checked={mentionEveryone} onChange={setMentionEveryone} warning />
                <Toggle label="User mentions" checked={mentionUsers} onChange={setMentionUsers} />
                <Toggle label="Role mentions" checked={mentionRoles} onChange={setMentionRoles} />
                <div className="delivery-divider" />
                <Toggle label="Suppress push notifications" description="Discord will show a badge but not send push or desktop notifications." checked={suppressNotifications} onChange={setSuppressNotifications} />
              </div>
            )}

            {activeTab === "json" && (
              <div className="editor-panel json-panel">
                <div className="json-heading"><div><h2>Request payload</h2><p>Generated from the current editor values.</p></div><button className="button button-secondary" type="button" onClick={copyJson}>{copied ? <Check size={15} /> : <Code2 size={15} />}{copied ? "Copied" : "Copy JSON"}</button></div>
                <pre className="json-preview">{payloadJson}</pre>
              </div>
            )}
          </section>

          <aside className="preview-column" aria-label="Message preview">
            <div className="preview-heading"><h2>Preview</h2><span>Discord</span></div>
            <div className="discord-message">
              <div className="preview-avatar" aria-hidden="true" style={avatarUrl.trim() && isWebUrl(avatarUrl) ? { backgroundImage: `url(${JSON.stringify(avatarUrl)})` } : undefined}>{!(avatarUrl.trim() && isWebUrl(avatarUrl)) && (username.trim().slice(0, 1).toUpperCase() || "W")}</div>
              <div className="preview-message-body">
                <div className="preview-author"><strong>{username.trim() || "Webhook"}</strong><span>APP</span><time>now</time></div>
                {content && <p className="preview-content">{content}</p>}
                {attachments.length > 0 && <div className="preview-attachments">{attachments.map((attachment) => <span className="preview-attachment" key={attachment.id}><Paperclip size={12} />{attachment.file.name}</span>)}</div>}
                {discordEmbeds.map((embed, index) => (
                  <article className="preview-embed" key={embeds.filter(toDiscordEmbed)[index]?.id ?? index} style={{ "--embed-color": embed.color ? `#${embed.color.toString(16).padStart(6, "0")}` : "#acf6c8" } as CSSProperties}>
                    {embed.author && <div className="preview-embed-author">{embed.author.icon_url && isWebUrl(embed.author.icon_url) && <span className="preview-author-icon" role="img" aria-label="Author icon" style={{ backgroundImage: `url(${JSON.stringify(embed.author.icon_url)})` }} />}<span>{embed.author.name}</span></div>}
                    {embed.thumbnail?.url && resolveMediaUrl(embed.thumbnail.url, attachments) && <div className="preview-thumbnail" role="img" aria-label="Embed thumbnail" style={{ backgroundImage: `url(${JSON.stringify(resolveMediaUrl(embed.thumbnail.url, attachments))})` }} />}
                    {embed.title && (embed.url && isWebUrl(embed.url) ? <a className="preview-embed-title" href={embed.url} target="_blank" rel="noreferrer">{embed.title}</a> : <strong className="preview-embed-title">{embed.title}</strong>)}
                    {embed.description && <p className="preview-embed-description">{embed.description}</p>}
                    {embed.fields && <div className="preview-fields">{embed.fields.map((field, fieldIndex) => <div className={field.inline ? "preview-field is-inline" : "preview-field"} key={`${field.name}-${fieldIndex}`}><strong>{field.name}</strong><span>{field.value}</span></div>)}</div>}
                    {embed.image?.url && <MediaPreview src={embed.image.url} label="Embed image" attachments={attachments} />}
                    {embed.footer && <div className="preview-embed-footer">{embed.footer.icon_url && isWebUrl(embed.footer.icon_url) && <span className="preview-footer-icon" role="img" aria-label="Footer icon" style={{ backgroundImage: `url(${JSON.stringify(embed.footer.icon_url)})` }} />}<span>{embed.footer.text}</span>{embed.timestamp && <time>{new Date(embed.timestamp).toLocaleString()}</time>}</div>}
                    {!embed.footer && embed.timestamp && <time className="preview-timestamp">{new Date(embed.timestamp).toLocaleString()}</time>}
                  </article>
                ))}
                {!content && discordEmbeds.length === 0 && <p className="preview-empty">Your message preview will appear here.</p>}
              </div>
            </div>

            <div className="send-panel">
              <div className="send-panel-note"><span className="privacy-dot" /> Webhook URL is not saved</div>
              <button className="button button-send" type="submit" disabled={isSending}>
                {isSending ? <span className="spinner" /> : <Send size={15} />}
                {isSending ? "Sending..." : "Send webhook"}
              </button>
              {result && <p className={`send-result is-${result.kind}`} role="status">{result.message}</p>}
              {validationErrors.length > 0 && <p className="send-hint">{validationErrors[0]}</p>}
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
}
