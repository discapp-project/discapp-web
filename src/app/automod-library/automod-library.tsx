"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Copy, Check } from "lucide-react";
import { REGEX_LIBRARY, CATEGORIES } from "@/app/data/automod";

export default function AutoModRegexLibrary() {
  const warningDialogRef = useRef<HTMLDialogElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeRuleId, setActiveRuleId] = useState<string>(
    REGEX_LIBRARY[0]?.id ?? ""
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const dialog = warningDialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    return () => dialog.close();
  }, []);

  const filteredRules = useMemo(() => {
    return REGEX_LIBRARY.filter((rule) => {
      const matchesCat =
        selectedCategory === "All" || rule.category === selectedCategory;
      const matchesSearch =
        rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.patterns.some((patternItem) =>
          patternItem.pattern.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (rule.wordLists &&
          rule.wordLists.some((wordListItem) =>
            wordListItem.words.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
        rule.source.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeRule =
    filteredRules.find((rule) => rule.id === activeRuleId) ??
    filteredRules[0] ??
    null;

  const handleCopy = async (text: string, key: string) => {
    let success = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn("Clipboard API failed, attempting fallback:", err);
      }
    }

    if (!success) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
    }

    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <main className="automod-page">
      <dialog ref={warningDialogRef} className="automod-warning">
        <p>
          Hey! This library contains words and phrases that may be considered
          offensive or unsafe. Please browse with caution!
        </p>
        <p>
          This library has content submited by users of the site. We have done our best to refrence the original creators of where the user found them but if we messed up, please let us know!
        </p>
        <button type="button" autoFocus onClick={() => warningDialogRef.current?.close()}>
          OK
        </button>
      </dialog>
      <header className="automod-heading">
        <div>
          <h1>AutoMod regex library</h1>
          <span>Search, inspect, and copy Rust-compatible patterns.</span>
        </div>
      </header>

      <section className="automod-filters" aria-label="Filter rules">
        <label className="automod-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search rules</span>
          <input
            type="search"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <div className="automod-categories" aria-label="Categories">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              className={
                selectedCategory === category
                  ? "automod-category is-active"
                  : "automod-category"
              }
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <div className="automod-workspace style-workspace">
        <nav
          className="automod-rules"
          aria-label="Regex rules"
          style={{
            maxHeight: "calc(100vh - 220px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {filteredRules.map((rule) => (
            <button
              key={rule.id}
              type="button"
              onClick={() => setActiveRuleId(rule.id)}
              aria-pressed={activeRuleId === rule.id}
              className={
                activeRuleId === rule.id
                  ? "automod-rule is-active"
                  : "automod-rule"
              }
            >
              <span className="automod-rule-meta">
                <span>{rule.category}</span>
              </span>
              <strong>{rule.title}</strong>
              <span className="automod-rule-description">
                {rule.description}
              </span>
            </button>
          ))}
          {filteredRules.length === 0 && (
            <p className="automod-no-results">No rules match your search.</p>
          )}
        </nav>

        {activeRule ? (
          <div className="automod-detail-column">
            <section
              className="automod-detail"
              style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <div className="automod-detail-heading">
                <div>
                  <p>{activeRule.category}</p>
                  <h2>{activeRule.title}</h2>
                </div>
              </div>

              <p className="automod-description">{activeRule.description}</p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                {activeRule.patterns.map((patternItem, idx) => {
                  const key = `pat-${idx}`;
                  const isCopied = copiedKey === key;
                  return (
                    <div key={key}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "#888",
                            fontWeight: 600,
                          }}
                        >
                          {patternItem.label
                            ? `${patternItem.label}`
                            : "Regex Pattern"}
                        </span>
                        <button
                          className="automod-copy"
                          type="button"
                          onClick={() => handleCopy(patternItem.pattern, key)}
                          style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          {isCopied ? "Copied" : "Copy regex"}
                        </button>
                      </div>
                      <div
                        className="automod-pattern"
                        style={{ wordBreak: "break-all" }}
                      >
                        <code>{patternItem.pattern}</code>
                      </div>
                    </div>
                  );
                })}

                {activeRule.wordLists &&
                  activeRule.wordLists.map((wordListItem, idx) => {
                    const key = `words-${idx}`;
                    const isCopied = copiedKey === key;
                    return (
                      <div key={key}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "#888",
                              fontWeight: 600,
                            }}
                          >
                            {wordListItem.label
                              ? `${wordListItem.label}`
                              : "Word / Phrase Blocklist"}
                          </span>
                          <button
                            className="automod-copy"
                            type="button"
                            onClick={() => handleCopy(wordListItem.words, key)}
                            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                          >
                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            {isCopied ? "Copied" : "Copy words"}
                          </button>
                        </div>
                        <div
                          className="automod-pattern"
                          style={{ wordBreak: "break-all" }}
                        >
                          <code>{wordListItem.words}</code>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <footer
                style={{
                  marginTop: "auto",
                  paddingTop: "1.5rem",
                  fontSize: "0.8rem",
                  color: "#666",
                  textAlign: "right",
                }}
              >
                {activeRule.source.type === "server" ? (
                  <>
                    Sourced from server:{" "}
                    <span style={{ color: "#aaa" }}>
                      {activeRule.source.name}
                    </span>
                  </>
                ) : (
                  <>
                    Contributed by{" "}
                    <span style={{ color: "#aaa" }}>
                      {activeRule.source.name}
                    </span>
                  </>
                )}
              </footer>
            </section>
          </div>
        ) : (
          <p className="automod-empty-detail">Choose a rule to inspect it.</p>
        )}
      </div>

      <style jsx>{`
        .style-workspace {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 768px) {
          .style-workspace {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .automod-rules {
            max-height: 250px !important;
          }
        }
      `}</style>
    </main>
  );
}