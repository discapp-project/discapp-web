"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
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
  GripVertical,
} from "lucide-react";

type WorkspaceTab = "builder" | "bot_settings" | "dispatch" | "json";

type LinkButton = { id: string; label: string; url: string };
type MediaGalleryItem = { id: string; url: string; description: string; spoiler: boolean };
type AttachedFile = { id: string; fileName: string; url: string };
type SeparatorBlock = { id: string; divider: boolean; spacing: 1 | 2 };

type EmbedBlockType =
  | "author"
  | "title"
  | "description"
  | "fields"
  | "thumbnail"
  | "image"
  | "section_button"
  | "separator"
  | "footer"
  | "timestamp";

type EmbedField = { id: string; name: string; value: string; inline: boolean };

type Embed = {
  id: string;
  blockOrder: EmbedBlockType[];
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
  sectionText?: string;
  sectionButtonLabel?: string;
  sectionButtonUrl?: string;
  separatorDivider?: boolean;
  separatorSpacing?: 1 | 2;
  fields: EmbedField[];
};

type DiscordComponent =
  | { type: 1; components: Array<{ type: 2; style: 5; label: string; url: string }> }
  | {
      type: 9;
      components: Array<{ type: 10; content: string }>;
      accessory: { type: 11; media: { url: string } } | { type: 2; style: 5; label: string; url: string };
    }
  | { type: 10; content: string }
  | { type: 12; items: Array<{ media: { url: string }; description?: string; spoiler?: boolean }> }
  | { type: 14; divider: boolean; spacing: 1 | 2 }
  | { type: 17; accent_color?: number; components: DiscordComponent[] };

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  thread_name?: string;
  applied_tags?: string[];
  flags: number;
  components: DiscordComponent[];
}

type ImportedBuilderState = {
  content: string;
  username: string;
  avatarUrl: string;
  threadName: string;
  appliedTags: string;
  suppressEmbeds: boolean;
  suppressNotifications: boolean;
  linkButtons: LinkButton[];
  textDisplays: { id: string; text: string }[];
  mediaGallery: MediaGalleryItem[];
  separators: SeparatorBlock[];
  componentOrder: string[];
  embeds: Embed[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function makeEmbed(): Embed {
  return {
    id: crypto.randomUUID(),
    blockOrder: [],
    separatorDivider: true,
    separatorSpacing: 1,
    fields: [],
  };
}

function importEmbedComponent(component: Record<string, unknown>): Embed {
  const embed = makeEmbed();
  if (typeof component.accent_color === "number" && Number.isInteger(component.accent_color) && component.accent_color >= 0 && component.accent_color <= 0xffffff) {
    embed.color = `#${component.accent_color.toString(16).padStart(6, "0")}`;
  }
  if (!Array.isArray(component.components)) throw new Error("A container must have a components array.");

  const addBlock = (block: EmbedBlockType) => {
    if (!embed.blockOrder.includes(block)) embed.blockOrder.push(block);
  };
  const addText = (text: string) => {
    const paragraphs = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
    const description: string[] = [];
    for (const paragraph of paragraphs) {
      const titleMatch = /^## (.+)$/.exec(paragraph);
      const linkedTitleMatch = /^## \[(.+)\]\((https?:\/\/[^)]+)\)$/.exec(paragraph);
      if (linkedTitleMatch || titleMatch) {
        const match = linkedTitleMatch ?? titleMatch!;
        embed.title = match[1];
        if (linkedTitleMatch) embed.titleUrl = linkedTitleMatch[2];
        addBlock("title");
        continue;
      }
      const timestampMatch = /^-# <t:(\d+):f>$/.exec(paragraph);
      if (timestampMatch) {
        embed.timestamp = new Date(Number(timestampMatch[1]) * 1000).toISOString();
        addBlock("timestamp");
        continue;
      }
      const footerMatch = /^-# (.+)$/.exec(paragraph);
      if (footerMatch) {
        embed.footerText = footerMatch[1];
        addBlock("footer");
        continue;
      }
      const authorLinkMatch = /^\*\*\[(.+)\]\((https?:\/\/[^)]+)\)\*\*$/.exec(paragraph);
      const authorMatch = /^\*\*(.+)\*\*$/.exec(paragraph);
      if (authorLinkMatch || authorMatch) {
        const match = authorLinkMatch ?? authorMatch!;
        embed.authorName = match[1];
        if (authorLinkMatch) embed.authorUrl = authorLinkMatch[2];
        addBlock("author");
        continue;
      }
      const fieldMatch = /^\*\*(.+)\*\*\n([\s\S]+)$/.exec(paragraph);
      if (fieldMatch) {
        embed.fields.push({ id: crypto.randomUUID(), name: fieldMatch[1], value: fieldMatch[2], inline: true });
        addBlock("fields");
        continue;
      }
      description.push(paragraph);
    }
    if (description.length) {
      embed.description = [embed.description, ...description].filter(Boolean).join("\n\n");
      addBlock("description");
    }
  };

  for (const item of component.components) {
    if (!isRecord(item) || typeof item.type !== "number") throw new Error("A container contains an invalid component.");
    if (item.type === 10) {
      if (typeof item.content !== "string") throw new Error("A Text Display must have string content.");
      addText(item.content);
      continue;
    }
    if (item.type === 14) {
      if (typeof item.divider !== "boolean" || (item.spacing !== 1 && item.spacing !== 2)) {
        throw new Error("A separator needs a boolean divider and spacing of 1 or 2.");
      }
      embed.separatorDivider = item.divider;
      embed.separatorSpacing = item.spacing;
      addBlock("separator");
      continue;
    }
    if (item.type === 12) {
      if (!Array.isArray(item.items) || item.items.length !== 1) {
        throw new Error("A container image must contain exactly one media item.");
      }
      const media = item.items[0];
      if (!isRecord(media) || !isRecord(media.media) || typeof media.media.url !== "string") {
        throw new Error("A container image must have a media URL.");
      }
      embed.imageUrl = media.media.url;
      addBlock("image");
      continue;
    }
    if (item.type === 9) {
      if (!Array.isArray(item.components) || !isRecord(item.accessory)) {
        throw new Error("A section needs text components and a valid accessory.");
      }
      const text = item.components.map((child) => {
        if (!isRecord(child) || child.type !== 10 || typeof child.content !== "string") {
          throw new Error("A section can only contain Text Display components.");
        }
        return child.content;
      }).join("\n\n");
      if (item.accessory.type === 2) {
        if (typeof item.accessory.label !== "string" || typeof item.accessory.url !== "string") {
          throw new Error("A section link button needs a label and URL.");
        }
        embed.sectionText = text;
        embed.sectionButtonLabel = item.accessory.label;
        embed.sectionButtonUrl = item.accessory.url;
        addBlock("section_button");
        continue;
      }
      if (item.accessory.type === 11 && isRecord(item.accessory.media) && typeof item.accessory.media.url === "string") {
        const authorMatch = /^\*\*(.+)\*\*$/.exec(text);
        if (authorMatch) {
          embed.authorName = authorMatch[1];
          embed.authorIconUrl = item.accessory.media.url;
          addBlock("author");
        } else {
          embed.thumbnailUrl = item.accessory.media.url;
          addBlock("thumbnail");
          addText(text);
        }
        continue;
      }
      throw new Error("A section accessory must be a link button or thumbnail.");
    }
    throw new Error(`Container component type ${item.type} is not supported by the builder.`);
  }
  return embed;
}

function importClassicEmbed(value: unknown): Embed {
  if (!isRecord(value)) throw new Error("Each embed must be an object.");
  const embed = makeEmbed();
  if (value.title !== undefined) {
    if (typeof value.title !== "string") throw new Error("Embed title must be a string.");
    embed.title = value.title;
    if (typeof value.url === "string") embed.titleUrl = value.url;
    embed.blockOrder.push("title");
  }
  if (value.description !== undefined) {
    if (typeof value.description !== "string") throw new Error("Embed description must be a string.");
    embed.description = value.description;
    embed.blockOrder.push("description");
  }
  if (typeof value.color === "number" && Number.isInteger(value.color) && value.color >= 0 && value.color <= 0xffffff) {
    embed.color = `#${value.color.toString(16).padStart(6, "0")}`;
  }
  if (value.author !== undefined) {
    if (!isRecord(value.author) || typeof value.author.name !== "string") throw new Error("Embed author must have a name.");
    embed.authorName = value.author.name;
    if (typeof value.author.url === "string") embed.authorUrl = value.author.url;
    if (typeof value.author.icon_url === "string") embed.authorIconUrl = value.author.icon_url;
    embed.blockOrder.push("author");
  }
  if (value.thumbnail !== undefined) {
    if (!isRecord(value.thumbnail) || typeof value.thumbnail.url !== "string") throw new Error("Embed thumbnail must have a URL.");
    embed.thumbnailUrl = value.thumbnail.url;
    embed.blockOrder.push("thumbnail");
  }
  if (value.image !== undefined) {
    if (!isRecord(value.image) || typeof value.image.url !== "string") throw new Error("Embed image must have a URL.");
    embed.imageUrl = value.image.url;
    embed.blockOrder.push("image");
  }
  if (value.footer !== undefined) {
    if (!isRecord(value.footer) || typeof value.footer.text !== "string") throw new Error("Embed footer must have text.");
    embed.footerText = value.footer.text;
    if (typeof value.footer.icon_url === "string") embed.footerIconUrl = value.footer.icon_url;
    embed.blockOrder.push("footer");
  }
  if (value.timestamp !== undefined) {
    if (typeof value.timestamp !== "string" || !Number.isFinite(Date.parse(value.timestamp))) {
      throw new Error("Embed timestamp must be a valid date.");
    }
    embed.timestamp = new Date(value.timestamp).toISOString();
    embed.blockOrder.push("timestamp");
  }
  if (value.fields !== undefined) {
    if (!Array.isArray(value.fields) || value.fields.length > 25) throw new Error("Embed fields must be an array of up to 25 items.");
    embed.fields = value.fields.map((field) => {
      if (!isRecord(field) || typeof field.name !== "string" || typeof field.value !== "string") {
        throw new Error("Each embed field needs string name and value.");
      }
      return {
        id: crypto.randomUUID(),
        name: field.name,
        value: field.value,
        inline: typeof field.inline === "boolean" ? field.inline : false,
      };
    });
    if (embed.fields.length) embed.blockOrder.push("fields");
  }
  return embed;
}

function importPayload(value: unknown): ImportedBuilderState {
  if (!isRecord(value)) throw new Error("Expected a JSON object at the top level.");
  const allowedKeys = new Set(["content", "username", "avatar_url", "tts", "embeds", "allowed_mentions", "flags", "components", "thread_name", "applied_tags"]);
  const unsupportedKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unsupportedKey) throw new Error(`Unsupported payload property "${unsupportedKey}".`);
  if (value.content !== undefined && (typeof value.content !== "string" || value.content.length > 2000)) {
    throw new Error("content must be a string of 2,000 characters or fewer.");
  }
  if (value.username !== undefined && (typeof value.username !== "string" || value.username.length > 80)) {
    throw new Error("username must be a string of 80 characters or fewer.");
  }
  if (value.avatar_url !== undefined && (typeof value.avatar_url !== "string" || !/^https?:\/\//i.test(value.avatar_url))) {
    throw new Error("avatar_url must be an HTTP or HTTPS URL.");
  }
  if (value.thread_name !== undefined && (typeof value.thread_name !== "string" || value.thread_name.length > 100)) {
    throw new Error("thread_name must be a string of 100 characters or fewer.");
  }
  if (value.applied_tags !== undefined && (!Array.isArray(value.applied_tags) || value.applied_tags.some((tag) => typeof tag !== "string"))) {
    throw new Error("applied_tags must be an array of strings.");
  }
  const flags = value.flags === undefined ? 0 : value.flags;
  if (!Number.isInteger(flags) || ((flags as number) & ~((1 << 2) | (1 << 12) | (1 << 15))) !== 0) {
    throw new Error("flags contains unsupported message flags.");
  }
  const isComponentsV2 = ((flags as number) & (1 << 15)) !== 0;
  if (isComponentsV2 && (value.content !== undefined || value.embeds !== undefined)) {
    throw new Error("Components V2 payloads cannot include content or embeds.");
  }
  if (isComponentsV2 && !Array.isArray(value.components)) {
    throw new Error("Components V2 payloads must include a components array.");
  }
  if (!isComponentsV2 && value.components !== undefined) {
    throw new Error("components requires the Components V2 flag.");
  }
  if (value.embeds !== undefined && !Array.isArray(value.embeds)) throw new Error("embeds must be an array.");
  if (Array.isArray(value.embeds) && value.embeds.length > 10) throw new Error("A message can contain up to 10 embeds.");
  if (value.tts !== undefined) throw new Error("tts is not configurable in the builder.");
  if (value.allowed_mentions !== undefined) throw new Error("allowed_mentions is not configurable in the builder.");

  let importedContent = typeof value.content === "string" ? value.content : "";
  const linkButtons: LinkButton[] = [];
  const textDisplays: { id: string; text: string }[] = [];
  const mediaGallery: MediaGalleryItem[] = [];
  const separators: SeparatorBlock[] = [];
  const embeds: Embed[] = [];
  const componentOrder: string[] = [];
  if (value.components !== undefined) {
    if (!isComponentsV2 || !Array.isArray(value.components) || value.components.length > 40) {
      throw new Error("components must be an array in a Components V2 payload.");
    }
    for (const component of value.components) {
      if (!isRecord(component) || typeof component.type !== "number") throw new Error("Each component must have a numeric type.");
      if (component.type === 10) {
        if (typeof component.content !== "string" || component.content.length > 4000) throw new Error("Text Display content must be a string of 4,000 characters or fewer.");
        if (!importedContent && textDisplays.length === 0) {
          importedContent = component.content;
        } else {
          const item = { id: crypto.randomUUID(), text: component.content };
          textDisplays.push(item);
          componentOrder.push(`text:${item.id}`);
        }
      } else if (component.type === 1) {
        if (!Array.isArray(component.components) || component.components.length > 5) throw new Error("An action row must contain up to 5 buttons.");
        for (const button of component.components) {
          if (
            !isRecord(button)
            || button.type !== 2
            || button.style !== 5
            || typeof button.label !== "string"
            || !button.label.trim()
            || button.label.length > 80
            || typeof button.url !== "string"
            || !/^https?:\/\//i.test(button.url)
          ) {
            throw new Error("Action rows can only contain link buttons with a label and URL.");
          }
          linkButtons.push({ id: crypto.randomUUID(), label: button.label, url: button.url });
        }
        if (linkButtons.length > 5) throw new Error("The builder supports up to 5 link buttons.");
        if (linkButtons.length) componentOrder.push("buttons");
      } else if (component.type === 12) {
        if (!Array.isArray(component.items) || component.items.length > 10) throw new Error("A media gallery can contain up to 10 items.");
        for (const media of component.items) {
          if (!isRecord(media) || !isRecord(media.media) || typeof media.media.url !== "string" || !/^https?:\/\//i.test(media.media.url)) throw new Error("Each gallery item needs an HTTP or HTTPS media URL.");
          const item = {
            id: crypto.randomUUID(),
            url: media.media.url,
            description: typeof media.description === "string" ? media.description : "",
            spoiler: media.spoiler === true,
          };
          mediaGallery.push(item);
        }
        if (mediaGallery.length) componentOrder.push("gallery");
      } else if (component.type === 14) {
        if (typeof component.divider !== "boolean" || (component.spacing !== 1 && component.spacing !== 2)) {
          throw new Error("A separator needs a boolean divider and spacing of 1 or 2.");
        }
        const item = {
          id: crypto.randomUUID(),
          divider: component.divider,
          spacing: component.spacing === 2 ? 2 as const : 1 as const,
        };
        separators.push(item);
        componentOrder.push(`separator:${item.id}`);
      } else if (component.type === 17) {
        const embed = importEmbedComponent(component);
        embeds.push(embed);
        componentOrder.push(`container:${embed.id}`);
      } else {
        throw new Error(`Component type ${component.type} is not supported by the builder.`);
      }
    }
  }

  if (Array.isArray(value.embeds)) {
    for (const classicEmbed of value.embeds) {
      const embed = importClassicEmbed(classicEmbed);
      embeds.push(embed);
      componentOrder.push(`container:${embed.id}`);
    }
  }
  if (embeds.length > 10) throw new Error("The builder supports up to 10 containers or embeds.");
  if (isComponentsV2 && (value.components as unknown[]).length === 0) {
    throw new Error("A Components V2 message needs at least one component.");
  }
  if (!isComponentsV2 && !importedContent.trim() && !embeds.length) {
    throw new Error("The payload needs message content or at least one embed.");
  }

  return {
    content: importedContent,
    username: typeof value.username === "string" ? value.username : "",
    avatarUrl: typeof value.avatar_url === "string" ? value.avatar_url : "",
    threadName: typeof value.thread_name === "string" ? value.thread_name : "",
    appliedTags: Array.isArray(value.applied_tags) ? value.applied_tags.join(", ") : "",
    suppressEmbeds: ((flags as number) & (1 << 2)) !== 0,
    suppressNotifications: ((flags as number) & (1 << 12)) !== 0,
    linkButtons,
    textDisplays,
    mediaGallery,
    separators,
    componentOrder,
    embeds,
  };
}

export default function DiscordStudioWorkspace() {
  const [tab, setTab] = useState<WorkspaceTab>("builder");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookProfile, setWebhookProfile] = useState<{ webhookUrl: string; username: string; avatarUrl: string } | null>(null);
  const [profileError, setProfileError] = useState<{ webhookUrl: string; message: string } | null>(null);
  const [messageUrl, setMessageUrl] = useState("");
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [rawJsonEdited, setRawJsonEdited] = useState(false);
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState("");
  const [threadName, setThreadName] = useState("");
  const [appliedTags, setAppliedTags] = useState("");
  const [suppressEmbeds, setSuppressEmbeds] = useState(false);
  const [suppressNotifications, setSuppressNotifications] = useState(false);

  const [linkButtons, setLinkButtons] = useState<LinkButton[]>([]);
  const [textDisplays, setTextDisplays] = useState<{ id: string; text: string }[]>([]);
  const [mediaGallery, setMediaGallery] = useState<MediaGalleryItem[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [separators, setSeparators] = useState<SeparatorBlock[]>([]);
  const [componentOrder, setComponentOrder] = useState<string[]>([]);

  const [embeds, setEmbeds] = useState<Embed[]>([]);
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const activeEmbed = embeds.find((e) => e.id === activeEmbedId) || embeds[0] || null;
  const hasEmbed = embeds.length > 0;
  const activeComponentOrder = useMemo(() => {
    const available = [
      ...textDisplays.map((item) => `text:${item.id}`),
      ...(attachedFiles.length > 0 ? ["attachments"] : []),
      ...(mediaGallery.length > 0 ? ["gallery"] : []),
      ...separators.map((item) => `separator:${item.id}`),
      ...embeds.map((item) => `container:${item.id}`),
      ...(linkButtons.length > 0 ? ["buttons"] : []),
    ];
    const saved = componentOrder.filter((key) => available.includes(key));
    return [...saved, ...available.filter((key) => !saved.includes(key))];
  }, [textDisplays, attachedFiles.length, mediaGallery.length, separators, embeds, linkButtons.length, componentOrder]);

  const updateActiveEmbed = (changes: Partial<Embed>) => {
    if (!activeEmbed) return;
    setEmbeds((prev) => prev.map((e) => (e.id === activeEmbed.id ? { ...e, ...changes } : e)));
  };

  const createNewEmbed = () => {
    if (embeds.length >= 10) return null;
    const newEmbed: Embed = {
      id: crypto.randomUUID(),
      blockOrder: [],
      separatorDivider: true,
      separatorSpacing: 1,
      fields: [],
    };
    setEmbeds((prev) => [...prev, newEmbed]);
    addToComponentOrder(`container:${newEmbed.id}`);
    setActiveEmbedId(newEmbed.id);
    return newEmbed;
  };

  const addToComponentOrder = (key: string) => {
    setComponentOrder((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const removeFromComponentOrder = (key: string) => {
    setComponentOrder((prev) => prev.filter((item) => item !== key));
  };

  const moveComponent = (key: string, direction: "up" | "down") => {
    const orderedKeys = [...activeComponentOrder];
    const index = orderedKeys.indexOf(key);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= orderedKeys.length) return;
    [orderedKeys[index], orderedKeys[targetIndex]] = [orderedKeys[targetIndex], orderedKeys[index]];
    setComponentOrder(orderedKeys);
  };

  const addBlockToActiveEmbed = (blockType: EmbedBlockType) => {
    if (!activeEmbed) return;
    if (!activeEmbed.blockOrder.includes(blockType)) {
      updateActiveEmbed({
        blockOrder: [...activeEmbed.blockOrder, blockType],
      });
    }
  };

  const moveBlock = (embedId: string, index: number, direction: "up" | "down") => {
    setEmbeds((prev) =>
      prev.map((e) => {
        if (e.id !== embedId) return e;
        const newOrder = [...e.blockOrder];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newOrder.length) return e;

        const [moved] = newOrder.splice(index, 1);
        newOrder.splice(targetIndex, 0, moved);
        return { ...e, blockOrder: newOrder };
      })
    );
  };

  const addLinkButton = () => {
    if (linkButtons.length >= 5) return;
    if (linkButtons.length === 0) addToComponentOrder("buttons");
    setLinkButtons((prev) => [...prev, { id: crypto.randomUUID(), label: "Visit Link", url: "" }]);
  };

  const addTextDisplay = () => {
    const item = { id: crypto.randomUUID(), text: "Additional text section..." };
    addToComponentOrder(`text:${item.id}`);
    setTextDisplays((prev) => [...prev, item]);
  };

  const addMediaGalleryItem = () => {
    if (mediaGallery.length >= 10) return;
    if (mediaGallery.length === 0) addToComponentOrder("gallery");
    setMediaGallery((prev) => [...prev, { id: crypto.randomUUID(), url: "", description: "", spoiler: false }]);
  };

  const addAttachedFile = () => {
    if (attachedFiles.length === 0) addToComponentOrder("attachments");
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
        if (separators.length < 10) {
          const separator = { id: crypto.randomUUID(), divider: true, spacing: 1 as const };
          addToComponentOrder(`separator:${separator.id}`);
          setSeparators((prev) => [...prev, separator]);
        }
        return;
      case "inner_separator":
        if (activeEmbed) addBlockToActiveEmbed("separator");
        return;
    }

    if (!activeEmbed) return;

    switch (type) {
      case "title":
        if (activeEmbed.title === undefined) {
          updateActiveEmbed({ title: "" });
          addBlockToActiveEmbed("title");
        }
        break;
      case "description":
        if (activeEmbed.description === undefined) {
          updateActiveEmbed({ description: "" });
          addBlockToActiveEmbed("description");
        }
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
        addBlockToActiveEmbed("fields");
        break;
      case "author":
        if (activeEmbed.authorName === undefined) {
          updateActiveEmbed({ authorName: "", authorIconUrl: "", authorUrl: "" });
          addBlockToActiveEmbed("author");
        }
        break;
      case "section_button":
        if (activeEmbed.sectionText === undefined) {
          updateActiveEmbed({ sectionText: "", sectionButtonLabel: "Learn more", sectionButtonUrl: "" });
          addBlockToActiveEmbed("section_button");
        }
        break;
      case "thumbnail":
        if (activeEmbed.thumbnailUrl === undefined) {
          updateActiveEmbed({ thumbnailUrl: "" });
          addBlockToActiveEmbed("thumbnail");
        }
        break;
      case "image":
        if (activeEmbed.imageUrl === undefined) {
          updateActiveEmbed({ imageUrl: "" });
          addBlockToActiveEmbed("image");
        }
        break;
      case "footer":
        if (activeEmbed.footerText === undefined) {
          updateActiveEmbed({ footerText: "", footerIconUrl: "" });
          addBlockToActiveEmbed("footer");
        }
        break;
      case "timestamp":
        if (activeEmbed.timestamp === undefined) {
          updateActiveEmbed({ timestamp: new Date().toISOString() });
          addBlockToActiveEmbed("timestamp");
        }
        break;
    }
  };

  const ActionToolbar = ({
    onMoveUp,
    onMoveDown,
    onDelete,
    canMoveUp = true,
    canMoveDown = true,
    label,
  }: {
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDelete: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    label?: string;
  }) => (
    <div
      className="action-toolbar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        backgroundColor: "rgba(17, 18, 20, 0.95)",
        backdropFilter: "blur(4px)",
        border: "1px solid #35373c",
        borderRadius: "6px",
        padding: "2px 4px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      {label && (
        <span style={{ fontSize: "10px", color: "#949ba4", fontWeight: 700, paddingRight: "4px", paddingLeft: "2px" }}>
          {label}
        </span>
      )}
      {(onMoveUp || onMoveDown) && (
        <>
          <GripVertical size={12} color="#4e5058" style={{ cursor: "grab", marginRight: "2px" }} />
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.();
            }}
            style={{
              background: "none",
              border: "none",
              color: canMoveUp ? "#dbdee1" : "#4e5058",
              cursor: canMoveUp ? "pointer" : "not-allowed",
              padding: "2px",
              borderRadius: "3px",
              display: "flex",
            }}
            title="Move Up"
          >
            <ChevronUp size={13} />
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown?.();
            }}
            style={{
              background: "none",
              border: "none",
              color: canMoveDown ? "#dbdee1" : "#4e5058",
              cursor: canMoveDown ? "pointer" : "not-allowed",
              padding: "2px",
              borderRadius: "3px",
              display: "flex",
            }}
            title="Move Down"
          >
            <ChevronDown size={13} />
          </button>
          <div style={{ width: "1px", height: "12px", backgroundColor: "#35373c", margin: "0 3px" }} />
        </>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          background: "none",
          border: "none",
          color: "#949ba4",
          cursor: "pointer",
          padding: "2px",
          borderRadius: "3px",
          display: "flex",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f23f43")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#949ba4")}
        title="Remove"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </div>
  );

  const layoutItems = [
    { id: "container", label: "Container", icon: FolderPlus },
    { id: "separator", label: "Separator / Spacer", icon: Minus, disabled: separators.length >= 10 },
  ];

  const contentItems = [
    { id: "text_display", label: "Text Display", icon: Type },
    { id: "button_row", label: "Button Row", icon: ExternalLink, disabled: linkButtons.length >= 5 },
  ];

  const mediaItems = [
    { id: "media_gallery", label: "Media Gallery", icon: Grid, disabled: mediaGallery.length >= 10 },
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
    if (activeEmbed.sectionText === undefined) list.push({ id: "section_button", label: "Text + Link Button Section", icon: ExternalLink });
    if (activeEmbed.thumbnailUrl === undefined) list.push({ id: "thumbnail", label: "Thumbnail Image", icon: ImageIcon });
    if (activeEmbed.imageUrl === undefined) list.push({ id: "image", label: "Banner Image", icon: ImageIcon });
    if (!activeEmbed.blockOrder.includes("separator")) list.push({ id: "inner_separator", label: "Inner Separator", icon: Minus });
    if (activeEmbed.footerText === undefined) list.push({ id: "footer", label: "Footer Note", icon: Sparkles });
    if (activeEmbed.timestamp === undefined) list.push({ id: "timestamp", label: "Timestamp", icon: Clock });
    return list;
  }, [hasEmbed, activeEmbed]);

  const payload = useMemo(() => {
    let flags = 1 << 15;
    if (suppressEmbeds) flags |= 1 << 2;
    if (suppressNotifications) flags |= 1 << 12;

    const validButtons: Array<{ type: 2; style: 5; label: string; url: string }> = linkButtons
      .filter((b) => b.label.trim() && b.url.trim().startsWith("http"))
      .slice(0, 5)
      .map((b) => ({
        type: 2,
        style: 5,
        label: b.label.trim().slice(0, 80),
        url: b.url.trim(),
      }));

    const rootComponents = new Map<string, DiscordComponent>();
    const addTextDisplay = (key: string, text: string) => {
      const trimmed = text.trim();
      if (trimmed) rootComponents.set(key, { type: 10, content: trimmed });
    };

    const components: DiscordComponent[] = [];
    const trimmedContent = content.trim();
    if (trimmedContent) components.push({ type: 10, content: trimmedContent });
    textDisplays.forEach(({ id, text }) => addTextDisplay(`text:${id}`, text));

    const fileLinks = attachedFiles
      .filter((file) => file.url.trim().startsWith("http"))
      .map((file) => `📌 Attachment: [${(file.fileName.trim() || "File").slice(0, 256)}](${file.url.trim()})`)
      .join("\n");
    addTextDisplay("attachments", fileLinks);

    const galleryItems = mediaGallery
      .filter((item) => item.url.trim().startsWith("http"))
      .slice(0, 10)
      .map((item) => ({
        media: { url: item.url.trim() },
        ...(item.description.trim() && { description: item.description.trim().slice(0, 1024) }),
        ...(item.spoiler && { spoiler: true }),
      }));
    if (galleryItems.length) rootComponents.set("gallery", { type: 12, items: galleryItems });

    separators.forEach((separator) =>
      rootComponents.set(`separator:${separator.id}`, {
        type: 14,
        divider: separator.divider,
        spacing: separator.spacing,
      })
    );

    embeds.slice(0, 10).forEach((embed) => {
      const children: DiscordComponent[] = [];
      const pendingText: string[] = [];
      let pendingThumbnailUrl: string | undefined;
      const flushText = () => {
        const text = pendingText.join("\n\n").trim();
        if (!text) return;

        pendingText.length = 0;
        const textComponents: Array<{ type: 10; content: string }> = [];
        let remaining = text;
        while (remaining.length > 4000) {
          let splitAt = remaining.lastIndexOf("\n", 4000);
          if (splitAt < 1) splitAt = 4000;
          textComponents.push({ type: 10, content: remaining.slice(0, splitAt).trimEnd() });
          remaining = remaining.slice(splitAt).trimStart();
        }
        if (remaining) textComponents.push({ type: 10, content: remaining });

        if (pendingThumbnailUrl) {
          const [sectionText, ...remainingText] = textComponents;
          if (sectionText) {
            children.push({
              type: 9,
              components: [sectionText],
              accessory: { type: 11, media: { url: pendingThumbnailUrl } },
            });
            children.push(...remainingText);
          }
          pendingThumbnailUrl = undefined;
        } else {
          children.push(...textComponents);
        }
      };

      for (const block of embed.blockOrder) {
        switch (block) {
          case "author":
            if (embed.authorName?.trim()) {
              const authorText = embed.authorUrl?.trim().startsWith("http")
                ? `[${embed.authorName.trim()}](${embed.authorUrl.trim()})`
                : embed.authorName.trim();
              if (embed.authorIconUrl?.trim().startsWith("http")) {
                flushText();
                children.push({
                  type: 9,
                  components: [{ type: 10, content: `**${authorText}**` }],
                  accessory: { type: 11, media: { url: embed.authorIconUrl.trim() } },
                });
              } else {
                pendingText.push(`**${authorText}**`);
              }
            }
            break;
          case "title":
            if (embed.title?.trim()) {
              const title = embed.title.trim();
              pendingText.push(
                `## ${embed.titleUrl?.trim().startsWith("http") ? `[${title}](${embed.titleUrl.trim()})` : title}`
              );
            }
            break;
          case "description":
            if (embed.description?.trim()) pendingText.push(embed.description.trim());
            break;
          case "fields": {
            const fieldText = embed.fields
              .filter((field) => field.name.trim() && field.value.trim())
              .map((field) => `**${field.name.trim()}**\n${field.value.trim()}`)
              .join("\n\n");
            if (fieldText) pendingText.push(fieldText);
            break;
          }
          case "section_button":
            if (embed.sectionText?.trim()) {
              const buttonLabel = embed.sectionButtonLabel?.trim();
              const buttonUrl = embed.sectionButtonUrl?.trim();
              if (buttonLabel && buttonUrl?.startsWith("http")) {
                flushText();
                children.push({
                  type: 9,
                  components: [{ type: 10, content: embed.sectionText.trim() }],
                  accessory: {
                    type: 2,
                    style: 5,
                    label: buttonLabel.slice(0, 80),
                    url: buttonUrl,
                  },
                });
              } else {
                pendingText.push(embed.sectionText.trim());
              }
            }
            break;
          case "thumbnail": {
            const url = embed.thumbnailUrl?.trim();
            if (url?.startsWith("http")) {
              pendingThumbnailUrl = url;
              flushText();
              if (pendingThumbnailUrl) {
                const previous = children[children.length - 1];
                if (previous?.type === 10) {
                  children.pop();
                  children.push({
                    type: 9,
                    components: [previous],
                    accessory: { type: 11, media: { url } },
                  });
                  pendingThumbnailUrl = undefined;
                }
              }
            }
            break;
          }
          case "image": {
            const url = embed.imageUrl?.trim();
            if (url?.startsWith("http")) {
              flushText();
              children.push({ type: 12, items: [{ media: { url } }] });
            }
            break;
          }
          case "separator":
            flushText();
            children.push({
              type: 14,
              divider: embed.separatorDivider ?? true,
              spacing: embed.separatorSpacing ?? 1,
            });
            break;
          case "footer":
            if (embed.footerText?.trim()) pendingText.push(`-# ${embed.footerText.trim()}`);
            break;
          case "timestamp": {
            const timestamp = embed.timestamp ? Date.parse(embed.timestamp) : Number.NaN;
            if (Number.isFinite(timestamp)) pendingText.push(`-# <t:${Math.floor(timestamp / 1000)}:f>`);
            break;
          }
        }
      }
      flushText();

      const accentColor = embed.color?.match(/^#[\da-f]{6}$/i)
        ? Number.parseInt(embed.color.slice(1), 16)
        : undefined;
      rootComponents.set(`container:${embed.id}`, {
        type: 17,
        ...(accentColor !== undefined && { accent_color: accentColor }),
        components: children,
      });
    });

    if (validButtons.length) rootComponents.set("buttons", { type: 1, components: validButtons });
    components.push(...activeComponentOrder.map((key) => rootComponents.get(key)).filter((item): item is DiscordComponent => item !== undefined));

    return {
      flags,
      components,
      ...(username.trim() && { username: username.trim().slice(0, 80) }),
      ...(avatarUrl.trim() && avatarUrl.trim().startsWith("http") && { avatar_url: avatarUrl.trim() }),
      ...(threadName.trim() && { thread_name: threadName.trim().slice(0, 100) }),
      ...(appliedTags.trim() && {
        applied_tags: appliedTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    } satisfies DiscordWebhookPayload;
  }, [
    content,
    textDisplays,
    attachedFiles,
    mediaGallery,
    separators,
    username,
    avatarUrl,
    threadName,
    appliedTags,
    suppressEmbeds,
    suppressNotifications,
    linkButtons,
    embeds,
    activeComponentOrder,
  ]);

  const jsonString = JSON.stringify(payload, null, 2);

  const applyImportedPayload = (imported: ImportedBuilderState) => {
    setContent(imported.content);
    setUsername(imported.username);
    setAvatarUrl(imported.avatarUrl);
    setThreadName(imported.threadName);
    setAppliedTags(imported.appliedTags);
    setSuppressEmbeds(imported.suppressEmbeds);
    setSuppressNotifications(imported.suppressNotifications);
    setLinkButtons(imported.linkButtons);
    setTextDisplays(imported.textDisplays);
    setMediaGallery(imported.mediaGallery);
    setAttachedFiles([]);
    setSeparators(imported.separators);
    setComponentOrder(imported.componentOrder);
    setEmbeds(imported.embeds);
    setActiveEmbedId(imported.embeds[0]?.id ?? null);
  };

  const handleRawJsonChange = (value: string) => {
    setRawJson(value);
    setRawJsonEdited(true);
    try {
      const imported = importPayload(JSON.parse(value) as unknown);
      applyImportedPayload(imported);
      setRawJsonEdited(false);
      setRawJsonError(null);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "The payload could not be read.";
      setRawJsonError(`Invalid JSON: ${reason}`);
    }
  };

  useEffect(() => {
    const trimmedUrl = webhookUrl.trim();
    if (!trimmedUrl) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/webhook/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "profile", webhookUrl: trimmedUrl }),
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        if (
          !response.ok
          || typeof result !== "object"
          || result === null
          || !("username" in result)
          || typeof result.username !== "string"
          || !("avatarUrl" in result)
          || typeof result.avatarUrl !== "string"
        ) {
          const message = typeof result === "object" && result !== null && "message" in result && typeof result.message === "string"
            ? result.message
            : "Could not load the webhook profile.";
          setProfileError({ webhookUrl: trimmedUrl, message });
          return;
        }
        setWebhookProfile({ webhookUrl: trimmedUrl, username: result.username, avatarUrl: result.avatarUrl });
      } catch {
        if (!controller.signal.aborted) {
          setProfileError({ webhookUrl: trimmedUrl, message: "Could not load the webhook profile." });
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [webhookUrl]);

  const loadMessage = async () => {
    setSendResult(null);
    if (!webhookUrl.trim() || !messageUrl.trim()) {
      setSendResult({ kind: "error", message: "Enter both the webhook URL and the sent message link." });
      return;
    }

    setIsLoadingMessage(true);
    try {
      const response = await fetch("/api/webhook/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "load_message", webhookUrl: webhookUrl.trim(), messageUrl: messageUrl.trim() }),
      });
      const result: unknown = await response.json();
      if (!response.ok || typeof result !== "object" || result === null || !("payload" in result)) {
        const message = typeof result === "object" && result !== null && "message" in result && typeof result.message === "string"
          ? result.message
          : "Could not load that webhook message.";
        setSendResult({ kind: "error", message });
        return;
      }

      const imported = importPayload(result.payload);
      applyImportedPayload(imported);
      setRawJson(JSON.stringify(result.payload, null, 2));
      setRawJsonEdited(false);
      setRawJsonError(null);
      setIsEditingMessage(true);
      setTab("json");
      setSendResult({ kind: "success", message: "Message loaded. Edit the JSON, then choose Update Webhook." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error loading the webhook message.";
      setSendResult({ kind: "error", message });
    } finally {
      setIsLoadingMessage(false);
    }
  };

  function addContainerText(text: string[], children: DiscordComponent[]) {
    let remaining = text.join("\n\n").trim();
    while (remaining.length > 4000) {
      let splitAt = remaining.lastIndexOf("\n", 4000);
      if (splitAt < 1) splitAt = 4000;
      children.push({ type: 10, content: remaining.slice(0, splitAt).trimEnd() });
      remaining = remaining.slice(splitAt).trimStart();
    }
    if (remaining) children.push({ type: 10, content: remaining });
  }

  const validatePayload = (): string | null => {
    if (payload.components.length === 0) return "Add at least one component before sending.";

    const thumbnailWithoutText = embeds.some((embed) => {
      if (!embed.thumbnailUrl?.trim().startsWith("http")) return false;
      const hasText =
        embed.title?.trim() ||
        embed.description?.trim() ||
        embed.fields.some((field) => field.name.trim() && field.value.trim()) ||
        (embed.authorName?.trim() && !embed.authorIconUrl?.trim().startsWith("http")) ||
        embed.footerText?.trim() ||
        (embed.timestamp && Number.isFinite(Date.parse(embed.timestamp))) ||
        (embed.sectionText?.trim() &&
          !(embed.sectionButtonLabel?.trim() && embed.sectionButtonUrl?.trim().startsWith("http")));
      return !hasText;
    });
    if (thumbnailWithoutText) return "A thumbnail needs text in its section. Add a title or description to the container.";

    const countComponents = (components: DiscordComponent[]): number =>
      components.reduce((total, component) => {
        const childCount =
          component.type === 17 || component.type === 9
            ? countComponents(component.components)
            : component.type === 12
              ? component.items.length
              : component.type === 1
                ? component.components.length
                : 0;
        return total + 1 + childCount + (component.type === 9 ? 1 : 0);
      }, 0);

    const validateTextDisplays = (components: DiscordComponent[]): string | null => {
      for (const component of components) {
        if (component.type === 10 && component.content.length > 4000) {
          return "Each Text Display must contain 4,000 characters or fewer.";
        }
        if (component.type === 17 || component.type === 9) {
          const error = validateTextDisplays(component.components);
          if (error) return error;
        }
      }
      return null;
    };

    for (const component of payload.components) {
      if (component.type === 17) {
        if (component.components.length === 0) {
          return `Container #${payload.components.indexOf(component) + 1} is empty. Add content before sending.`;
        }
      }
    }
    const textError = validateTextDisplays(payload.components);
    if (textError) return textError;
    if (countComponents(payload.components) > 40) return "A Components V2 message can contain up to 40 components.";

    return null;
  };

  const handleDispatch = async () => {
    setSendResult(null);
    if (!webhookUrl.trim()) {
      setSendResult({ kind: "error", message: "Please configure a Webhook URL in Deploy settings." });
      setTab("dispatch");
      return;
    }

    let outgoingPayload: unknown = payload;
    if (rawJsonEdited) {
      try {
        outgoingPayload = JSON.parse(rawJson) as unknown;
        importPayload(outgoingPayload);
      } catch (error) {
        const reason = error instanceof Error ? error.message : "The payload could not be read.";
        setRawJsonError(`Invalid JSON: ${reason}`);
        setTab("json");
        return;
      }
    } else {
      const validationError = validatePayload();
      if (validationError) {
        setSendResult({ kind: "error", message: validationError });
        return;
      }
    }

    if (isEditingMessage && !messageUrl.trim()) {
      setSendResult({ kind: "error", message: "Enter the message link you want to update." });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/webhook/execute", {
        method: isEditingMessage ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim(),
          ...(isEditingMessage && { messageUrl: messageUrl.trim() }),
          threadId: threadId.trim(),
          payload: outgoingPayload,
        }),
      });

      const responseBody = await res.json().catch(() => null);
      if (res.ok) {
        setSendResult({ kind: "success", message: responseBody?.message || "Payload dispatched successfully!" });
        if (isEditingMessage) setIsEditingMessage(false);
      } else {
        setSendResult({ kind: "error", message: responseBody?.message || `Discord Error: ${res.status}` });
      }
    } catch {
      setSendResult({ kind: "error", message: "Network error connecting to Discord Webhook." });
    } finally {
      setIsSending(false);
    }
  };

  const activeWebhookProfile = webhookProfile?.webhookUrl === webhookUrl.trim() ? webhookProfile : null;
  const previewName = username.trim() || activeWebhookProfile?.username || "Webhook Bot";
  const previewAvatar = avatarUrl.trim() || activeWebhookProfile?.avatarUrl || "";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111214", color: "#dbdee1", fontFamily: "inherit", padding: "20px" }}>
      <style>{`
        .block-container {
          position: relative;
          border-radius: 6px;
          padding: 14px 10px 10px 10px;
          margin-top: 8px;
          transition: background-color 0.15s ease;
        }
        .block-container:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
        .block-container .action-toolbar {
          opacity: 0;
          pointer-events: none;
          position: absolute;
          top: -12px;
          right: 8px;
          z-index: 20;
          transition: opacity 0.15s ease;
        }
        .block-container:hover .action-toolbar {
          opacity: 1;
          pointer-events: auto;
        }
        .embed-card {
          position: relative;
          margin-top: 10px;
          padding-top: 28px !important;
        }
        .embed-card .embed-toolbar {
          opacity: 0;
          pointer-events: none;
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 25;
          transition: opacity 0.15s ease;
        }
        .embed-card:hover .embed-toolbar {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #2b2d31", paddingBottom: "12px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { id: "builder", label: "Canvas Builder", icon: Layout },
              { id: "bot_settings", label: "Bot & Signals", icon: Settings },
              { id: "dispatch", label: "Deploy & Webhook", icon: Send },
              { id: "json", label: "JSON Editor", icon: Code2 },
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
            {isSending ? (isEditingMessage ? "Updating..." : "Dispatching...") : (isEditingMessage ? "Update Webhook" : "Send Webhook")}
          </button>
        </div>

        {tab === "builder" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #2b2d31", position: "relative", zIndex: 50 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders size={16} color="#949ba4" />
                <span style={{ fontSize: "12px", color: "#949ba4", fontWeight: 700, letterSpacing: "0.5px" }}>Components Options</span>
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

                      {activeSubmenu === "layout" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "100%",
                            marginRight: "4px",
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
                                <Icon size={14} color="#949ba4" />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

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

                      {activeSubmenu === "content" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "100%",
                            marginRight: "4px",
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

                      {activeSubmenu === "media" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "100%",
                            marginRight: "4px",
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
                          <span>Container Elements</span>
                        </div>
                        <ChevronRight size={14} color="#949ba4" />

                        {activeSubmenu === "container_fields" && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "100%",
                              marginRight: "4px",
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

            <div style={{ backgroundColor: "#2b2d31", borderRadius: "8px", border: "1px solid #383a40", padding: "20px", minHeight: "260px" }}>
              <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#5865f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                  {previewAvatar ? (
                    <img src={previewAvatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    previewName.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>{previewName}</span>
                    <span style={{ backgroundColor: "#5865f2", color: "#fff", fontSize: "10px", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>APP</span>
                  </div>

                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Leave blank to only send embeds"
                    rows={2}
                    maxLength={4000}
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

              <div style={{ marginLeft: "54px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {textDisplays.map((td) => (
                  <div key={td.id} className="block-container" style={{ order: activeComponentOrder.indexOf(`text:${td.id}`), backgroundColor: "#1e1f22", border: "1px solid #2b2d31" }}>
                    <div className="action-toolbar">
                      <ActionToolbar
                        canMoveUp={activeComponentOrder.indexOf(`text:${td.id}`) > 0}
                        canMoveDown={activeComponentOrder.indexOf(`text:${td.id}`) < activeComponentOrder.length - 1}
                        onMoveUp={() => moveComponent(`text:${td.id}`, "up")}
                        onMoveDown={() => moveComponent(`text:${td.id}`, "down")}
                        onDelete={() => {
                          setTextDisplays((prev) => prev.filter((item) => item.id !== td.id));
                          removeFromComponentOrder(`text:${td.id}`);
                        }}
                      />
                    </div>
                    <textarea
                      value={td.text}
                      onChange={(e) => setTextDisplays((prev) => prev.map((item) => (item.id === td.id ? { ...item, text: e.target.value } : item)))}
                      rows={2}
                      maxLength={4000}
                      style={{ width: "100%", background: "transparent", border: "none", color: "#dbdee1", fontSize: "13px", outline: "none", resize: "vertical" }}
                    />
                  </div>
                ))}

                {separators.map((separator) => {
                  const key = `separator:${separator.id}`;
                  const index = activeComponentOrder.indexOf(key);
                  return (
                    <div key={separator.id} className="block-container" style={{ order: index, margin: "2px 0" }}>
                      <div className="action-toolbar">
                        <ActionToolbar
                          canMoveUp={index > 0}
                          canMoveDown={index < activeComponentOrder.length - 1}
                          onMoveUp={() => moveComponent(key, "up")}
                          onMoveDown={() => moveComponent(key, "down")}
                          onDelete={() => {
                            setSeparators((prev) => prev.filter((item) => item.id !== separator.id));
                            removeFromComponentOrder(key);
                          }}
                          label={separator.divider ? "DIVIDER" : "SPACER"}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: separator.spacing === 2 ? "24px" : "12px" }}>
                        {separator.divider ? (
                          <>
                            <div style={{ flex: 1, height: "1px", backgroundColor: "#3f4147" }} />
                            <span style={{ fontSize: "10px", color: "#949ba4", fontWeight: 700 }}>SEPARATOR</span>
                            <div style={{ flex: 1, height: "1px", backgroundColor: "#3f4147" }} />
                          </>
                        ) : (
                          <span style={{ fontSize: "10px", color: "#949ba4", fontWeight: 700 }}>SPACING ONLY</span>
                        )}
                        <select
                          aria-label="Separator style"
                          value={separator.divider ? "divider" : "spacing"}
                          onChange={(event) =>
                            setSeparators((prev) => prev.map((item) => (item.id === separator.id ? { ...item, divider: event.target.value === "divider" } : item)))
                          }
                          style={{ backgroundColor: "#1e1f22", border: "1px solid #383a40", borderRadius: "4px", color: "#dbdee1", fontSize: "11px", padding: "4px" }}
                        >
                          <option value="divider">Line</option>
                          <option value="spacing">Space</option>
                        </select>
                        <select
                          aria-label="Separator spacing"
                          value={separator.spacing}
                          onChange={(event) =>
                            setSeparators((prev) => prev.map((item) => (item.id === separator.id ? { ...item, spacing: Number(event.target.value) as 1 | 2 } : item)))
                          }
                          style={{ backgroundColor: "#1e1f22", border: "1px solid #383a40", borderRadius: "4px", color: "#dbdee1", fontSize: "11px", padding: "4px" }}
                        >
                          <option value={1}>Small</option>
                          <option value={2}>Large</option>
                        </select>
                      </div>
                    </div>
                  );
                })}

                {mediaGallery.length > 0 && (
                  <div className="block-container" style={{ order: activeComponentOrder.indexOf("gallery"), backgroundColor: "#1e1f22", borderRadius: "8px", border: "1px solid #2b2d31" }}>
                    <div className="action-toolbar">
                      <ActionToolbar
                        canMoveUp={activeComponentOrder.indexOf("gallery") > 0}
                        canMoveDown={activeComponentOrder.indexOf("gallery") < activeComponentOrder.length - 1}
                        onMoveUp={() => moveComponent("gallery", "up")}
                        onMoveDown={() => moveComponent("gallery", "down")}
                        onDelete={() => {
                          setMediaGallery([]);
                          removeFromComponentOrder("gallery");
                        }}
                        label="MEDIA GALLERY"
                      />
                    </div>
                    <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                      <Grid size={14} /> MEDIA GALLERY ({mediaGallery.length}/10)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
                      {mediaGallery.map((mg) => (
                        <div key={mg.id} style={{ backgroundColor: "#2b2d31", padding: "8px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
                          <input
                            value={mg.url}
                            onChange={(e) => setMediaGallery((prev) => prev.map((item) => (item.id === mg.id ? { ...item, url: e.target.value } : item)))}
                            placeholder="Image URL..."
                            style={{ backgroundColor: "#1e1f22", border: "1px solid #383a40", borderRadius: "4px", color: "#fff", fontSize: "11px", padding: "4px 8px", outline: "none" }}
                          />
                          <input
                            value={mg.description}
                            onChange={(e) => setMediaGallery((prev) => prev.map((item) => (item.id === mg.id ? { ...item, description: e.target.value } : item)))}
                            placeholder="Image caption (optional)"
                            maxLength={1024}
                            style={{ backgroundColor: "#1e1f22", border: "1px solid #383a40", borderRadius: "4px", color: "#dbdee1", fontSize: "11px", padding: "4px 8px", outline: "none" }}
                          />
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#b5bac1", fontSize: "11px" }}>
                            <input
                              type="checkbox"
                              checked={mg.spoiler}
                              onChange={(e) => setMediaGallery((prev) => prev.map((item) => (item.id === mg.id ? { ...item, spoiler: e.target.checked } : item)))}
                            />
                            Spoiler image
                          </label>
                          {mg.url.trim() && (
                            <>
                              <div style={{ position: "relative", width: "100%", height: "80px", borderRadius: "4px", overflow: "hidden" }}>
                                <img src={mg.url} alt={mg.description || "Gallery item"} style={{ width: "100%", height: "100%", objectFit: "cover", filter: mg.spoiler ? "blur(12px)" : undefined }} />
                                <div style={{ position: "absolute", top: "4px", right: "4px" }}>
                                  <ActionToolbar
                                    onDelete={() => {
                                      const next = mediaGallery.filter((item) => item.id !== mg.id);
                                      setMediaGallery(next);
                                      if (next.length === 0) removeFromComponentOrder("gallery");
                                    }}
                                  />
                                </div>
                              </div>
                              {mg.description.trim() && (
                                <span style={{ color: "#b5bac1", fontSize: "11px", lineHeight: 1.4 }}>{mg.description}</span>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {attachedFiles.length > 0 && (
                  <div className="block-container" style={{ order: activeComponentOrder.indexOf("attachments"), backgroundColor: "#1e1f22", borderRadius: "8px", border: "1px solid #2b2d31" }}>
                    <div className="action-toolbar">
                      <ActionToolbar
                        canMoveUp={activeComponentOrder.indexOf("attachments") > 0}
                        canMoveDown={activeComponentOrder.indexOf("attachments") < activeComponentOrder.length - 1}
                        onMoveUp={() => moveComponent("attachments", "up")}
                        onMoveDown={() => moveComponent("attachments", "down")}
                        onDelete={() => {
                          setAttachedFiles([]);
                          removeFromComponentOrder("attachments");
                        }}
                        label="CLEAR FILES"
                      />
                    </div>
                    <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <Paperclip size={14} /> ATTACHED FILES
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {attachedFiles.map((f) => (
                        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#2b2d31", padding: "6px 10px", borderRadius: "6px" }}>
                          <input
                            value={f.fileName}
                            onChange={(e) => setAttachedFiles((prev) => prev.map((item) => (item.id === f.id ? { ...item, fileName: e.target.value } : item)))}
                            placeholder="filename.pdf"
                            maxLength={256}
                            style={{ backgroundColor: "#1e1f22", border: "none", color: "#fff", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", outline: "none", width: "120px" }}
                          />
                          <input
                            value={f.url}
                            onChange={(e) => setAttachedFiles((prev) => prev.map((item) => (item.id === f.id ? { ...item, url: e.target.value } : item)))}
                            placeholder="https://attachment-url.com/file"
                            style={{ backgroundColor: "#1e1f22", border: "none", color: "#949ba4", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", outline: "none", flex: 1 }}
                          />
                          <ActionToolbar
                            onDelete={() => {
                              const next = attachedFiles.filter((item) => item.id !== f.id);
                              setAttachedFiles(next);
                              if (next.length === 0) removeFromComponentOrder("attachments");
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {embeds.map((embed, index) => {
                  const isSelected = embed.id === activeEmbedId;

                  const renderBlock = (type: EmbedBlockType, blockIdx: number) => {
                    const totalBlocks = embed.blockOrder.length;
                    const canMoveUp = blockIdx > 0;
                    const canMoveDown = blockIdx < totalBlocks - 1;

                    switch (type) {
                      case "author":
                        if (embed.authorName === undefined) return null;
                        return (
                          <div key="author" className="block-container">
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => {
                                  updateActiveEmbed({
                                    authorName: undefined,
                                    authorIconUrl: undefined,
                                    authorUrl: undefined,
                                    blockOrder: embed.blockOrder.filter((b) => b !== "author"),
                                  });
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {embed.authorIconUrl ? (
                                  <img src={embed.authorIconUrl} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
                                ) : null}
                                <input
                                  value={embed.authorName}
                                  onChange={(e) => updateActiveEmbed({ authorName: e.target.value })}
                                  placeholder="Author Name..."
                                  maxLength={256}
                                  style={{ background: "transparent", border: "none", color: "#b5bac1", fontSize: "12px", fontWeight: 600, outline: "none", flex: 1 }}
                                />
                              </div>
                              <input
                                value={embed.authorUrl || ""}
                                onChange={(e) => updateActiveEmbed({ authorUrl: e.target.value })}
                                placeholder="Author Link URL (optional)..."
                                style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "4px", color: "#949ba4", fontSize: "11px", padding: "4px 8px", outline: "none" }}
                              />
                            </div>
                          </div>
                        );

                      case "section_button":
                        if (embed.sectionText === undefined) return null;
                        return (
                          <div key="section_button" className="block-container" style={{ backgroundColor: "#24262b", border: "1px solid #383a40", borderRadius: "6px" }}>
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => updateActiveEmbed({
                                  sectionText: undefined,
                                  sectionButtonLabel: undefined,
                                  sectionButtonUrl: undefined,
                                  blockOrder: embed.blockOrder.filter((block) => block !== "section_button"),
                                })}
                                label="SECTION + LINK BUTTON"
                              />
                            </div>
                            <textarea
                              value={embed.sectionText}
                              onChange={(event) => updateActiveEmbed({ sectionText: event.target.value })}
                              placeholder="Text displayed beside the button..."
                              maxLength={4000}
                              rows={2}
                              style={{ width: "100%", background: "transparent", border: "none", color: "#dbdee1", fontSize: "13px", outline: "none", resize: "vertical" }}
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "minmax(90px, 1fr) minmax(140px, 2fr)", gap: "8px", marginTop: "8px" }}>
                              <input
                                value={embed.sectionButtonLabel || ""}
                                onChange={(event) => updateActiveEmbed({ sectionButtonLabel: event.target.value })}
                                placeholder="Button label"
                                maxLength={80}
                                style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "4px", color: "#fff", fontSize: "11px", padding: "6px 8px", outline: "none" }}
                              />
                              <input
                                value={embed.sectionButtonUrl || ""}
                                onChange={(event) => updateActiveEmbed({ sectionButtonUrl: event.target.value })}
                                placeholder="https://..."
                                style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "4px", color: "#b5bac1", fontSize: "11px", padding: "6px 8px", outline: "none" }}
                              />
                            </div>
                            <span style={{ display: "block", color: "#949ba4", fontSize: "10px", marginTop: "6px" }}>
                              Requires text, a button label, and a valid URL to appear in the message.
                            </span>
                          </div>
                        );

                      case "title":
                        if (embed.title === undefined) return null;
                        return (
                          <div key="title" className="block-container">
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => {
                                  updateActiveEmbed({
                                    title: undefined,
                                    titleUrl: undefined,
                                    blockOrder: embed.blockOrder.filter((b) => b !== "title"),
                                  });
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <input
                                value={embed.title}
                                onChange={(e) => updateActiveEmbed({ title: e.target.value })}
                                placeholder="Container title..."
                                maxLength={256}
                                style={{ background: "transparent", border: "none", color: "#fff", fontSize: "16px", fontWeight: 700, outline: "none", width: "100%" }}
                              />
                              <input
                                value={embed.titleUrl || ""}
                                onChange={(e) => updateActiveEmbed({ titleUrl: e.target.value })}
                                placeholder="Title Link URL (optional)..."
                                style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "4px", color: "#949ba4", fontSize: "11px", padding: "4px 8px", outline: "none" }}
                              />
                            </div>
                          </div>
                        );

                      case "description":
                        if (embed.description === undefined) return null;
                        return (
                          <div key="description" className="block-container">
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => {
                                  updateActiveEmbed({
                                    description: undefined,
                                    blockOrder: embed.blockOrder.filter((b) => b !== "description"),
                                  });
                                }}
                              />
                            </div>
                            <textarea
                              value={embed.description}
                              onChange={(e) => updateActiveEmbed({ description: e.target.value })}
                              placeholder="Container text..."
                              rows={2}
                              maxLength={4096}
                              style={{ background: "transparent", border: "none", color: "#dbdee1", fontSize: "13px", outline: "none", resize: "vertical", width: "100%" }}
                            />
                          </div>
                        );

                      case "thumbnail":
                        if (embed.thumbnailUrl === undefined) return null;
                        return (
                          <div key="thumbnail" className="block-container">
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => {
                                  updateActiveEmbed({
                                    thumbnailUrl: undefined,
                                    blockOrder: embed.blockOrder.filter((b) => b !== "thumbnail"),
                                  });
                                }}
                              />
                            </div>
                            <div style={{ position: "relative", width: "100%" }}>
                              {embed.thumbnailUrl.trim() ? (
                                <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "6px", overflow: "hidden", border: "1px solid #383a40" }}>
                                  <img src={embed.thumbnailUrl} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                              ) : (
                                <div style={{ width: "100%", border: "1px dashed #3f4147", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px", padding: "8px", backgroundColor: "#2b2d31" }}>
                                  <ImageIcon size={16} color="#949ba4" />
                                  <input
                                    value={embed.thumbnailUrl}
                                    onChange={(e) => updateActiveEmbed({ thumbnailUrl: e.target.value })}
                                    placeholder="Thumbnail Image URL..."
                                    style={{ flex: 1, backgroundColor: "#1e1f22", border: "none", color: "#fff", fontSize: "11px", borderRadius: "3px", padding: "4px 8px", outline: "none" }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );

                      case "fields":
                        if (embed.fields.length === 0) return null;
                        return (
                          <div key="fields" className="block-container">
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => {
                                  updateActiveEmbed({
                                    fields: [],
                                    blockOrder: embed.blockOrder.filter((b) => b !== "fields"),
                                  });
                                }}
                                label="FIELDS"
                              />
                            </div>
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
                                      maxLength={256}
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
                                    maxLength={1024}
                                    style={{ background: "transparent", border: "none", color: "#dbdee1", fontSize: "12px", outline: "none" }}
                                  />

                                  <div style={{ position: "absolute", bottom: "6px", right: "6px" }}>
                                    <ActionToolbar
                                      onDelete={() => {
                                        const nextFields = embed.fields.filter((f) => f.id !== field.id);
                                        updateActiveEmbed({
                                          fields: nextFields,
                                          ...(nextFields.length === 0 && {
                                            blockOrder: embed.blockOrder.filter((b) => b !== "fields"),
                                          }),
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );

                      case "image":
                        if (embed.imageUrl === undefined) return null;
                        return (
                          <div key="image" className="block-container">
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => {
                                  updateActiveEmbed({
                                    imageUrl: undefined,
                                    blockOrder: embed.blockOrder.filter((b) => b !== "image"),
                                  });
                                }}
                              />
                            </div>
                            <div style={{ position: "relative", width: "100%" }}>
                              {embed.imageUrl.trim() ? (
                                <div style={{ position: "relative", width: "100%", maxHeight: "200px", borderRadius: "6px", overflow: "hidden", border: "1px solid #383a40" }}>
                                  <img src={embed.imageUrl} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                </div>
                              ) : (
                                <div style={{ width: "100%", border: "1px dashed #3f4147", borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", backgroundColor: "#2b2d31" }}>
                                  <ImageIcon size={18} color="#949ba4" />
                                  <input
                                    value={embed.imageUrl}
                                    onChange={(e) => updateActiveEmbed({ imageUrl: e.target.value })}
                                    placeholder="Paste Banner Image URL..."
                                    style={{ flex: 1, backgroundColor: "#1e1f22", border: "1px solid #383a40", color: "#fff", fontSize: "12px", borderRadius: "4px", padding: "4px 8px", outline: "none" }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );

                      case "separator":
                        return (
                          <div key="separator" className="block-container" style={{ margin: "2px 0" }}>
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => {
                                  updateActiveEmbed({
                                    blockOrder: embed.blockOrder.filter((b) => b !== "separator"),
                                  });
                                }}
                                label="INNER SEPARATOR"
                              />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: (embed.separatorSpacing ?? 1) === 2 ? "24px" : "12px" }}>
                              {(embed.separatorDivider ?? true) ? (
                                <>
                                  <div style={{ flex: 1, height: "1px", backgroundColor: "#3f4147" }} />
                                  <span style={{ fontSize: "9px", color: "#949ba4", fontWeight: 700 }}>DIVIDER</span>
                                  <div style={{ flex: 1, height: "1px", backgroundColor: "#3f4147" }} />
                                </>
                              ) : (
                                <span style={{ fontSize: "9px", color: "#949ba4", fontWeight: 700 }}>SPACING ONLY</span>
                              )}
                              <select
                                aria-label="Inner separator style"
                                value={(embed.separatorDivider ?? true) ? "divider" : "spacing"}
                                onChange={(event) => updateActiveEmbed({ separatorDivider: event.target.value === "divider" })}
                                style={{ backgroundColor: "#1e1f22", border: "1px solid #383a40", borderRadius: "4px", color: "#dbdee1", fontSize: "10px", padding: "3px" }}
                              >
                                <option value="divider">Line</option>
                                <option value="spacing">Space</option>
                              </select>
                              <select
                                aria-label="Inner separator spacing"
                                value={embed.separatorSpacing ?? 1}
                                onChange={(event) => updateActiveEmbed({ separatorSpacing: event.target.value === "2" ? 2 : 1 })}
                                style={{ backgroundColor: "#1e1f22", border: "1px solid #383a40", borderRadius: "4px", color: "#dbdee1", fontSize: "10px", padding: "3px" }}
                              >
                                <option value={1}>Small</option>
                                <option value={2}>Large</option>
                              </select>
                            </div>
                          </div>
                        );

                      case "footer":
                        if (embed.footerText === undefined) return null;
                        return (
                          <div key="footer" className="block-container">
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => {
                                  updateActiveEmbed({
                                    footerText: undefined,
                                    footerIconUrl: undefined,
                                    blockOrder: embed.blockOrder.filter((b) => b !== "footer"),
                                  });
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {embed.footerIconUrl ? (
                                <img src={embed.footerIconUrl} alt="" style={{ width: "16px", height: "16px", borderRadius: "50%", objectFit: "cover" }} />
                              ) : null}
                              <input
                                value={embed.footerText}
                                onChange={(e) => updateActiveEmbed({ footerText: e.target.value })}
                                placeholder="Footer note..."
                                maxLength={2048}
                                style={{ background: "transparent", border: "none", color: "#949ba4", fontSize: "11px", outline: "none", flex: 1 }}
                              />
                            </div>
                          </div>
                        );

                      case "timestamp":
                        if (embed.timestamp === undefined) return null;
                        return (
                          <div key="timestamp" className="block-container">
                            <div className="action-toolbar">
                              <ActionToolbar
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveBlock(embed.id, blockIdx, "up")}
                                onMoveDown={() => moveBlock(embed.id, blockIdx, "down")}
                                onDelete={() => {
                                  updateActiveEmbed({
                                    timestamp: undefined,
                                    blockOrder: embed.blockOrder.filter((b) => b !== "timestamp"),
                                  });
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Clock size={12} color="#949ba4" />
                              <span style={{ fontSize: "10px", color: "#949ba4" }}>
                                {new Date(embed.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        );

                      default:
                        return null;
                    }
                  };

                  return (
                    <div
                      key={embed.id}
                      className="embed-card"
                      onClick={() => setActiveEmbedId(embed.id)}
                      style={{
                      order: activeComponentOrder.indexOf(`container:${embed.id}`),
                        borderLeft: embed.color ? `4px solid ${embed.color}` : "4px solid transparent",
                        backgroundColor: "#1e1f22",
                        padding: "16px",
                        borderRadius: "0 8px 8px 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        borderTop: "1px solid #2b2d31",
                        borderRight: "1px solid #2b2d31",
                        borderBottom: "1px solid #2b2d31",
                        cursor: "pointer",
                      }}
                    >
                      <div className="embed-toolbar">
                        <ActionToolbar
                        canMoveUp={activeComponentOrder.indexOf(`container:${embed.id}`) > 0}
                        canMoveDown={activeComponentOrder.indexOf(`container:${embed.id}`) < activeComponentOrder.length - 1}
                        onMoveUp={() => moveComponent(`container:${embed.id}`, "up")}
                        onMoveDown={() => moveComponent(`container:${embed.id}`, "down")}
                        onDelete={() => {
                          const next = embeds.filter((e) => e.id !== embed.id);
                          setEmbeds(next);
                          removeFromComponentOrder(`container:${embed.id}`);
                          setActiveEmbedId(next[0]?.id || null);
                          }}
                          label={`CONTAINER #${index + 1}`}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ color: isSelected ? "#5865f2" : "#949ba4", fontSize: "11px", fontWeight: 700 }}>
                            {isSelected ? `Active Container #${index + 1}` : `Container #${index + 1}`}
                          </span>

                          {embed.color !== undefined && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="color"
                                value={embed.color}
                                onChange={(e) => updateActiveEmbed({ color: e.target.value })}
                                style={{ background: "none", border: "none", width: "20px", height: "20px", cursor: "pointer" }}
                              />
                              <ActionToolbar onDelete={() => updateActiveEmbed({ color: undefined })} />
                            </div>
                          )}
                        </div>
                      </div>

                      {embed.blockOrder.map((blockType, blockIdx) => renderBlock(blockType, blockIdx))}
                    </div>
                  );
                })}

                {linkButtons.length > 0 && (
                  <div className="block-container" style={{ order: activeComponentOrder.indexOf("buttons"), backgroundColor: "#1e1f22", borderRadius: "8px", border: "1px solid #2b2d31" }}>
                    <div className="action-toolbar">
                      <ActionToolbar
                        canMoveUp={activeComponentOrder.indexOf("buttons") > 0}
                        canMoveDown={activeComponentOrder.indexOf("buttons") < activeComponentOrder.length - 1}
                        onMoveUp={() => moveComponent("buttons", "up")}
                        onMoveDown={() => moveComponent("buttons", "down")}
                        onDelete={() => {
                          setLinkButtons([]);
                          removeFromComponentOrder("buttons");
                        }}
                        label="CLEAR BUTTONS"
                      />
                    </div>
                    <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: 700, marginBottom: "8px", display: "block" }}>
                      ACTION ROW — BUTTON ROW ({linkButtons.length}/5)
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {linkButtons.map((btn) => (
                        <div key={btn.id} style={{ backgroundColor: "#2b2d31", border: "1px solid #383a40", borderRadius: "6px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <ExternalLink size={14} color="#949ba4" />
                          <input
                            value={btn.label}
                            onChange={(e) => setLinkButtons((prev) => prev.map((b) => (b.id === btn.id ? { ...b, label: e.target.value } : b)))}
                            placeholder="Button Label"
                            maxLength={80}
                            style={{ backgroundColor: "#1e1f22", border: "none", color: "#fff", borderRadius: "4px", padding: "3px 6px", fontSize: "12px", outline: "none", width: "90px" }}
                          />
                          <input
                            value={btn.url}
                            onChange={(e) => setLinkButtons((prev) => prev.map((b) => (b.id === btn.id ? { ...b, url: e.target.value } : b)))}
                            placeholder="https://..."
                            style={{ backgroundColor: "#1e1f22", border: "none", color: "#949ba4", borderRadius: "4px", padding: "3px 6px", fontSize: "12px", outline: "none", width: "130px" }}
                          />
                          <ActionToolbar
                            onDelete={() => {
                              const next = linkButtons.filter((button) => button.id !== btn.id);
                              setLinkButtons(next);
                              if (next.length === 0) removeFromComponentOrder("buttons");
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                  maxLength={80}
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
              <span style={{ fontSize: "11px", color: "#b5bac1", fontWeight: "700" }}>FORUM & THREAD CREATION OPTIONS</span>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#949ba4" }}>NEW THREAD / FORUM TITLE (thread_name)</span>
                  <input
                    value={threadName}
                    onChange={(e) => setThreadName(e.target.value)}
                    placeholder="Thread title when posting in Forum Channel"
                    maxLength={100}
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

        {tab === "dispatch" && (
          <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", border: "1px solid #2b2d31", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "15px", color: "#fff", margin: 0, fontWeight: 700 }}>Target Destination</h2>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "#b5bac1", fontWeight: 700 }}>DISCORD WEBHOOK URL *</span>
              <input
                type="password"
                value={webhookUrl}
                onChange={(e) => {
                  setWebhookUrl(e.target.value);
                  setIsEditingMessage(false);
                }}
                placeholder="https://discord.com/api/webhooks/..."
                style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "6px", color: "#fff", padding: "8px 12px", fontSize: "13px", outline: "none" }}
              />
            </label>

            {profileError?.webhookUrl === webhookUrl.trim() && (
              <div style={{ color: "#f23f43", fontSize: "12px" }}>{profileError.message}</div>
            )}

            <div style={{ borderTop: "1px solid #2b2d31", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "11px", color: "#b5bac1", fontWeight: 700 }}>EDIT A SENT WEBHOOK MESSAGE</span>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#949ba4" }}>DISCORD MESSAGE LINK</span>
                <input
                  value={messageUrl}
                  onChange={(e) => {
                    setMessageUrl(e.target.value);
                    setIsEditingMessage(false);
                  }}
                  placeholder="https://discord.com/channels/server/channel/message"
                  style={{ backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "6px", color: "#fff", padding: "8px 12px", fontSize: "13px", outline: "none" }}
                />
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={loadMessage}
                  disabled={isLoadingMessage}
                  style={{ backgroundColor: "#5865f2", border: "none", color: "#fff", padding: "7px 12px", borderRadius: "5px", fontSize: "12px", cursor: isLoadingMessage ? "wait" : "pointer" }}
                >
                  {isLoadingMessage ? "Loading message..." : "Load message"}
                </button>
                {isEditingMessage && (
                  <>
                    <span style={{ color: "#23a55a", fontSize: "12px" }}>Message loaded for editing</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingMessage(false)}
                      style={{ background: "none", border: "none", color: "#b5bac1", fontSize: "12px", cursor: "pointer" }}
                    >
                      Cancel edit
                    </button>
                  </>
                )}
                <span style={{ color: "#949ba4", fontSize: "11px" }}>
                  The message link identifies the message; its webhook URL is still required to authorize edits.
                </span>
              </div>
            </div>

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

        {tab === "json" && (
          <div style={{ backgroundColor: "#1e1f22", borderRadius: "8px", border: "1px solid #2b2d31", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: 700 }}>EDITABLE PAYLOAD JSON</span>
                <span style={{ fontSize: "11px", color: rawJsonEdited ? "#f0b232" : "#949ba4" }}>
                  {rawJsonEdited ? "JSON has not been applied to the builder." : "Changes made here update the preview and builder settings."}
                </span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setRawJsonEdited(false);
                    setRawJsonError(null);
                  }}
                  style={{ backgroundColor: "#2b2d31", border: "none", color: "#fff", padding: "5px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
                >
                  Reset from builder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(rawJsonEdited ? rawJson : jsonString);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  style={{ backgroundColor: "#2b2d31", border: "none", color: "#fff", padding: "5px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy JSON"}
                </button>
              </div>
            </div>
            <textarea
              aria-label="Webhook payload JSON"
              value={rawJsonEdited ? rawJson : jsonString}
              onChange={(e) => handleRawJsonChange(e.target.value)}
              spellCheck={false}
              rows={24}
              style={{ width: "100%", minHeight: "420px", boxSizing: "border-box", margin: 0, padding: "12px", backgroundColor: "#111214", border: "1px solid #383a40", borderRadius: "6px", color: "#9cdcfe", fontSize: "13px", fontFamily: "monospace", lineHeight: 1.5, resize: "vertical", outline: "none" }}
            />
            {rawJsonError && (
              <div role="alert" style={{ marginTop: "8px", color: "#f23f43", fontSize: "12px" }}>
                {rawJsonError}
              </div>
            )}
          </div>
        )}

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