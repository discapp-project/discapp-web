"use client";

import React, { useState } from "react";

interface PermissionFlag {
  name: string;
  description: string;
  bit: bigint;
  category: "General" | "Membership" | "Text" | "Voice" | "Advanced";
}

const DISCORD_PERMISSIONS: PermissionFlag[] = [
  { name: "Administrator", description: "Vetoes all permissions; grants full server control", bit: 1n << 3n, category: "General" },
  { name: "Manage Server", description: "Allows editing server name, icon, region, and adding bots", bit: 1n << 5n, category: "General" },
  { name: "Manage Roles", description: "Allows creating, editing, and deleting roles below their highest role", bit: 1n << 28n, category: "General" },
  { name: "Manage Channels", description: "Allows creating, editing, and deleting channels", bit: 1n << 4n, category: "General" },
  { name: "View Audit Log", description: "Allows viewing the server's audit logs", bit: 1n << 7n, category: "General" },
  { name: "View Server Insights", description: "Allows viewing server analytics and community insights", bit: 1n << 19n, category: "General" },
  { name: "Manage Webhooks", description: "Allows creating, editing, and deleting webhooks", bit: 1n << 29n, category: "General" },
  { name: "Manage Expressions", description: "Allows creating, editing, and deleting custom emojis and stickers", bit: 1n << 30n, category: "General" },

  { name: "Kick Members", description: "Allows removing members from the server", bit: 1n << 1n, category: "Membership" },
  { name: "Ban Members", description: "Allows permanently banning members from the server", bit: 1n << 2n, category: "Membership" },
  { name: "Create Invite", description: "Allows users to invite new members to the server", bit: 1n << 0n, category: "Membership" },
  { name: "Change Nickname", description: "Allows changing their own server nickname", bit: 1n << 26n, category: "Membership" },
  { name: "Manage Nicknames", description: "Allows changing other members' nicknames", bit: 1n << 27n, category: "Membership" },
  { name: "Moderate Members", description: "Allows timing out members and preventing them from speaking", bit: 1n << 40n, category: "Membership" },

  { name: "Send Messages", description: "Allows sending messages in text channels", bit: 1n << 11n, category: "Text" },
  { name: "Send Messages in Threads", description: "Allows participating in threads", bit: 1n << 38n, category: "Text" },
  { name: "Create Public Threads", description: "Allows creating public discussion threads", bit: 1n << 35n, category: "Text" },
  { name: "Create Private Threads", description: "Allows creating private discussion threads", bit: 1n << 36n, category: "Text" },
  { name: "Embed Links", description: "Allows sending rich previews and hyperlinks", bit: 1n << 14n, category: "Text" },
  { name: "Attach Files", description: "Allows uploading images, files, and documents", bit: 1n << 15n, category: "Text" },
  { name: "Add Reactions", description: "Allows adding emoji reactions to messages", bit: 1n << 6n, category: "Text" },
  { name: "Use External Emojis", description: "Allows using custom emojis from other servers", bit: 1n << 18n, category: "Text" },
  { name: "Manage Messages", description: "Allows deleting messages sent by others and pinning messages", bit: 1n << 13n, category: "Text" },
  { name: "Read Message History", description: "Allows viewing past messages in channels", bit: 1n << 16n, category: "Text" },
  { name: "Mention @everyone", description: "Allows mentioning @everyone, @here, and all roles", bit: 1n << 17n, category: "Text" },

  { name: "Connect", description: "Allows joining voice channels", bit: 1n << 20n, category: "Voice" },
  { name: "Speak", description: "Allows talking in voice channels", bit: 1n << 21n, category: "Voice" },
  { name: "Mute Members", description: "Allows forcefully muting other members in voice channels", bit: 1n << 22n, category: "Voice" },
  { name: "Deafen Members", description: "Allows forcefully deafening other members in voice channels", bit: 1n << 23n, category: "Voice" },
  { name: "Move Members", description: "Allows moving members between voice channels", bit: 1n << 24n, category: "Voice" },
  { name: "Priority Speaker", description: "Allows lower audio ducking for others when speaking", bit: 1n << 8n, category: "Voice" },
  { name: "Use Soundboard", description: "Allows playing soundboard sounds in voice channels", bit: 1n << 45n, category: "Voice" },

  { name: "View Channel", description: "Allows reading channel content (base permission)", bit: 1n << 10n, category: "Advanced" },
  { name: "Manage Events", description: "Allows creating and managing scheduled server events", bit: 1n << 33n, category: "Advanced" },
  { name: "Manage Threads", description: "Allows renaming, locking, and deleting threads", bit: 1n << 34n, category: "Advanced" },
];

export default function AuditLogPermissionDecoder() {
  const [permissionInput, setPermissionInput] = useState<string>("8");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterMode, setFilterMode] = useState<"all" | "enabled" | "disabled">("all");
  const [copied, setCopied] = useState<boolean>(false);

  let parsedValue = 0n;
  try {
    if (permissionInput.trim() !== "") {
      parsedValue = BigInt(permissionInput.trim());
    }
  } catch {
    parsedValue = 0n;
  }

  const togglePermissionBit = (bit: bigint) => {
    let current = parsedValue;
    if ((current & bit) === bit) {
      current &= ~bit;
    } else {
      current |= bit;
    }
    setPermissionInput(current.toString());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(permissionInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = ["All", "General", "Membership", "Text", "Voice", "Advanced"];

  const filteredPermissions = DISCORD_PERMISSIONS.filter((p) => {
    const isEnabled = (parsedValue & p.bit) === p.bit;
    
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (filterMode === "enabled") matchesStatus = isEnabled;
    if (filterMode === "disabled") matchesStatus = !isEnabled;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const enabledCount = DISCORD_PERMISSIONS.filter((p) => (parsedValue & p.bit) === p.bit).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111214",
        color: "#f2f3f5",
        fontFamily: "inherit",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "28px", textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
            Audit Log Permission Decoder
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", lineHeight: "1.5" }}>
            Paste any Discord role bitfield integer to instantly audit enabled permissions, or click any card below to toggle permissions on and off interactively.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#141518",
            border: "1px solid #232428",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Permission Integer Bitfield
                </label>
                <span style={{ fontSize: "12px", color: "#acf6c8", fontWeight: "600" }}>
                  {enabledCount} of {DISCORD_PERMISSIONS.length} Permissions Active
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  value={permissionInput}
                  onChange={(e) => setPermissionInput(e.target.value)}
                  placeholder="E.g., 8, 1073741824, or 36953857"
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: "#0b0c0e",
                    border: "1px solid #2b2d31",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "15px",
                    outline: "none",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#acf6c8",
                    border: "none",
                    borderRadius: "8px",
                    color: "#000000",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied ? "Copied!" : "Copy Bitfield"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", paddingTop: "4px" }}>
              <span style={{ fontSize: "12px", color: "#80848e", fontWeight: "600" }}>Presets:</span>
              {[
                { label: "Administrator", val: "8" },
                { label: "Moderator", val: "1073741824" },
                { label: "Standard Member", val: "36953857" },
                { label: "Clear All", val: "0" },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPermissionInput(preset.val)}
                  style={{
                    backgroundColor: "#0b0c0e",
                    border: "1px solid #2b2d31",
                    color: "#f2f3f5",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: isActive ? "#1e1f22" : "#141518",
                    border: isActive ? "1px solid #acf6c8" : "1px solid #232428",
                    borderRadius: "8px",
                    color: isActive ? "#acf6c8" : "#949ba4",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search permissions..."
              style={{
                padding: "8px 12px",
                backgroundColor: "#141518",
                border: "1px solid #232428",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
                width: "180px",
              }}
            />
            
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#141518",
                border: "1px solid #232428",
                borderRadius: "8px",
                color: "#f2f3f5",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "12px",
          }}
        >
          {filteredPermissions.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#80848e" }}>
              No permissions found matching your search or filter.
            </div>
          ) : (
            filteredPermissions.map((perm, idx) => {
              const isEnabled = (parsedValue & perm.bit) === perm.bit;

              return (
                <div
                  key={idx}
                  onClick={() => togglePermissionBit(perm.bit)}
                  style={{
                    backgroundColor: "#141518",
                    border: isEnabled ? "1px solid #acf6c8" : "1px solid #232428",
                    borderRadius: "10px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isEnabled ? "#acf6c8" : "#2b2d31";
                    e.currentTarget.style.backgroundColor = "#18191c";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isEnabled ? "#acf6c8" : "#232428";
                    e.currentTarget.style.backgroundColor = "#141518";
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffffff" }}>
                        {perm.name}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: isEnabled ? "rgba(172, 246, 200, 0.1)" : "rgba(237, 66, 69, 0.1)",
                          color: isEnabled ? "#acf6c8" : "#ed4245",
                          border: `1px solid ${isEnabled ? "#acf6c8" : "#ed4245"}`,
                        }}
                      >
                        {isEnabled ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#80848e", margin: 0, lineHeight: "1.4" }}>
                      {perm.description}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #232428", paddingTop: "10px" }}>
                    <span style={{ fontSize: "10px", color: "#949ba4", fontFamily: "monospace" }}>
                      Bit: {perm.bit.toString()}
                    </span>
                    <span style={{ fontSize: "11px", color: isEnabled ? "#acf6c8" : "#80848e", fontWeight: "600" }}>
                      {isEnabled ? "Click to disable" : "Click to enable"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}