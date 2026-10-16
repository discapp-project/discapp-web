"use client";

import React, { useState, useEffect, useRef } from "react";

interface FormatOption {
  code: string;
  name: string;
  exampleStyle: string;
  getExample: (date: Date) => string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    code: "R",
    name: "Relative Time (e.g., 2 hours ago / in 2 hours)",
    exampleStyle: "2 hours ago / in 2 hours",
    getExample: (d) => getRelativeTimeString(d),
  },
  {
    code: "f",
    name: "Short Date & Time (e.g., January 15, 2026 2:30 PM)",
    exampleStyle: "January 15, 2026 2:30 PM",
    getExample: (d) =>
      d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  },
  {
    code: "F",
    name: "Long Date & Time (e.g., Thursday, January 15, 2026 2:30 PM)",
    exampleStyle: "Thursday, January 15, 2026 2:30 PM",
    getExample: (d) =>
      d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  },
  {
    code: "d",
    name: "Short Date (e.g., 01/15/2026)",
    exampleStyle: "01/15/2026",
    getExample: (d) =>
      d.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
  },
  {
    code: "D",
    name: "Long Date (e.g., January 15, 2026)",
    exampleStyle: "January 15, 2026",
    getExample: (d) =>
      d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
  },
  {
    code: "t",
    name: "Short Time (e.g., 2:30 PM)",
    exampleStyle: "2:30 PM",
    getExample: (d) =>
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  },
  {
    code: "T",
    name: "Long Time (e.g., 2:30:00 PM)",
    exampleStyle: "2:30:00 PM",
    getExample: (d) =>
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }),
  },
];

function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const absSec = Math.abs(diffInSeconds);

  const minutes = Math.floor(absSec / 60);
  const hours = Math.floor(absSec / 3600);
  const days = Math.floor(absSec / 86400);

  if (absSec < 45) return diffInSeconds >= 0 ? "in a few seconds" : "a few seconds ago";
  if (minutes < 45) return diffInSeconds >= 0 ? `in ${minutes} minutes` : `${minutes} minutes ago`;
  if (hours < 24) return diffInSeconds >= 0 ? `in ${hours} hours` : `${hours} hours ago`;
  return diffInSeconds >= 0 ? `in ${days} days` : `${days} days ago`;
}

function parseDateTimeInput(val: string): Date {
  if (!val) return new Date();
  const [datePart, timePart] = val.split("T");
  if (!datePart || !timePart) return new Date();
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function formatToDateTimeInput(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function DiscordTimestampGenerator() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateInputValue, setDateInputValue] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("R");
  const [copied, setCopied] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDateInputValue(formatToDateTimeInput(new Date()));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateInputValue(val);
    if (val) {
      setSelectedDate(parseDateTimeInput(val));
    }
  };

  const setNow = () => {
    const now = new Date();
    setSelectedDate(now);
    setDateInputValue(formatToDateTimeInput(now));
  };

  const unixTimestamp = Math.floor(selectedDate.getTime() / 1000);
  const activeFormatObj = FORMAT_OPTIONS.find((f) => f.code === selectedFormat) || FORMAT_OPTIONS[0];
  const generatedCode = `<t:${unixTimestamp}:${selectedFormat}>`;

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111214", color: "#f2f3f5", fontFamily: "sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: "580px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#ffffff", marginBottom: "6px" }}>
            Discord Timestamp Generator
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", lineHeight: "1.5" }}>
            Create dynamic Discord timestamps that automatically adjust to each user's local timezone.
          </p>
        </div>

        <div style={{ backgroundColor: "#141518", border: "1px solid #232428", borderRadius: "10px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600" }}>
              Target Date & Time
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="datetime-local"
                value={dateInputValue}
                onChange={handleDateInputChange}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  backgroundColor: "#0b0c0e",
                  border: "1px solid #2b2d31",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                onClick={setNow}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#acf6c8",
                  border: "none",
                  borderRadius: "6px",
                  color: "#000000",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Set to Now
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} ref={dropdownRef}>
            <label style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600" }}>
              Timestamp Display Format
            </label>
            
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#0b0c0e",
                  border: "1px solid #2b2d31",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "14px",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <span>{activeFormatObj.name}</span>
                <span style={{ fontSize: "10px", color: "#949ba4", transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                  ▼
                </span>
              </button>

              {isDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    backgroundColor: "#0b0c0e",
                    border: "1px solid #2b2d31",
                    borderRadius: "6px",
                    zIndex: 50,
                    maxHeight: "240px",
                    overflowY: "auto",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
                  }}
                >
                  {FORMAT_OPTIONS.map((opt) => {
                    const isSelected = opt.code === selectedFormat;
                    return (
                      <div
                        key={opt.code}
                        onClick={() => {
                          setSelectedFormat(opt.code);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          padding: "10px 14px",
                          fontSize: "13px",
                          color: isSelected ? "#acf6c8" : "#f2f3f5",
                          backgroundColor: isSelected ? "#1e1f22" : "transparent",
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "#141518";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {opt.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }}>
            <code style={{ flex: 1, backgroundColor: "#0b0c0e", border: "1px solid #232428", padding: "10px 14px", borderRadius: "6px", fontSize: "14px", color: "#acf6c8", fontFamily: "monospace", overflowX: "auto" }}>
              {generatedCode}
            </code>
            <button
              onClick={copyCode}
              style={{
                padding: "10px 20px",
                backgroundColor: "#acf6c8",
                border: "none",
                borderRadius: "6px",
                color: "#000000",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}