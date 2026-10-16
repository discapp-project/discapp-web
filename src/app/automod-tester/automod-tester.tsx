"use client";

import React, { useState } from "react";

interface AutoModRule {
  id: string;
  name: string;
  enabled: boolean;
  eventType: "MESSAGE_SEND";
  triggerType: "KEYWORD" | "REGEX" | "SPAM" | "MENTION_SPAM";
  keywords: string[];
  regexPatterns: string[];
  allowList: string[];
  actions: ("BLOCK" | "TIMEOUT" | "ALERT")[];
  timeoutDurationSeconds: number;
}

export default function AutoModTester() {
  const [rules, setRules] = useState<AutoModRule[]>([
    {
      id: "rule_1",
      name: "Block Bad Words",
      enabled: true,
      eventType: "MESSAGE_SEND",
      triggerType: "KEYWORD",
      keywords: ["badword", "scam", "free nitro", "crypto giveaway"],
      regexPatterns: [],
      allowList: ["unscammable"],
      actions: ["BLOCK", "ALERT"],
      timeoutDurationSeconds: 60,
    },
    {
      id: "rule_2",
      name: "Block Discord Invites & Phishing Domains",
      enabled: true,
      eventType: "MESSAGE_SEND",
      triggerType: "REGEX",
      keywords: [],
      regexPatterns: [
        "(discord\\.gg\/[a-zA-Z0-9]+|discord\\.com\/invite\/[a-zA-Z0-9]+)",
        "(steamcommunnity|discord-nitro|freegift)\\.com",
      ],
      allowList: ["discord.gg/official"],
      actions: ["BLOCK", "TIMEOUT"],
      timeoutDurationSeconds: 300,
    },
  ]);

  const [testMessage, setTestMessage] = useState<string>("Hey guys, check out this free nitro giveaway at discord.gg/fakeinvite!");
  const [activeTab, setActiveTab] = useState<"simulator" | "rules">("simulator");
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0].id);

  const [newRuleName, setNewRuleName] = useState<string>("Custom Regex Filter");
  const [newRuleType, setNewRuleType] = useState<"KEYWORD" | "REGEX">("REGEX");
  const [newRuleInput, setNewRuleInput] = useState<string>("(password|token|secret)");
  const [newRuleAction, setNewRuleAction] = useState<"BLOCK" | "TIMEOUT">("BLOCK");

  const evaluateMessage = (message: string) => {
    if (!message.trim()) return { triggered: false, matches: [] };

    const triggeredMatches: { ruleName: string; action: string; matchedPattern: string }[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const isAllowed = rule.allowList.some((allowed) => 
        message.toLowerCase().includes(allowed.toLowerCase())
      );
      if (isAllowed) continue;

      if (rule.triggerType === "KEYWORD") {
        for (const kw of rule.keywords) {
          if (!kw.trim()) continue;
          const regex = new RegExp(`\\b${kw.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
          if (regex.test(message) || message.toLowerCase().includes(kw.toLowerCase())) {
            triggeredMatches.push({
              ruleName: rule.name,
              action: rule.actions.join(" + "),
              matchedPattern: `Keyword: "${kw}"`,
            });
            break;
          }
        }
      }

      if (rule.triggerType === "REGEX") {
        for (const pattern of rule.regexPatterns) {
          if (!pattern.trim()) continue;
          try {
            const regex = new RegExp(pattern, "i");
            if (regex.test(message)) {
              triggeredMatches.push({
                ruleName: rule.name,
                action: rule.actions.join(" + "),
                matchedPattern: `Regex: /${pattern}/`,
              });
              break;
            }
          } catch (e) {
          }
        }
      }
    }

    return {
      triggered: triggeredMatches.length > 0,
      matches: triggeredMatches,
    };
  };

  const evaluationResult = evaluateMessage(testMessage);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleInput.trim()) return;

    const newRule: AutoModRule = {
      id: `rule_${Date.now()}`,
      name: newRuleName.trim(),
      enabled: true,
      eventType: "MESSAGE_SEND",
      triggerType: newRuleType,
      keywords: newRuleType === "KEYWORD" ? newRuleInput.split(",").map(s => s.trim()) : [],
      regexPatterns: newRuleType === "REGEX" ? [newRuleInput.trim()] : [],
      allowList: [],
      actions: [newRuleAction, "ALERT"],
      timeoutDurationSeconds: 120,
    };

    setRules([...rules, newRule]);
    setNewRuleName("");
    setNewRuleInput("");
    setActiveTab("rules");
  };

  const toggleRuleEnabled = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111214",
        color: "#f2f3f5",
        fontFamily: "sans-serif",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "28px", textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
            Discord AutoMod Sandbox & Tester
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", lineHeight: "1.5" }}>
            Simulate Discord's native AutoMod engine in real-time. Test custom regex patterns, keywords, and action triggers against incoming messages.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[
            { id: "simulator", label: "🛡️ Live Sandbox Simulator" },
            { id: "rules", label: `⚙️ Manage Rules (${rules.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "10px 18px",
                  backgroundColor: isActive ? "#1e1f22" : "#141518",
                  border: isActive ? "1px solid #acf6c8" : "1px solid #232428",
                  borderRadius: "8px",
                  color: isActive ? "#acf6c8" : "#949ba4",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "simulator" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div
                style={{
                  backgroundColor: "#141518",
                  border: "1px solid #232428",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                    Simulate Incoming Message
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Type a test message here..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#0b0c0e",
                      border: "1px solid #2b2d31",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", color: "#80848e", fontWeight: "600" }}>Quick Tests:</span>
                  {[
                    "Hey check out this free nitro giveaway!",
                    "Join my server at discord.gg/example",
                    "Hello everyone, have a great day!",
                    "My password is secure123",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTestMessage(preset)}
                      style={{
                        backgroundColor: "#0b0c0e",
                        border: "1px solid #2b2d31",
                        color: "#f2f3f5",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      {preset.slice(0, 24)}...
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#141518",
                  border: "1px solid #232428",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <h3 style={{ fontSize: "13px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase", marginBottom: "12px" }}>
                  Rules Active in Sandbox ({rules.filter(r => r.enabled).length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px",
                        backgroundColor: "#0b0c0e",
                        borderRadius: "8px",
                        border: "1px solid #2b2d31",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: rule.enabled ? "#acf6c8" : "#80848e",
                          }}
                        />
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff" }}>
                          {rule.name}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#80848e", fontFamily: "monospace" }}>
                        {rule.triggerType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  backgroundColor: "#141518",
                  border: evaluationResult.triggered ? "1px solid #ed4245" : "1px solid #acf6c8",
                  borderRadius: "12px",
                  padding: "24px",
                  minHeight: "340px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                      AutoMod Engine Verdict
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        backgroundColor: evaluationResult.triggered ? "rgba(237, 66, 69, 0.1)" : "rgba(172, 246, 200, 0.1)",
                        color: evaluationResult.triggered ? "#ed4245" : "#acf6c8",
                        border: `1px solid ${evaluationResult.triggered ? "#ed4245" : "#acf6c8"}`,
                      }}
                    >
                      {evaluationResult.triggered ? "🚨 MESSAGE BLOCKED" : "✅ MESSAGE PASSED"}
                    </span>
                  </div>

                  {evaluationResult.triggered ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <p style={{ fontSize: "13px", color: "#f2f3f5", margin: 0 }}>
                        The message violated the following active AutoMod rule(s):
                      </p>
                      
                      {evaluationResult.matches.map((match, i) => (
                        <div
                          key={i}
                          style={{
                            backgroundColor: "#0b0c0e",
                            border: "1px solid #2b2d31",
                            borderRadius: "8px",
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff" }}>
                              Rule: {match.ruleName}
                            </span>
                            <span style={{ fontSize: "11px", color: "#ed4245", fontWeight: "700" }}>
                              Action: {match.action}
                            </span>
                          </div>
                          <span style={{ fontSize: "11px", color: "#949ba4", fontFamily: "monospace" }}>
                            Triggered by: {match.matchedPattern}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "20px 0" }}>
                      <p style={{ fontSize: "14px", color: "#80848e", margin: 0 }}>
                        No filters triggered. Message successfully delivered to channel timeline.
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#80848e", fontWeight: "600" }}>
                    Channel Preview Simulation:
                  </span>
                  <div
                    style={{
                      backgroundColor: "#2b2d31",
                      borderRadius: "6px",
                      padding: "12px",
                      fontSize: "14px",
                      color: evaluationResult.triggered ? "#ed4245" : "#f2f3f5",
                      textDecoration: evaluationResult.triggered ? "line-through" : "none",
                      wordBreak: "break-all",
                    }}
                  >
                    {testMessage || "Empty message..."}
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div
              style={{
                backgroundColor: "#141518",
                border: "1px solid #232428",
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff", marginBottom: "16px" }}>
                Add Custom AutoMod Rule
              </h3>

              <form onSubmit={handleAddRule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                      Rule Name
                    </label>
                    <input
                      type="text"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      placeholder="e.g., Anti-Invite Link"
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "#0b0c0e",
                        border: "1px solid #2b2d31",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                      Trigger Type
                    </label>
                    <select
                      value={newRuleType}
                      onChange={(e) => setNewRuleType(e.target.value as any)}
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "#0b0c0e",
                        border: "1px solid #2b2d31",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "13px",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="REGEX">Regular Expression (Regex)</option>
                      <option value="KEYWORD">Keywords (comma-separated)</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                      Primary Action
                    </label>
                    <select
                      value={newRuleAction}
                      onChange={(e) => setNewRuleAction(e.target.value as any)}
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "#0b0c0e",
                        border: "1px solid #2b2d31",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "13px",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="BLOCK">Block Message</option>
                      <option value="TIMEOUT">Block + Timeout User</option>
                    </select>
                  </div>

                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                    {newRuleType === "REGEX" ? "Regex Pattern" : "Keywords (comma separated)"}
                  </label>
                  <input
                    type="text"
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    placeholder={newRuleType === "REGEX" ? "(discord\\.gg\/[a-zA-Z0-9]+)" : "word1, word2, badphrase"}
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "#0b0c0e",
                      border: "1px solid #2b2d31",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#acf6c8",
                    border: "none",
                    borderRadius: "8px",
                    color: "#000000",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                  }}
                >
                  Create & Enable Rule
                </button>
              </form>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#ffffff" }}>
                Configured Rules
              </h3>

              {rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    backgroundColor: "#141518",
                    border: "1px solid #232428",
                    borderRadius: "10px",
                    padding: "18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "15px", fontWeight: "600", color: "#ffffff" }}>
                        {rule.name}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: rule.enabled ? "rgba(172, 246, 200, 0.1)" : "rgba(128, 132, 142, 0.1)",
                          color: rule.enabled ? "#acf6c8" : "#80848e",
                        }}
                      >
                        {rule.enabled ? "ACTIVE" : "DISABLED"}
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#80848e", fontFamily: "monospace" }}>
                      {rule.triggerType === "REGEX" ? `Patterns: ${rule.regexPatterns.join(", ")}` : `Keywords: ${rule.keywords.join(", ")}`}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => toggleRuleEnabled(rule.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#0b0c0e",
                        border: "1px solid #2b2d31",
                        borderRadius: "6px",
                        color: "#f2f3f5",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {rule.enabled ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRule(rule.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "rgba(237, 66, 69, 0.1)",
                        border: "1px solid #ed4245",
                        borderRadius: "6px",
                        color: "#ed4245",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}