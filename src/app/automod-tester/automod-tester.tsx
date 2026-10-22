"use client";

import React, { useState } from "react";

interface AutoModRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: "KEYWORD" | "REGEX";
  patterns: string[];
  action: "BLOCK" | "TIMEOUT";
}

export default function AutoModTester() {
  const [rules, setRules] = useState<AutoModRule[]>([
    {
      id: "rule_1",
      name: "Bad Words & Scams",
      enabled: true,
      triggerType: "KEYWORD",
      patterns: ["badword", "scam", "free nitro", "crypto giveaway"],
      action: "BLOCK",
    },
    {
      id: "rule_2",
      name: "Invites & Phishing Links",
      enabled: true,
      triggerType: "REGEX",
      patterns: [
        "(discord\\.gg\\/[a-zA-Z0-9]+|discord\\.com\\/invite\\/[a-zA-Z0-9]+)",
        "(steamcommunnity|discord-nitro|freegift)\\.com",
      ],
      action: "TIMEOUT",
    },
  ]);

  const [testMessage, setTestMessage] = useState<string>(
    "Hey guys, check out this free nitro giveaway at discord.gg/fakeinvite!"
  );

  // Rule Creator State
  const [newRuleName, setNewRuleName] = useState<string>("");
  const [newRuleType, setNewRuleType] = useState<"KEYWORD" | "REGEX">("REGEX");
  const [newRuleInput, setNewRuleInput] = useState<string>("");
  const [newRuleAction, setNewRuleAction] = useState<"BLOCK" | "TIMEOUT">("BLOCK");

  const evaluateMessage = (message: string) => {
    if (!message.trim()) return { triggered: false, matches: [] };

    const triggeredMatches: { ruleName: string; action: string; matchedPattern: string }[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      if (rule.triggerType === "KEYWORD") {
        for (const kw of rule.patterns) {
          if (!kw.trim()) continue;
          const regex = new RegExp(`\\b${kw.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
          if (regex.test(message) || message.toLowerCase().includes(kw.toLowerCase())) {
            triggeredMatches.push({
              ruleName: rule.name,
              action: rule.action === "TIMEOUT" ? "Block + Timeout" : "Block Message",
              matchedPattern: `Keyword: "${kw}"`,
            });
            break;
          }
        }
      }

      if (rule.triggerType === "REGEX") {
        for (const pattern of rule.patterns) {
          if (!pattern.trim()) continue;
          try {
            const regex = new RegExp(pattern, "i");
            if (regex.test(message)) {
              triggeredMatches.push({
                ruleName: rule.name,
                action: rule.action === "TIMEOUT" ? "Block + Timeout" : "Block Message",
                matchedPattern: `Regex: /${pattern}/`,
              });
              break;
            }
          } catch (e) {}
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
      triggerType: newRuleType,
      patterns:
        newRuleType === "KEYWORD"
          ? newRuleInput.split(",").map((s) => s.trim()).filter(Boolean)
          : [newRuleInput.trim()],
      action: newRuleAction,
    };

    setRules([...rules, newRule]);
    setNewRuleName("");
    setNewRuleInput("");
  };

  const toggleRuleEnabled = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
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
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* Header Section */}
        <div style={{ textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            AutoMod Tester
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
            Configure AutoMod filters and test them instantly against sample text payloads.
          </p>
        </div>

        {/* SINGLE VERTICAL STACK CONTAINER */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* SECTION 1: LIVE SIMULATOR */}
          <div
            style={{
              backgroundColor: "#141518",
              border: "1px solid #232428",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Simulator
            </h3>

            {/* Test Message Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                Test Message Input
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type a test message here..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#0b0c0e",
                  border: "1px solid #2b2d31",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  lineHeight: "1.5",
                  fontFamily: "sans-serif",
                }}
              />
            </div>

            {/* Engine Verdict Box */}
            <div
              style={{
                backgroundColor: "#0b0c0e",
                border: "1px solid #2b2d31",
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                  Verdict:
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
                  {evaluationResult.triggered ? "BLOCKED" : "PASSED"}
                </span>
              </div>

              {evaluationResult.triggered ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#949ba4" }}>Matched Violations:</span>
                  {evaluationResult.matches.map((match, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#141518",
                        border: "1px solid #232428",
                        borderRadius: "6px",
                        padding: "10px 12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff" }}>
                          {match.ruleName}
                        </span>
                        <span style={{ fontSize: "11px", color: "#80848e", fontFamily: "monospace" }}>
                          {match.matchedPattern}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#ed4245", fontWeight: "700" }}>
                        {match.action}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "#80848e", margin: 0 }}>
                  No rules triggered.
                </p>
              )}
            </div>

          </div>

          {/* SECTION 2: ADD NEW RULE */}
          <div
            style={{
              backgroundColor: "#141518",
              border: "1px solid #232428",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Add Rule
            </h3>

            <form onSubmit={handleAddRule} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                  Rule Name
                </label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. Secret Filter"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0b0c0e",
                    border: "1px solid #2b2d31",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                    Trigger Type
                  </label>
                  <select
                    value={newRuleType}
                    onChange={(e) => setNewRuleType(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "#0b0c0e",
                      border: "1px solid #2b2d31",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="REGEX">Regex Pattern</option>
                    <option value="KEYWORD">Keyword List</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                    Action
                  </label>
                  <select
                    value={newRuleAction}
                    onChange={(e) => setNewRuleAction(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "#0b0c0e",
                      border: "1px solid #2b2d31",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="BLOCK">Block Message</option>
                    <option value="TIMEOUT">Block + Timeout</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                  {newRuleType === "REGEX" ? "Pattern" : "Keywords (comma separated)"}
                </label>
                <input
                  type="text"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  placeholder={newRuleType === "REGEX" ? "(password|secret|token)" : "token, password"}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0b0c0e",
                    border: "1px solid #2b2d31",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: "10px 16px",
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
                Add Rule
              </button>
            </form>
          </div>

          {/* SECTION 3: CONFIGURED RULES LIST */}
          <div
            style={{
              backgroundColor: "#141518",
              border: "1px solid #232428",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Rules ({rules.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    backgroundColor: "#0b0c0e",
                    border: "1px solid #2b2d31",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff" }}>
                        {rule.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#80848e",
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {rule.triggerType}: {rule.patterns.join(", ")}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => toggleRuleEnabled(rule.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#141518",
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

        </div>

      </div>
    </div>
  );
}