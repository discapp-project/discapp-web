"use client";

import React, { useState, useRef, useEffect } from "react";

interface Permission {
  name: string;
  flag: bigint;
  description: string;
}

interface Category {
  name: string;
  permissions: Permission[];
}

const PERMISSION_CATEGORIES: Category[] = [
  {
    name: "General Permissions",
    permissions: [
      { name: "Administrator", flag: 1n << 3n, description: "Bypasses all channel-specific permissions." },
      { name: "View Audit Log", flag: 1n << 7n, description: "Read server audit logs." },
      { name: "Manage Server", flag: 1n << 5n, description: "Change server name, region, or integrations." },
      { name: "Manage Roles", flag: 1n << 28n, description: "Create, edit, or delete roles below the bot." },
      { name: "Manage Channels", flag: 1n << 4n, description: "Create, edit, or delete channels." },
      { name: "Kick Members", flag: 1n << 1n, description: "Remove members from the server." },
      { name: "Ban Members", flag: 1n << 2n, description: "Permanently ban members from the server." },
      { name: "Create Instant Invite", flag: 1n << 0n, description: "Create invites to server channels." },
      { name: "Change Nickname", flag: 1n << 26n, description: "Allows changing own nickname." },
      { name: "Manage Nicknames", flag: 1n << 27n, description: "Allows changing nicknames of other members." },
      { name: "Manage Webhooks", flag: 1n << 29n, description: "Create, edit, or delete channel webhooks." },
      { name: "Manage Expressions", flag: 1n << 30n, description: "Manage emojis, stickers, and soundboard sounds." },
      { name: "View Server Insights", flag: 1n << 19n, description: "Access server analytics." },
    ],
  },
  {
    name: "Text & Channel Permissions",
    permissions: [
      { name: "View Channels", flag: 1n << 10n, description: "Allows reading text channels and viewing voice channels." },
      { name: "Send Messages", flag: 1n << 11n, description: "Send messages in text channels." },
      { name: "Send Messages in Threads", flag: 1n << 38n, description: "Post within active threads." },
      { name: "Create Public Threads", flag: 1n << 35n, description: "Start new public thread conversations." },
      { name: "Create Private Threads", flag: 1n << 36n, description: "Start private thread conversations." },
      { name: "Embed Links", flag: 1n << 14n, description: "Embed rich links when sending messages." },
      { name: "Attach Files", flag: 1n << 15n, description: "Upload images, videos, and files." },
      { name: "Add Reactions", flag: 1n << 6n, description: "Add emoji reactions to messages." },
      { name: "Use External Emojis", flag: 1n << 18n, description: "Use emojis from other servers." },
      { name: "Use External Stickers", flag: 1n << 37n, description: "Use stickers from other servers." },
      { name: "Mention Everyone", flag: 1n << 17n, description: "Use @everyone or @here mentions." },
      { name: "Manage Messages", flag: 1n << 13n, description: "Delete or pin messages from other users." },
      { name: "Manage Threads", flag: 1n << 34n, description: "Delete, archive, or lock threads." },
      { name: "Read Message History", flag: 1n << 16n, description: "Read past messages in channels." },
      { name: "Send Voice Messages", flag: 1n << 46n, description: "Send audio recordings in text channels." },
    ],
  },
  {
    name: "Voice & Stage Permissions",
    permissions: [
      { name: "Connect", flag: 1n << 20n, description: "Connect to voice channels." },
      { name: "Speak", flag: 1n << 21n, description: "Speak in voice channels." },
      { name: "Stream / Video", flag: 1n << 9n, description: "Share camera or screen stream." },
      { name: "Use Soundboard", flag: 1n << 42n, description: "Play soundboard audio in voice channels." },
      { name: "Use External Sounds", flag: 1n << 45n, description: "Use soundboard sounds from other servers." },
      { name: "Use Voice Activity", flag: 1n << 25n, description: "Use voice activity detection instead of Push-to-Talk." },
      { name: "Priority Speaker", flag: 1n << 8n, description: "Reduce other users' audio when speaking." },
      { name: "Mute Members", flag: 1n << 22n, description: "Mute other members in voice channels." },
      { name: "Deafen Members", flag: 1n << 23n, description: "Deafen other members in voice channels." },
      { name: "Move Members", flag: 1n << 24n, description: "Move members between voice channels." },
      { name: "Request to Speak", flag: 1n << 32n, description: "Request to speak in Stage channels." },
    ],
  },
  {
    name: "Modern App & Slash Commands",
    permissions: [
      { name: "Use Application Commands", flag: 1n << 31n, description: "Execute slash commands, user commands, and message commands." },
      { name: "Use Embedded Activities", flag: 1n << 39n, description: "Start activities (e.g., YouTube Watch Together) in voice channels." },
      { name: "Moderate Members", flag: 1n << 40n, description: "Timeout members using Discord's built-in moderation." },
      { name: "Create Events", flag: 1n << 33n, description: "Create and edit scheduled server events." },
      { name: "Manage Events", flag: 1n << 41n, description: "Edit or cancel any server event." },
    ],
  },
];

const PRESETS = [
  { name: "Basic Slash Command Bot", flags: 1n << 10n | 1n << 11n | 1n << 31n },
  { name: "Rich Media & Embed Bot", flags: 1n << 10n | 1n << 11n | 1n << 14n | 1n << 15n | 1n << 31n },
  { name: "Community Moderation Bot", flags: 1n << 1n | 1n << 2n | 1n << 10n | 1n << 11n | 1n << 13n | 1n << 31n | 1n << 40n },
  { name: "Ticket & Thread Support Bot", flags: 1n << 4n | 1n << 10n | 1n << 11n | 1n << 13n | 1n << 14n | 1n << 15n | 1n << 31n | 1n << 34n | 1n << 35n | 1n << 36n | 1n << 38n },
  { name: "Music Player Bot", flags: 1n << 10n | 1n << 11n | 1n << 20n | 1n << 21n | 1n << 25n | 1n << 31n },
  { name: "Soundboard & Audio Bot", flags: 1n << 10n | 1n << 11n | 1n << 20n | 1n << 21n | 1n << 31n | 1n << 42n | 1n << 45n },
  { name: "Stage Channel Host Bot", flags: 1n << 10n | 1n << 11n | 1n << 20n | 1n << 21n | 1n << 22n | 1n << 31n | 1n << 32n },
  { name: "Event & Calendar Manager", flags: 1n << 10n | 1n << 11n | 1n << 14n | 1n << 31n | 1n << 33n | 1n << 41n },
  { name: "Emoji & Soundboard Manager", flags: 1n << 10n | 1n << 11n | 1n << 30n | 1n << 31n },
  { name: "Server Backup & Logging Bot", flags: 1n << 7n | 1n << 10n | 1n << 11n | 1n << 16n | 1n << 19n | 1n << 31n },
  { name: "Role Assignment / Verification Bot", flags: 1n << 10n | 1n << 11n | 1n << 14n | 1n << 28n | 1n << 31n },
  { name: "Webhook & Integration Bot", flags: 1n << 10n | 1n << 11n | 1n << 29n | 1n << 31n },
  { name: "Embedded Activities Companion", flags: 1n << 10n | 1n << 11n | 1n << 20n | 1n << 31n | 1n << 39n },
  { name: "Full Administrator (All Privileges)", flags: 1n << 3n },
];

export default function PermissionCalculator() {
  const [selectedFlags, setSelectedFlags] = useState<bigint>(0n);
  const [clientId, setClientId] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedValue, setCopiedValue] = useState<boolean>(false);
  const [selectedPresetName, setSelectedPresetName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePermission = (flag: bigint) => {
    setSelectedFlags((prev) => (prev & flag ? prev ^ flag : prev | flag));
    setSelectedPresetName("");
  };

  const selectPreset = (presetName: string, flags: bigint) => {
    setSelectedPresetName(presetName);
    setSelectedFlags(flags);
    setIsDropdownOpen(false);
  };

  const resetPermissions = () => {
    setSelectedFlags(0n);
    setSelectedPresetName("");
    setIsDropdownOpen(false);
  };

  const formattedValue = selectedFlags.toString();
  const inviteUrl = clientId.trim()
    ? `https://discord.com/oauth2/authorize?client_id=${clientId.trim()}&scope=bot%20applications.commands&permissions=${formattedValue}`
    : `https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=${formattedValue}`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111214", color: "#f2f3f5", fontFamily: "sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        
        {/* Title Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.025em", color: "#ffffff", marginBottom: "6px" }}>
            Permission Calculator
          </h1>
          <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.5" }}>
            Easily setup permissions for your applications with presets and manual input.
          </p>
        </div>

        {/* Top Control Bar: Client ID & Custom Presets Dropdown */}
        <div style={{ backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "20px", marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          
          {/* Client ID Input */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#80848e", display: "block", marginBottom: "8px" }}>
              Client ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 123456789012345678"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#111214",
                border: "1px solid #2b2d31",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Custom Presets Dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#80848e" }}>
                Quick Presets
              </label>
              {selectedFlags > 0n && (
                <button
                  onClick={resetPermissions}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f23f43",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Dropdown Trigger */}
            <div
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#111214",
                border: "1px solid",
                borderColor: isDropdownOpen ? "#acf6c8" : "#2b2d31",
                borderRadius: "6px",
                color: selectedPresetName ? "#ffffff" : "#80848e",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxSizing: "border-box",
                userSelect: "none",
              }}
            >
              <span>{selectedPresetName || "Choose a Preset"}</span>
              <span style={{ fontSize: "10px", color: "#80848e", transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}>
                ▼
              </span>
            </div>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  backgroundColor: "#1e1f22",
                  border: "1px solid #2b2d31",
                  borderRadius: "6px",
                  maxHeight: "240px",
                  overflowY: "auto",
                  zIndex: 50,
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
                  padding: "4px 0",
                }}
              >
                <div
                  onClick={() => {
                    setSelectedPresetName("");
                    setSelectedFlags(0n);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "#80848e",
                    cursor: "pointer",
                    backgroundColor: selectedPresetName === "" ? "#2b2d31" : "transparent",
                  }}
                >
                  Choose a Preset
                </div>
                {PRESETS.map((p) => {
                  const isSelected = selectedPresetName === p.name;
                  return (
                    <div
                      key={p.name}
                      onClick={() => selectPreset(p.name, p.flags)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "13px",
                        color: isSelected ? "#acf6c8" : "#f2f3f5",
                        backgroundColor: isSelected ? "rgba(172, 246, 200, 0.1)" : "transparent",
                        cursor: "pointer",
                        fontWeight: isSelected ? "600" : "400",
                        transition: "background-color 0.1s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#2b2d31";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {p.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Live Output Banner */}
        <div style={{ backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#80848e", marginBottom: "4px" }}>
            Integer
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "monospace", color: "#acf6c8" }}>
              {formattedValue}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => copyToClipboard(formattedValue, setCopiedValue)}
              style={{
                padding: "9px 16px",
                backgroundColor: "#111214",
                border: "1px solid #2b2d31",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {copiedValue ? "Copied Integer!" : "Copy"}
            </button>

            <button
              onClick={() => copyToClipboard(inviteUrl, setCopiedLink)}
              style={{
                padding: "9px 16px",
                backgroundColor: "#acf6c8",
                border: "none",
                borderRadius: "6px",
                color: "#000000",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {copiedLink ? "Copied Link!" : "Copy OAuth2 Invite URL"}
            </button>
          </div>
        </div>

        {/* Categories Matrix */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {PERMISSION_CATEGORIES.map((cat) => (
            <div key={cat.name} style={{ backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", borderBottom: "1px solid #2b2d31", paddingBottom: "8px" }}>
                {cat.name}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {cat.permissions.map((perm) => {
                  const isChecked = (selectedFlags & perm.flag) !== 0n;
                  const isAdmin = perm.name === "Administrator";

                  return (
                    <label
                      key={perm.name}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "8px",
                        borderRadius: "6px",
                        backgroundColor: isChecked ? "rgba(172, 246, 200, 0.05)" : "#111214",
                        border: "1px solid",
                        borderColor: isChecked ? "#acf6c8" : "transparent",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.flag)}
                        style={{
                          accentColor: "#acf6c8",
                          marginTop: "2px",
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: isAdmin ? "#f23f43" : "#ffffff" }}>
                          {perm.name} {isAdmin && "(Elevated)"}
                        </span>
                        <span style={{ fontSize: "11px", color: "#80848e", lineHeight: "1.3", marginTop: "2px" }}>
                          {perm.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}