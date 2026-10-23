"use client";

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111214",
        color: "#f2f3f5",
        fontFamily: "inherit",
        padding: "80px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#ffffff",
              letterSpacing: "-0.5px",
              margin: 0,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", margin: 0 }}>
            Last updated: 10/16/2026
          </p>
        </div>

        <p
          style={{
            color: "#dbdee1",
            fontSize: "15px",
            lineHeight: "1.7",
            margin: 0,
          }}
        >
          This is our privacy policy which outlines how we handle your information as you use the site. If you have any questions, concerns, or recommendations, please reach out to us! More information about that below.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                margin: 0,
              }}
            >
              1. No Accounts or Cookies
            </h2>
            <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              No account creation or login is required to use any tool on this site. We do not place tracking, advertising, state, or session cookies on your device.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                margin: 0,
              }}
            >
              2. Bug Reporting
            </h2>
            <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              Submitting a bug report collects standard browser and device diagnostic information exclusively to help reproduce and resolve technical issues.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                margin: 0,
              }}
            >
              3. Bot & Anti-Spam Protection
            </h2>
            <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              Form submissions are secured using hCaptcha to prevent automated bots and attacks. hCaptcha processes essential device and hardware signals strictly for verification purposes.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                margin: 0,
              }}
            >
              4. Analytics & Server Logs
            </h2>
            <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.6", margin: "0 0 8px 0" }}>
              <strong style={{ color: "#dbdee1" }}>Analytics:</strong> We use cookie-less, privacy-focused Vercel Analytics to watch patterns and operational health without collecting personal data.
            </p>
            <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              <strong style={{ color: "#dbdee1" }}>Logging:</strong> Basic connection info (IP addresses and request timestamps) is automatically logged by Vercel infrastructure for routing and DDoS mitigation.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                margin: 0,
              }}
            >
              5. No Data Sold or Shared
            </h2>
            <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              Discapp does not sell, share, or trade any personal information. We do not use your data for advertising or marketing purposes.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                margin: 0,
              }}
            >
              6. Disclaimer
            </h2>
            <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              This platform is an independent developer utility suite and is not officially affiliated with, sponsored by, or endorsed by Discord Inc.
            </p>
          </div>

          <div
            style={{
              borderTop: "1px solid #232428",
              paddingTop: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                margin: 0,
              }}
            >
              Contact Information
            </h2>
            <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              For legal inquiries or privacy concerns, reach out via our community server or email us directly at{" "}
              <a
                href="mailto:legal@discapp.org"
                style={{
                  color: "#acf6c8",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                legal@discapp.org
              </a>
              .
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}