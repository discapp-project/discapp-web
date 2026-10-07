"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  FileText,
  Image as ImageIcon,
  Layout,
  Plus,
  Send,
  Settings,
  Sparkles,
  User,
  Sliders,
  X,
  Palette,
  ExternalLink,
  Clock,
  Type,
  Minus,
  Paperclip,
  FolderPlus,
  Grid,
} from "lucide-react";

type WorkspaceTab = "builder" | "bot_settings" | "dispatch" | "json";

type LinkButton = { id: string; label: string; url: string };
type EmbedField = { id: string; name: string; value: string; inline: boolean };
type MediaGalleryItem = { id: string; url: string };
type AttachedFile = { id: string; fileName: string; url: string };

type Embed = {
  id: string;
  title?: string;
  titleUrl?: string;
  description?: string;
  color?: string;
  authorName?: string;
  authorIconUrl?: string;
  authorUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  footerText?: string;
  footerIconUrl?: string;
  timestamp?: string;
  fields: EmbedField[];
};

export default function DiscordStudioWorkspace() {
  const [tab, setTab] = useState<WorkspaceTab>("builder");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Global Payload Settings
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [threadId, setThreadId] = useState("");
  const [threadName, setThreadName] = useState("");
  const [appliedTags, setAppliedTags] = useState("");
  const [suppressEmbeds, setSuppressEmbeds] = useState(false);
  const [suppressNotifications, setSuppressNotifications] = useState(false);

  // Custom UI Elements
  const [linkButtons, setLinkButtons] = useState<LinkButton[]>([]);
  const [textDisplays, setTextDisplays] = useState<{ id: string; text: string }[]>([]);
  const [mediaGallery, setMediaGallery] = useState<MediaGalleryItem[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [hasSeparator, setHasSeparator] = useState(false);

  // Embed State & Containers
  const [embeds, setEmbeds] = useState<Embed[]>([]);
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const activeEmbed = embeds.find((e) => e.id === activeEmbedId) || embeds[0] || null;
  const hasEmbed = embeds.length > 0;

  const updateActiveEmbed = (changes: Partial<Embed>) => {
    if (!activeEmbed) return;
    setEmbeds((prev) => prev.map((e) => (e.id === activeEmbed.id ? { ...e, ...changes } : e)));
  };

  const createNewEmbed = () => {
    const newEmbed: Embed = {
      id: crypto.randomUUID(),
      fields: [],
    };
    setEmbeds((prev) => [...prev, newEmbed]);
    setActiveEmbedId(newEmbed.id);
    return newEmbed;
  };

  const addLinkButton = () => {
    if (linkButtons.length >= 5) return;
    setLinkButtons((prev) => [...prev, { id: crypto.randomUUID(), label: "Visit Link", url: "" }]);
  };

  const addTextDisplay = () => {
    setTextDisplays((prev) => [...prev, { id: crypto.randomUUID(), text: "Additional text section..." }]);
  };

  const addMediaGalleryItem = () => {
    if (mediaGallery.length >= 4) return;
    setMediaGallery((prev) => [...prev, { id: crypto.randomUUID(), url: "" }]);
  };

  const addAttachedFile = () => {
    setAttachedFiles((prev) => [...prev, { id: crypto.randomUUID(), fileName: "", url: "" }]);
  };

  const addComponent = (type: string) => {
    setIsDropdownOpen(false);
    setActiveSubmenu(null);

    switch (type) {
      case "button_row":
        addLinkButton();
        return;
      case "container":
      case "section":
        createNewEmbed();
        return;
      case "text_display":
        addTextDisplay();
        return;
      case "media_gallery":
        addMediaGalleryItem();
        return;
      case "file":
        addAttachedFile();
        return;
      case "separator":
        setHasSeparator(true);
        return;
    }

    if (!activeEmbed) return;

    switch (type) {
      case "title":
        if (activeEmbed.title === undefined) updateActiveEmbed({ title: "" });
        break;
      case "description":
        if (activeEmbed.description === undefined) updateActiveEmbed({ description: "" });
        break;
      case "color":
        if (activeEmbed.color === undefined) updateActiveEmbed({ color: "#5865f2" });
        break;
      case "field":
        if (activeEmbed.fields.length >= 25) return;
        updateActiveEmbed({
          fields: [
            ...activeEmbed.fields,
            { id: crypto.randomUUID(), name: "", value: "", inline: true },
          ],
        });
        break;
      case "author":
        if (activeEmbed.authorName === undefined) updateActiveEmbed({ authorName: "", authorIconUrl: "", authorUrl: "" });
        break;
      case "thumbnail":
        if (activeEmbed.thumbnailUrl === undefined) updateActiveEmbed({ thumbnailUrl: "" });
        break;
      case "image":
        if (activeEmbed.imageUrl === undefined) updateActiveEmbed({ imageUrl: "" });
        break;
      case "footer":
        if (activeEmbed.footerText === undefined) updateActiveEmbed({ footerText: "", footerIconUrl: "" });
        break;
      case "timestamp":
        if (activeEmbed.timestamp === undefined) updateActiveEmbed({ timestamp: new Date().toISOString() });
        break;
    }
  };

  // Modern pill close button component
  const DismissButton = ({ onClick, title = "Remove" }: { onClick: (e?: any) => void; title?: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: "#2b2d31",
        border: "1px solid #3f4147",
        color: "#949ba4",
        cursor: "pointer",
        transition: "all 0.15s ease",
        flexShrink: 0,
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#da373c";
        e.currentTarget.style.borderColor = "#da373c";
        e.currentTarget.style.color = "#ffffff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#2b2d31";
        e.currentTarget.style.borderColor = "#3f4147";
        e.currentTarget.style.color = "#949ba4";
      }}
    >
      <X size={12} strokeWidth={2.5} />
    </button>
  );

  // Grouped Menu Definitions
  const layoutItems = [
    { id: "container", label: "Container / Embed", icon: FolderPlus },
    { id: "section", label: "Section Block", icon: Layout },
    { id: "separator", label: "Separator", icon: Minus, disabled: hasSeparator },
  ];

  const contentItems = [
    { id: "text_display", label: "Text Display", icon: Type },
    { id: "button_row", label: "Button Row", icon: ExternalLink, disabled: linkButtons.length >= 5 },
  ];

  const mediaItems = [
    { id: "media_gallery", label: "Media Gallery", icon: Grid },
    { id: "file", label: "Attached File", icon: Paperclip },
  ];

  const activeEmbedFields = useMemo(() => {
    if (!hasEmbed || !activeEmbed) return [];
    const list = [];
    if (activeEmbed.title === undefined) list.push({ id: "title", label: "Title", icon: FileText });
    if (activeEmbed.description === undefined) list.push({ id: "description", label: "Description", icon: FileText });
    if (activeEmbed.color === undefined) list.push({ id: "color", label: "Accent Color Bar", icon: Palette });
    if (activeEmbed.fields.length < 25) list.push({ id: "field", label: "Field Component", icon: FileText });
    if (activeEmbed.authorName === undefined) list.push({ id: "author", label: "Author Header", icon: User });
    if (activeEmbed.thumbnailUrl === undefined) list.push({ id: "thumbnail", label: "Thumbnail Image", icon: ImageIcon });
    if (activeEmbed.imageUrl === undefined) list.push({ id: "image", label: "Banner Image", icon: ImageIcon });
    if (activeEmbed.footerText === undefined) list.push({ id: "footer", label: "Footer Note", icon: Sparkles });
    if (activeEmbed.timestamp === undefined) list.push({ id: "timestamp", label: "Timestamp", icon: Clock });
    return list;
  }, [hasEmbed, activeEmbed]);

  // Payload computation
  const payload = useMemo(() => {
    let flags = 0;
    if (suppressEmbeds) flags |= 1 << 2;
    if (suppressNotifications) flags |= 1 << 12;

    const validButtons = linkButtons
      .filter((b) => b.label.trim() && b.url.trim())
      .map((b) => ({
        type: 2,
        style: 5,
        label: b.label.trim(),
        url: b.url.trim(),
      }));

    const combinedContent = [
      content.trim(),
      ...textDisplays.map((t) => t.text.trim()).filter(Boolean),
      attachedFiles
        .filter((f) => f.url.trim())
        .map((f) => `📌 Attachment: [${f.fileName || "File"}](${f.url})`)
        .join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n");

    const galleryEmbeds = mediaGallery
      .filter((g) => g.url.trim())
      .map((g) => ({ image: { url: g.url.trim() } }));

    const standardEmbeds = embeds.map((e) => ({
      ...(e.title?.trim() && { title: e.title }),
      ...(e.titleUrl?.trim() && { url: e.titleUrl }),
      ...(e.description?.trim() && { description: e.description }),
      ...(e.color && { color: Number.parseInt(e.color.replace("#", ""), 16) || 0 }),
      ...(e.authorName?.trim() && {
        author: {
          name: e.authorName,
          icon_url: e.authorIconUrl?.trim() || undefined,
          url: e.authorUrl?.trim() || undefined,
        },
      }),
      ...(e.footerText?.trim() && {
        footer: {
          text: e.footerText,
          icon_url: e.footerIconUrl?.trim() || undefined,
        },
      }),
      ...(e.timestamp && { timestamp: e.timestamp }),
      ...(e.thumbnailUrl?.trim() && { thumbnail: { url: e.thumbnailUrl } }),
      ...(e.imageUrl?.trim() && { image: { url: e.imageUrl } }),
      fields: e.fields
        .filter((f) => f.name.trim() && f.value.trim())
        .map((f) => ({ name: f.name, value: f.value, inline: f.inline })),
    }));

    const components = validButtons.length > 0 ? [{ type: 1, components: validButtons }] : undefined;

    return {
      ...(combinedContent && { content: combinedContent }),
      ...(username.trim() && { username }),
      ...(avatarUrl.trim() && { avatar_url: avatarUrl }),
      ...(threadName.trim() && { thread_name: threadName }),
      ...(appliedTags.trim() && {
        applied_tags: appliedTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
      ...(flags > 0 && { flags }),
      ...(components && { components }),
      embeds: [...standardEmbeds, ...galleryEmbeds],
    };
  }, [content, textDisplays, attachedFiles, mediaGallery, username, avatarUrl, threadName, appliedTags, suppressEmbeds, suppressNotifications, linkButtons, embeds]);

  const jsonString = JSON.stringify(payload, null, 2);

  const handleDispatch = async () => {
    setSendResult(null);
    if (!webhookUrl.trim()) {
      setSendResult({ kind: "error", message: "Please configure a Webhook URL in Deploy settings." });
      setTab("dispatch");
      return;
    }

    setIsSending(true);
    try {
      const target = webhookUrl.trim() + (threadId.trim() ? `?thread_id=${threadId.trim()}` : "");
      const res = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonString,
      });

      if (res.ok || res.status === 204) {
        setSendResult({ kind: "success", message: "Payload dispatched successfully!" });
      } else {
        const err = await res.json().catch(() => ({}));
        setSendResult({ kind: "error", message: err.message || `Discord Error: ${res.status}` });
      }
    } catch {
      setSendResult({ kind: "error", message: "Network error connecting to Discord Webhook." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111214", color: "#dbdee1", fontFamily: "'gg sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Workspace Navigation Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #2b2d31", paddingBottom: "12px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { id: "builder", label: "Canvas Builder", icon: Layout },
              { id: "bot_settings", label: "Bot & Signals", icon: Settings },
              { id: "dispatch", label: "Deploy & Webhook", icon: Send },
              { id: "json", label: "Raw JSON", icon: Code2 },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id as WorkspaceTab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: active ? "#2b2d31" : "transparent",
                    color: active ? "#ffffff" : "#949ba4",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleDispatch}
            disabled={isSending}
            style={{
              backgroundColor: "#23a55a",
              color: "#fff",
              border: "none",
              padding: "8px 18px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            {isSending ? "Dispatching..." : "Dispatch Payload"}
          </button>
        </div>

        {/* TAB 1: CANVAS BUILDER */}
        {tab === "builder" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Component Injector Bar with Cascading Submenus */}
            <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #2b2d31" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders size={16} color="#949ba4" />
                <span style={{ fontSize: "12px", color: "#949ba4", fontWeight: 700, letterSpacing: "0.5px" }}>COMPONENT INJECTOR</span>
              </div>

              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    setActiveSubmenu(null);
                  }}
                  style={{
                    backgroundColor: "#5865f2",
                    color: "#fff",
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={15} /> Add Component <ChevronDown size={14} />
                </button>

                {/* Primary Cascading Dropdown */}
                {isDropdownOpen && (
                  <div
                    onMouseLeave={() => setActiveSubmenu(null)}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      width: "210px",
                      backgroundColor: "#1e1f22",
                      border: "1px solid #383a40",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                      padding: "6px",
                      zIndex: 100,
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    {/* Category: Layout & Structure */}
                    <div
                      onMouseEnter={() => setActiveSubmenu("layout")}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: "4px",
                        color: activeSubmenu === "layout" ? "#fff" : "#dbdee1",
                        backgroundColor: activeSubmenu === "layout" ? "#2b2d31" : "transparent",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Layout size={14} color="#949ba4" />
                        <span>Layout & Structure</span>
                      </div>
                      <ChevronRight size={14} color="#949ba4" />

                      {/* Submenu: Layout */}
                      {activeSubmenu === "layout" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-6px",
                            left: "100%",
                            marginLeft: "4px",
                            width: "190px",
                            backgroundColor: "#1e1f22",
                            border: "1px solid #383a40",
                            borderRadius: "8px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                            padding: "6px",
                            zIndex: 101,
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          {layoutItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                disabled={item.disabled}
                                onClick={() => addComponent(item.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 10px",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  borderRadius: "4px",
                                  color: item.disabled ? "#4e5058" : "#dbdee1",
                                  fontSize: "13px",
                                  cursor: item.disabled ? "not-allowed" : "pointer",
                                  textAlign: "left",
                                  width: "100%",
                                }}
                                onMouseEnter={(e) => {
                                  if (!item.disabled) e.currentTarget.style.backgroundColor = "#2b2d31";
                                }}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                                <Icon size={14} color={item.disabled ? "#4e5058" : "#949ba4"} />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Category: Content Blocks */}
                    <div
                      onMouseEnter={() => setActiveSubmenu("content")}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: "4px",
                        color: activeSubmenu === "content" ? "#fff" : "#dbdee1",
                        backgroundColor: activeSubmenu === "content" ? "#2b2d31" : "transparent",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Type size={14} color="#949ba4" />
                        <span>Content & Inputs</span>
                      </div>
                      <ChevronRight size={14} color="#949ba4" />

                      {/* Submenu: Content */}
                      {activeSubmenu === "content" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-6px",
                            left: "100%",
                            marginLeft: "4px",
                            width: "180px",
                            backgroundColor: "#1e1f22",
                            border: "1px solid #383a40",
                            borderRadius: "8px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                            padding: "6px",
                            zIndex: 101,
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          {contentItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                disabled={item.disabled}
                                onClick={() => addComponent(item.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 10px",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  borderRadius: "4px",
                                  color: item.disabled ? "#4e5058" : "#dbdee1",
                                  fontSize: "13px",
                                  cursor: item.disabled ? "not-allowed" : "pointer",
                                  textAlign: "left",
                                  width: "100%",
                                }}
                                onMouseEnter={(e) => {
                                  if (!item.disabled) e.currentTarget.style.backgroundColor = "#2b2d31";
                                }}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                                <Icon size={14} color={item.disabled ? "#4e5058" : "#949ba4"} />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Category: Media Options */}
                    <div
                      onMouseEnter={() => setActiveSubmenu("media")}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: "4px",
                        color: activeSubmenu === "media" ? "#fff" : "#dbdee1",
                        backgroundColor: activeSubmenu === "media" ? "#2b2d31" : "transparent",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ImageIcon size={14} color="#949ba4" />
                        <span>Media & Attachments</span>
                      </div>
                      <ChevronRight size={14} color="#949ba4" />

                      {/* Submenu: Media */}
                      {activeSubmenu === "media" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-6px",
                            left: "100%",
                            marginLeft: "4px",
                            width: "180px",
                            backgroundColor: "#1e1f22",
                            border: "1px solid #383a40",
                            borderRadius: "8px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                            padding: "6px",
                            zIndex: 101,
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          {mediaItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => addComponent(item.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 10px",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  borderRadius: "4px",
                                  color: "#dbdee1",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  width: "100%",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2b2d31")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                                <Icon size={14} color="#949ba4" />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Category: Active Container Fields (Dynamic) */}
                    {hasEmbed && (
                      <div
                        onMouseEnter={() => setActiveSubmenu("container_fields")}
                        style={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: "4px",
                          color: activeSubmenu === "container_fields" ? "#fff" : "#dbdee1",
                          backgroundColor: activeSubmenu === "container_fields" ? "#2b2d31" : "transparent",
                          fontSize: "13px",
                          cursor: "pointer",
                          borderTop: "1px solid #2b2d31",
                          marginTop: "2px",
                          paddingTop: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <FolderPlus size={14} color="#5865f2" />
                          <span>Container Fields</span>
                        </div>
                        <ChevronRight size={14} color="#949ba4" />

                        {/* Submenu: Container Fields */}
                        {activeSubmenu === "container_fields" && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-6px",
                              left: "100%",
                              marginLeft: "4px",
                              width: "190px",
                              backgroundColor: "#1e1f22",
                              border: "1px solid #383a40",
                              borderRadius: "8px",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                              padding: "6px",
                              zIndex: 101,
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                            }}
                          >
                            {activeEmbedFields.length > 0 ? (
                              activeEmbedFields.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => addComponent(item.id)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "8px 10px",
                                      backgroundColor: "transparent",
                                      border: "none",
                                      borderRadius: "4px",
                                      color: "#dbdee1",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      textAlign: "left",
                                      width: "100%",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2b2d31")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                  >
                                    <Icon size={14} color="#949ba4" />
                                    <span>{item.label}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <div style={{ padding: "8px", fontSize: "11px", color: "#949ba4", textAlign: "center" }}>
                                All container elements added
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live Canvas Viewport */}
            <div style={{ backgroundColor: "#2b2d31", borderRadius: "8px", border: "1px solid #383a40", padding: "20px", minHeight: "260px" }}>
              
              {/* Bot Meta & Primary Message Body */}
              <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#5865f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                  {avatarUrl.trim() ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    username ? username.slice(0, 1).toUpperCase() : "B"
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>{username || "Webhook Bot"}</span>
                    <span style={{ backgroundColor: "#5865f2", color: "#fff", fontSize: "10px", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>APP</span>
                  </div>

                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type plain message body here..."
                    rows={2}
                    style={{
                      width: "100%",
                      backgroundColor: "#1e1f22",
                      border: "1px solid #383a40",
                      borderRadius: "6px",
                      color: "#dbdee1",
                      padding: "10px",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Message Canvas Layout Body */}
              <div style={{ marginLeft: "54px", display: "flex", flexDirection: "column", gap: "14px" }}>
                
                {/* Additional Text Display Blocks */}
                {textDisplays.map((td) => (
                  <div key={td.id} style={{ backgroundColor: "#1e1f22", borderRadius: "6px", padding: "10px 12px", border: "1px solid #2b2d31", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <Type size={16} color="#949ba4" style={{ marginTop: "4px" }} />
                    <textarea
                      value={td.text}
                      onChange={(e) => setTextDisplays((prev) => prev.map((item) => (item.id === td.id ? { ...item, text: e.target.value } : item)))}
                      rows={2}
                      style={{ flex: 1, background: "transparent", border: "none", color: "#dbdee1", fontSize: "13px", outline: "none", resize: "vertical" }}
                    />
                    <DismissButton onClick={() => setTextDisplays((prev) => prev.filter((item) => item.id !== td.id))} title="Remove Text Display" />
                  </div>
                ))}

                {/* Separator Line */}
                {hasSeparator && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#3f4147" }} />
                    <span style={{ fontSize: "10px", color: "#949ba4", fontWeight: 700 }}>SEPARATOR</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#3f4147" }} />
                    <DismissButton onClick={() => setHasSeparator(false)} title="Remove Separator" />
                  </div>
                )}

                {/* Media Gallery Component */}
                {mediaGallery.length > 0 && (
                  <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", padding: "12px", border: "1px solid #2b2d31", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Grid size={14} /> MEDIA GALLERY ({mediaGallery.length}/4)
                      </span>
                      <DismissButton onClick={() => setMediaGallery([])} title="Clear Media Gallery" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
                      {mediaGallery.map((mg) => (
                        <div key={mg.id} style={{ backgroundColor: "#2b2d31", padding: "8px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
                          <input
                            value={mg.url}
                            onChange={(e) => setMediaGallery((prev) => prev.map((item) => (item.id === mg.id ? { ...item, url: e.target.value } : item)))}
                            placeholder="Image URL..."
                            style={{ backgroundColor: "#1e1f22", border: "1px solid #383a40", borderRadius: "4px", color: "#fff", fontSize: "11px", padding: "4px 8px", outline: "none" }}
                          />
                          {mg.url.trim() && (
                            <img src={mg.url} alt="Gallery item" style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "4px" }} />
                          )}
                          <div style={{ position: "absolute", top: "4px", right: "4px" }}>
                            <DismissButton onClick={() => setMediaGallery((prev) => prev.filter((item) => item.id !== mg.id))} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Files Component */}
                {attachedFiles.length > 0 && (
                  <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", padding: "12px", border: "1px solid #2b2d31", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Paperclip size={14} /> ATTACHED FILES
                    </span>
                    {attachedFiles.map((f) => (
                      <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#2b2d31", padding: "6px 10px", borderRadius: "6px" }}>
                        <input
                          value={f.fileName}
                          onChange={(e) => setAttachedFiles((prev) => prev.map((item) => (item.id === f.id ? { ...item, fileName: e.target.value } : item)))}
                          placeholder="filename.pdf"
                          style={{ backgroundColor: "#1e1f22", border: "none", color: "#fff", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", outline: "none", width: "120px" }}
                        />
                        <input
                          value={f.url}
                          onChange={(e) => setAttachedFiles((prev) => prev.map((item) => (item.id === f.id ? { ...item, url: e.target.value } : item)))}
                          placeholder="https://attachment-url.com/file"
                          style={{ backgroundColor: "#1e1f22", border: "none", color: "#949ba4", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", outline: "none", flex: 1 }}
                        />
                        <DismissButton onClick={() => setAttachedFiles((prev) => prev.filter((item) => item.id !== f.id))} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Embed Cards List */}
                {embeds.map((embed, index) => {
                  const isSelected = embed.id === activeEmbedId;
                  return (
                    <div
                      key={embed.id}
                      onClick={() => setActiveEmbedId(embed.id)}
                      style={{
                        borderLeft: embed.color ? `4px solid ${embed.color}` : "4px solid transparent",
                        backgroundColor: "#1e1f22",
                        padding: "16px",
                        borderRadius: "0 8px 8px 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        borderTop: "1px solid #2b2d31",
                        borderRight: "1px solid #2b2d31",
                        borderBottom: "1px solid #2b2d31",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {/* Active State Badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {isSelected ? (
                            <span style={{ backgroundColor: "#2b2d31", color: "#5865f2", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px", border: "1px solid #5865f2" }}>
                              Active Container #{index + 1}
                            </span>
                          ) : (
                            <span style={{ color: "#949ba4", fontSize: "11px", fontWeight: 600 }}>
                              Container #{index + 1}
                            </span>
                          )}

                          {embed.color !== undefined && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: 700 }}>COLOR:</span>
                              <input
                                type="color"
                                value={embed.color}
                                onChange={(e) => updateActiveEmbed({ color: e.target.value })}
                                style={{ background: "none", border: "none", width: "22px", height: "22px", cursor: "pointer" }}
                              />
                              <DismissButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateActiveEmbed({ color: undefined });
                                }}
                                title="Remove Color"
                              />
                            </div>
                          )}
                        </div>

                        <DismissButton
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = embeds.filter((e) => e.id !== embed.id);
                            setEmbeds(next);
                            setActiveEmbedId(next[0]?.id || null);
                          }}
                          title="Delete Container"
                        />
                      </div>

                      {/* Author Header */}
                      {embed.authorName !== undefined && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {embed.authorIconUrl ? (
                              <img src={embed.authorIconUrl} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
                            ) : null}
                            <input
                              value={embed.authorName}
                              onChange={(e) => updateActiveEmbed({ authorName: e.target.value })}
                              placeholder="Author Name..."
                              style={{ background: "transparent", border: "none", color: "#b5bac1", fontSize: "12px", fontWeight: 600, outline: "none", flex: 1 }}
                            />
                            <DismissButton
                              onClick={() => updateActiveEmbed({ authorName: undefined, authorIconUrl: undefined, authorUrl: undefined })}
                              title="Remove Author"
                            />
                          </div>
                          <input
                            value={embed.authorUrl || ""}
                            onChange={(e) => updateActiveEmbed({ authorUrl: e.target.value })}
                            placeholder="Author Link URL (optional)..."
                            style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "4px", color: "#949ba4", fontSize: "11px", padding: "4px 8px", outline: "none" }}
                          />
                        </div>
                      )}

                      {/* Title & Description Grid */}
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                          {embed.title !== undefined && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <input
                                  value={embed.title}
                                  onChange={(e) => updateActiveEmbed({ title: e.target.value })}
                                  placeholder="Embed Title..."
                                  style={{ background: "transparent", border: "none", color: "#fff", fontSize: "16px", fontWeight: 700, outline: "none", flex: 1 }}
                                />
                                <DismissButton
                                  onClick={() => updateActiveEmbed({ title: undefined, titleUrl: undefined })}
                                  title="Remove Title"
                                />
                              </div>
                              <input
                                value={embed.titleUrl || ""}
                                onChange={(e) => updateActiveEmbed({ titleUrl: e.target.value })}
                                placeholder="Title Link URL (optional)..."
                                style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "4px", color: "#949ba4", fontSize: "11px", padding: "4px 8px", outline: "none" }}
                              />
                            </div>
                          )}

                          {embed.description !== undefined && (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                              <textarea
                                value={embed.description}
                                onChange={(e) => updateActiveEmbed({ description: e.target.value })}
                                placeholder="Embed description text..."
                                rows={2}
                                style={{ background: "transparent", border: "none", color: "#dbdee1", fontSize: "13px", outline: "none", resize: "vertical", width: "100%" }}
                              />
                              <DismissButton
                                onClick={() => updateActiveEmbed({ description: undefined })}
                                title="Remove Description"
                              />
                            </div>
                          )}
                        </div>

                        {/* Thumbnail Image */}
                        {embed.thumbnailUrl !== undefined && (
                          <div style={{ position: "relative" }}>
                            {embed.thumbnailUrl.trim() ? (
                              <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "6px", overflow: "hidden", border: "1px solid #383a40" }}>
                                <img src={embed.thumbnailUrl} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <div style={{ position: "absolute", top: "2px", right: "2px" }}>
                                  <DismissButton onClick={() => updateActiveEmbed({ thumbnailUrl: undefined })} />
                                </div>
                              </div>
                            ) : (
                              <div style={{ width: "80px", height: "80px", border: "1px dashed #3f4147", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px", backgroundColor: "#2b2d31", position: "relative" }}>
                                <ImageIcon size={16} color="#949ba4" />
                                <input
                                  value={embed.thumbnailUrl}
                                  onChange={(e) => updateActiveEmbed({ thumbnailUrl: e.target.value })}
                                  placeholder="Paste URL..."
                                  style={{ width: "90%", backgroundColor: "#1e1f22", border: "none", color: "#fff", fontSize: "9px", borderRadius: "3px", padding: "2px 4px", marginTop: "4px", outline: "none", textAlign: "center" }}
                                />
                                <div style={{ position: "absolute", top: "2px", right: "2px" }}>
                                  <DismissButton onClick={() => updateActiveEmbed({ thumbnailUrl: undefined })} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Fields */}
                      {embed.fields.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                            {embed.fields.map((field) => (
                              <div key={field.id} style={{ backgroundColor: "#2b2d31", padding: "10px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <input
                                    value={field.name}
                                    onChange={(e) =>
                                      updateActiveEmbed({
                                        fields: embed.fields.map((f) => (f.id === field.id ? { ...f, name: e.target.value } : f)),
                                      })
                                    }
                                    placeholder="Field Name"
                                    style={{ background: "transparent", border: "none", color: "#fff", fontSize: "12px", fontWeight: 700, outline: "none", width: "70%" }}
                                  />
                                  <select
                                    value={field.inline ? "inline" : "stacked"}
                                    onChange={(e) =>
                                      updateActiveEmbed({
                                        fields: embed.fields.map((f) => (f.id === field.id ? { ...f, inline: e.target.value === "inline" } : f)),
                                      })
                                    }
                                    style={{ backgroundColor: "#1e1f22", border: "none", color: "#949ba4", borderRadius: "4px", fontSize: "10px", padding: "2px 4px", outline: "none" }}
                                  >
                                    <option value="inline">Inline</option>
                                    <option value="stacked">Stacked</option>
                                  </select>
                                </div>

                                <input
                                  value={field.value}
                                  onChange={(e) =>
                                    updateActiveEmbed({
                                      fields: embed.fields.map((f) => (f.id === field.id ? { ...f, value: e.target.value } : f)),
                                    })
                                  }
                                  placeholder="Field Value"
                                  style={{ background: "transparent", border: "none", color: "#dbdee1", fontSize: "12px", outline: "none" }}
                                />

                                <div style={{ position: "absolute", bottom: "6px", right: "6px" }}>
                                  <DismissButton
                                    onClick={() =>
                                      updateActiveEmbed({
                                        fields: embed.fields.filter((f) => f.id !== field.id),
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Banner Image */}
                      {embed.imageUrl !== undefined && (
                        <div style={{ position: "relative", width: "100%", marginTop: "4px" }}>
                          {embed.imageUrl.trim() ? (
                            <div style={{ position: "relative", width: "100%", maxHeight: "200px", borderRadius: "6px", overflow: "hidden", border: "1px solid #383a40" }}>
                              <img src={embed.imageUrl} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              <div style={{ position: "absolute", top: "6px", right: "6px" }}>
                                <DismissButton onClick={() => updateActiveEmbed({ imageUrl: undefined })} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ width: "100%", height: "90px", border: "1px dashed #3f4147", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", backgroundColor: "#2b2d31", position: "relative" }}>
                              <ImageIcon size={20} color="#949ba4" />
                              <input
                                value={embed.imageUrl}
                                onChange={(e) => updateActiveEmbed({ imageUrl: e.target.value })}
                                placeholder="Paste Banner Image URL..."
                                style={{ width: "70%", backgroundColor: "#1e1f22", border: "1px solid #383a40", color: "#fff", fontSize: "11px", borderRadius: "4px", padding: "4px 8px", outline: "none", textAlign: "center" }}
                              />
                              <div style={{ position: "absolute", top: "6px", right: "6px" }}>
                                <DismissButton onClick={() => updateActiveEmbed({ imageUrl: undefined })} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer & Timestamp */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "4px" }}>
                        {embed.footerText !== undefined && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                            {embed.footerIconUrl ? (
                              <img src={embed.footerIconUrl} alt="" style={{ width: "16px", height: "16px", borderRadius: "50%", objectFit: "cover" }} />
                            ) : null}
                            <input
                              value={embed.footerText}
                              onChange={(e) => updateActiveEmbed({ footerText: e.target.value })}
                              placeholder="Footer note..."
                              style={{ background: "transparent", border: "none", color: "#949ba4", fontSize: "11px", outline: "none", flex: 1 }}
                            />
                            <DismissButton
                              onClick={() => updateActiveEmbed({ footerText: undefined, footerIconUrl: undefined })}
                              title="Remove Footer"
                            />
                          </div>
                        )}

                        {embed.timestamp !== undefined && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Clock size={12} color="#949ba4" />
                            <span style={{ fontSize: "10px", color: "#949ba4" }}>{new Date(embed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <DismissButton
                              onClick={() => updateActiveEmbed({ timestamp: undefined })}
                              title="Remove Timestamp"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Link Buttons Action Row */}
                {linkButtons.length > 0 && (
                  <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", padding: "14px", border: "1px solid #2b2d31", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: 700 }}>ACTION ROW — BUTTON ROW</span>
                      <DismissButton onClick={() => setLinkButtons([])} title="Clear Buttons" />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {linkButtons.map((btn) => (
                        <div key={btn.id} style={{ backgroundColor: "#2b2d31", border: "1px solid #383a40", borderRadius: "6px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <ExternalLink size={14} color="#949ba4" />
                          <input
                            value={btn.label}
                            onChange={(e) => setLinkButtons((prev) => prev.map((b) => (b.id === btn.id ? { ...b, label: e.target.value } : b)))}
                            placeholder="Button Label"
                            style={{ backgroundColor: "#1e1f22", border: "none", color: "#fff", borderRadius: "4px", padding: "3px 6px", fontSize: "12px", outline: "none", width: "90px" }}
                          />
                          <input
                            value={btn.url}
                            onChange={(e) => setLinkButtons((prev) => prev.map((b) => (b.id === btn.id ? { ...b, url: e.target.value } : b)))}
                            placeholder="https://..."
                            style={{ backgroundColor: "#1e1f22", border: "none", color: "#949ba4", borderRadius: "4px", padding: "3px 6px", fontSize: "12px", outline: "none", width: "130px" }}
                          />
                          <DismissButton onClick={() => setLinkButtons((prev) => prev.filter((b) => b.id !== btn.id))} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOT PROFILE & SIGNALS */}
        {tab === "bot_settings" && (
          <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", border: "1px solid #2b2d31", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "15px", color: "#fff", margin: 0, fontWeight: 700 }}>Bot Profile & Message Signals</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#b5bac1", fontWeight: 700 }}>OVERRIDE USERNAME</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Webhook Bot"
                  style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "6px", color: "#fff", padding: "8px 12px", fontSize: "13px", outline: "none" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#b5bac1", fontWeight: 700 }}>AVATAR URL</span>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "6px", color: "#fff", padding: "8px 12px", fontSize: "13px", outline: "none" }}
                />
              </label>
            </div>

            <div style={{ borderTop: "1px solid #2b2d31", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "11px", color: "#b5bac1", fontWeight: 700 }}>FORUM & THREAD CREATION OPTIONS</span>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#949ba4" }}>NEW THREAD / FORUM TITLE (thread_name)</span>
                  <input
                    value={threadName}
                    onChange={(e) => setThreadName(e.target.value)}
                    placeholder="Thread title when posting in Forum Channel"
                    style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "6px", color: "#fff", padding: "8px 12px", fontSize: "13px", outline: "none" }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#949ba4" }}>FORUM TAG IDs (comma separated)</span>
                  <input
                    value={appliedTags}
                    onChange={(e) => setAppliedTags(e.target.value)}
                    placeholder="102123..., 102124..."
                    style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "6px", color: "#fff", padding: "8px 12px", fontSize: "13px", outline: "none" }}
                  />
                </label>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #2b2d31", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "11px", color: "#b5bac1", fontWeight: 700 }}>MESSAGE FLAGS & MODERATION</span>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={suppressNotifications}
                  onChange={(e) => setSuppressNotifications(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#5865f2" }}
                />
                <span style={{ fontSize: "13px", color: "#dbdee1" }}>Silent Ping (Suppress desktop & mobile push notifications)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={suppressEmbeds}
                  onChange={(e) => setSuppressEmbeds(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#5865f2" }}
                />
                <span style={{ fontSize: "13px", color: "#dbdee1" }}>Suppress Link Previews (Hide URL preview embeds)</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: DEPLOY & DISPATCH */}
        {tab === "dispatch" && (
          <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", border: "1px solid #2b2d31", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "15px", color: "#fff", margin: 0, fontWeight: 700 }}>Target Destination</h2>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "#b5bac1", fontWeight: 700 }}>DISCORD WEBHOOK URL *</span>
              <input
                type="password"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "6px", color: "#fff", padding: "8px 12px", fontSize: "13px", outline: "none" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "#b5bac1", fontWeight: 700 }}>TARGET THREAD ID (OPTIONAL)</span>
              <input
                value={threadId}
                onChange={(e) => setThreadId(e.target.value)}
                placeholder="Target an existing thread channel ID"
                style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "6px", color: "#fff", padding: "8px 12px", fontSize: "13px", outline: "none" }}
              />
            </label>
          </div>
        )}

        {/* TAB 4: RAW JSON VIEW */}
        {tab === "json" && (
          <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", border: "1px solid #2b2d31", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: 700 }}>PAYLOAD JSON</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(jsonString);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                style={{ backgroundColor: "#2b2d31", border: "none", color: "#fff", padding: "5px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy Payload"}
              </button>
            </div>
            <pre style={{ margin: 0, fontSize: "13px", color: "#569cd6", fontFamily: "monospace", overflowX: "auto" }}>{jsonString}</pre>
          </div>
        )}

        {/* Status Notification Banner */}
        {sendResult && (
          <div
            style={{
              backgroundColor: sendResult.kind === "success" ? "rgba(35, 165, 90, 0.15)" : "rgba(242, 63, 67, 0.15)",
              border: `1px solid ${sendResult.kind === "success" ? "#23a55a" : "#f23f43"}`,
              borderRadius: "6px",
              padding: "10px 14px",
              color: "#fff",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={15} color={sendResult.kind === "success" ? "#23a55a" : "#f23f43"} />
            {sendResult.message}
          </div>
        )}
      </div>
    </div>
  );
}