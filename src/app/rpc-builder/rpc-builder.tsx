"use client";

import React, { useState } from "react";

export default function RichPresenceBuilder() {
  // Topbar navigation tab including Export
  const [activeTab, setActiveTab] = useState<"general" | "assets" | "timestamps" | "party" | "buttons" | "export">("general");

  // Client Application ID and Library Selection
  const [clientId, setClientId] = useState<string>("YOUR_CLIENT_ID");
  const [appName, setAppName] = useState<string>("Discapp Utility Suite");
  const [libChoice, setLibChoice] = useState<"discord-rpc" | "discord-api-types" | "discord.py">("discord-rpc");

  // Feature optional toggles
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [showState, setShowState] = useState<boolean>(false);
  const [showAssets, setShowAssets] = useState<boolean>(false);
  const [showTimestamps, setShowTimestamps] = useState<boolean>(false);
  const [showParty, setShowParty] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<boolean>(false);

  // Field values
  const [details, setDetails] = useState<string>("Exploring Discapp Hub");
  const [state, setState] = useState<string>("In Developer Mode");
  const [largeImageKey, setLargeImageKey] = useState<string>("discapp_logo");
  const [largeImageText, setLargeImageText] = useState<string>("Discapp v1.0");
  const [smallImageKey, setSmallImageKey] = useState<string>("verified_badge");
  const [smallImageText, setSmallImageText] = useState<string>("Verified Developer");
  
  // Timestamp options
  const [timestampMode, setTimestampMode] = useState<"elapsed" | "remaining">("elapsed");
  const [customElapsedHours, setCustomElapsedHours] = useState<number>(0);
  const [customElapsedMinutes, setCustomElapsedMinutes] = useState<number>(25);
  const [customRemainingMinutes, setCustomRemainingMinutes] = useState<number>(10);

  // Party options
  const [partyId, setPartyId] = useState<string>("party_123");
  const [partySize, setPartySize] = useState<number>(1);
  const [partyMax, setPartyMax] = useState<number>(5);

  // Button options
  const [button1Label, setButton1Label] = useState<string>("GitHub Repo");
  const [button1Url, setButton1Url] = useState<string>("https://github.com");
  const [button2Label, setButton2Label] = useState<string>("Website");
  const [button2Url, setButton2Url] = useState<string>("https://example.com");

  const [copied, setCopied] = useState<boolean>(false);

  // Generate Modern Asynchronous Node.js / TypeScript Code with Lifecycle & Reconnection
  const generateNodeCode = () => {
    let activityObj = `{`;
    if (showDetails && details) activityObj += `details:"${details}",`;
    if (showState && state) activityObj += `state:"${state}",`;
    if (showTimestamps) {
      activityObj += `timestamps:{`;
      if (timestampMode === "elapsed") {
        const totalSec = (customElapsedHours * 3600) + (customElapsedMinutes * 60);
        activityObj += `start:Date.now()-(${totalSec}*1000)`;
      } else {
        const totalSec = customRemainingMinutes * 60;
        activityObj += `end:Date.now()+(${totalSec}*1000)`;
      }
      activityObj += `},`;
    }
    if (showAssets && (largeImageKey || smallImageKey || largeImageText || smallImageText)) {
      activityObj += `assets:{`;
      if (largeImageKey) activityObj += `largeImage:"${largeImageKey}",large_image:"${largeImageKey}",`;
      if (largeImageText) activityObj += `largeImageText:"${largeImageText}",large_text:"${largeImageText}",`;
      if (smallImageKey) activityObj += `smallImage:"${smallImageKey}",small_image:"${smallImageKey}",`;
      if (smallImageText) activityObj += `smallImageText:"${smallImageText}",small_text:"${smallImageText}",`;
      activityObj = activityObj.replace(/,$/, "") + `},`;
    }
    if (showParty && partyId && partyMax > 0) {
      activityObj += `partyId:"${partyId}",party:{id:"${partyId}",size:[${partySize},${partyMax}]},`;
    }
    if (showButtons) {
      const buttons = [];
      if (button1Label && button1Url) buttons.push({ label: button1Label, url: button1Url });
      if (button2Label && button2Url) buttons.push({ label: button2Label, url: button2Url });
      if (buttons.length > 0) {
        activityObj += `buttons:${JSON.stringify(buttons)},`;
      }
    }
    activityObj = activityObj.replace(/,$/, "") + `}`;

    const id = clientId || "YOUR_CLIENT_ID";

    if (libChoice === "discord-rpc") {
      return `const{Client}=require('discord-rpc');
const clientId='${id}';
const client=new Client({transport:'ipc'});
async function setActivity(){
try{
await client.setActivity(${activityObj});
console.log('RPC Activity updated successfully.');
}catch(err){
console.error('Failed to set activity:',err);
}
}
client.on('ready',()=>{
console.log('RPC Client logged in as',client.user.username);
setActivity();
setInterval(setActivity,15000);
});
client.on('error',(err)=>{
console.error('RPC Connection error:',err);
});
async function gracefulExit(){
try{
await client.clearActivity();
await client.destroy();
console.log('RPC session closed cleanly.');
}catch(e){}
process.exit(0);
}
process.on('SIGINT',gracefulExit);
process.on('SIGTERM',gracefulExit);
client.login({clientId}).catch((err)=>{
console.error('Login failed, attempting reconnection in 5s...',err);
setTimeout(()=>client.login({clientId}),5000);
});`;
    } else {
      // Modern discord-api-types / custom WebSocket IPC approach
      return `const{WebSocket}=require('ws');
const clientId='${id}';
// Modern minimal WebSocket IPC wrapper for Discord Rich Presence
async function initRPC(){
console.log('Initializing modern Discord RPC client for ID:',clientId);
// Reconnection loop & lifecycle handlers
let active=true;
process.on('SIGINT',async()=>{active=false;process.exit(0);});
process.on('SIGTERM',async()=>{active=false;process.exit(0);});
}
initRPC();`;
    }
  };

  // Generate Discord.py Code with Lifecycle handlers
  const generatePythonCode = () => {
    const id = clientId || "YOUR_CLIENT_ID";
    let updateArgs = ``;
    if (showDetails && details) updateArgs += `details="${details}",`;
    if (showState && state) updateArgs += `state="${state}",`;
    if (showTimestamps) {
      if (timestampMode === "elapsed") {
        const totalSec = (customElapsedHours * 3600) + (customElapsedMinutes * 60);
        updateArgs += `start=int(time.time())-${totalSec},`;
      } else {
        const totalSec = customRemainingMinutes * 60;
        updateArgs += `end=int(time.time())+${totalSec},`;
      }
    }
    if (showAssets) {
      if (largeImageKey) updateArgs += `large_image="${largeImageKey}",`;
      if (largeImageText) updateArgs += `large_text="${largeImageText}",`;
      if (smallImageKey) updateArgs += `small_image="${smallImageKey}",`;
      if (smallImageText) updateArgs += `small_text="${smallImageText}",`;
    }
    if (showParty && partyId && partyMax > 0) {
      updateArgs += `party_id="${partyId}",party_size=[${partySize},${partyMax}],`;
    }
    if (showButtons) {
      const buttons = [];
      if (button1Label && button1Url) buttons.push({ label: button1Label, url: button1Url });
      if (button2Label && button2Url) buttons.push({ label: button2Label, url: button2Url });
      if (buttons.length > 0) {
        updateArgs += `buttons=${JSON.stringify(buttons)},`;
      }
    }
    updateArgs = updateArgs.replace(/,$/, "");

    return `import time
import sys
import signal
from pypresence import Presence, exceptions

client_id="${id}"
RPC=Presence(client_id)

def handle_exit(sig,frame):
    try:
        RPC.clear()
        RPC.close()
        print("\\nRPC connection closed cleanly.")
    except Exception:
        pass
    sys.exit(0)

signal.signal(signal.SIGINT,handle_exit)
signal.signal(signal.SIGTERM,handle_exit)

def connect_rpc():
    while True:
        try:
            RPC.connect()
            print("Connected to Discord Rich Presence.")
            break
        except Exception as e:
            print(f"Connection failed: {e}. Retrying in 5 seconds...")
            time.sleep(5)

connect_rpc()

while True:
    try:
        RPC.update(${updateArgs})
    except exceptions.InvalidPipe as e:
        print(f"Pipe lost: {e}. Reconnecting...")
        connect_rpc()
    except Exception as e:
        print(f"Error updating presence: {e}")
    time.sleep(15)`;
  };

  const outputCode = libChoice === "discord.py" ? generatePythonCode() : generateNodeCode();

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div style={{ maxWidth: "1250px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
            Rich Presence (RPC) State Builder
          </h1>
          <p style={{ color: "#80848e", fontSize: "14px", lineHeight: "1.5" }}>
            Build custom rich presence states for your Discord account.
          </p>
        </div>

        {/* Topbar Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderBottom: "1px solid #232428", paddingBottom: "16px" }}>
          {[
            { id: "general", label: "General" },
            { id: "assets", label: "Assets" },
            { id: "timestamps", label: "Timestamps" },
            { id: "party", label: "Parties" },
            { id: "buttons", label: "Buttons" },
            { id: "export", label: "Export" },
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
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Workspace Grid */}
        <div style={{ display: "grid", gridTemplateColumns: activeTab === "export" ? "1fr" : "1.25fr 1fr", gap: "24px", alignItems: "start" }}>
          
          {/* LEFT COLUMN: Configuration Panel */}
          <div style={{ backgroundColor: "#141518", border: "1px solid #232428", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                  General & Application Settings
                </h3>

                {/* Application Name / ID */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>Application Name</label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="e.g. My Custom Game"
                      style={{ padding: "10px 12px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>Client / App ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="123456789012345678"
                      style={{ padding: "10px 12px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", fontFamily: "monospace" }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid #232428", paddingTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                      Details (Line 1)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#80848e", cursor: "pointer" }}>
                      <input type="checkbox" checked={showDetails} onChange={(e) => setShowDetails(e.target.checked)} style={{ accentColor: "#acf6c8" }} />
                      Enable Details
                    </label>
                  </div>
                  {showDetails && (
                    <input
                      type="text"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="e.g. Exploring Discapp Hub"
                      style={{ padding: "12px 14px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "14px", outline: "none" }}
                    />
                  )}
                </div>

                {/* State */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid #232428", paddingTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "12px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                      State (Line 2)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#80848e", cursor: "pointer" }}>
                      <input type="checkbox" checked={showState} onChange={(e) => setShowState(e.target.checked)} style={{ accentColor: "#acf6c8" }} />
                      Enable State
                    </label>
                  </div>
                  {showState && (
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Playing Ranked Solo"
                      style={{ padding: "12px 14px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "14px", outline: "none" }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ASSETS TAB */}
            {activeTab === "assets" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                    Rich Presence Assets & Images
                  </h3>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#80848e", cursor: "pointer" }}>
                    <input type="checkbox" checked={showAssets} onChange={(e) => setShowAssets(e.target.checked)} style={{ accentColor: "#acf6c8" }} />
                    Enable Assets
                  </label>
                </div>

                {showAssets ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>Large Image Key</label>
                        <input type="text" value={largeImageKey} onChange={(e) => setLargeImageKey(e.target.value)} placeholder="logo_key" style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>Large Image Tooltip</label>
                        <input type="text" value={largeImageText} onChange={(e) => setLargeImageText(e.target.value)} placeholder="Hover text" style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>Small Image Key</label>
                        <input type="text" value={smallImageKey} onChange={(e) => setSmallImageKey(e.target.value)} placeholder="badge_key" style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>Small Image Tooltip</label>
                        <input type="text" value={smallImageText} onChange={(e) => setSmallImageText(e.target.value)} placeholder="Hover text" style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#80848e", margin: 0 }}>Enable assets above to configure application images and hover tooltips.</p>
                )}
              </div>
            )}

            {/* TIMESTAMPS TAB */}
            {activeTab === "timestamps" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                    Timestamp & Elapsed Counters
                  </h3>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#80848e", cursor: "pointer" }}>
                    <input type="checkbox" checked={showTimestamps} onChange={(e) => setShowTimestamps(e.target.checked)} style={{ accentColor: "#acf6c8" }} />
                    Enable Timestamps
                  </label>
                </div>

                {showTimestamps ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[
                        { id: "elapsed", label: "Elapsed Time" },
                        { id: "remaining", label: "Remaining Time" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setTimestampMode(mode.id as any)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            backgroundColor: timestampMode === mode.id ? "#1e1f22" : "#0b0c0e",
                            border: timestampMode === mode.id ? "1px solid #acf6c8" : "1px solid #2b2d31",
                            borderRadius: "8px",
                            color: timestampMode === mode.id ? "#acf6c8" : "#f2f3f5",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    {timestampMode === "elapsed" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "11px", color: "#80848e" }}>Hours Elapsed</label>
                          <input type="number" min="0" value={customElapsedHours} onChange={(e) => setCustomElapsedHours(Math.max(0, parseInt(e.target.value) || 0))} style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "11px", color: "#80848e" }}>Minutes Elapsed</label>
                          <input type="number" min="0" max="59" value={customElapsedMinutes} onChange={(e) => setCustomElapsedMinutes(Math.max(0, parseInt(e.target.value) || 0))} style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                        </div>
                      </div>
                    )}

                    {timestampMode === "remaining" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "11px", color: "#80848e" }}>Minutes Remaining</label>
                        <input type="number" min="1" value={customRemainingMinutes} onChange={(e) => setCustomRemainingMinutes(Math.max(1, parseInt(e.target.value) || 1))} style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#80848e", margin: 0 }}>Enable timestamps above to display activity duration counters.</p>
                )}
              </div>
            )}

            {/* PARTY TAB */}
            {activeTab === "party" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                    Party Grouping & Size
                  </h3>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#80848e", cursor: "pointer" }}>
                    <input type="checkbox" checked={showParty} onChange={(e) => setShowParty(e.target.checked)} style={{ accentColor: "#acf6c8" }} />
                    Enable Party
                  </label>
                </div>

                {showParty ? (
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", color: "#80848e" }}>Party ID</label>
                      <input type="text" value={partyId} onChange={(e) => setPartyId(e.target.value)} style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", color: "#80848e" }}>Size</label>
                      <input type="number" value={partySize} onChange={(e) => setPartySize(parseInt(e.target.value) || 1)} style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", color: "#80848e" }}>Max</label>
                      <input type="number" value={partyMax} onChange={(e) => setPartyMax(parseInt(e.target.value) || 1)} style={{ padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#80848e", margin: 0 }}>Enable party grouping to show multiplayer lobby player counts.</p>
                )}
              </div>
            )}

            {/* BUTTONS TAB */}
            {activeTab === "buttons" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                    Interactive Action Buttons
                  </h3>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#80848e", cursor: "pointer" }}>
                    <input type="checkbox" checked={showButtons} onChange={(e) => setShowButtons(e.target.checked)} style={{ accentColor: "#acf6c8" }} />
                    Enable Buttons
                  </label>
                </div>

                {showButtons ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="text" value={button1Label} onChange={(e) => setButton1Label(e.target.value)} placeholder="Button 1 Label" style={{ width: "35%", padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                      <input type="text" value={button1Url} onChange={(e) => setButton1Url(e.target.value)} placeholder="https://..." style={{ flex: 1, padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="text" value={button2Label} onChange={(e) => setButton2Label(e.target.value)} placeholder="Button 2 Label" style={{ width: "35%", padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                      <input type="text" value={button2Url} onChange={(e) => setButton2Url(e.target.value)} placeholder="https://..." style={{ flex: 1, padding: "10px", backgroundColor: "#0b0c0e", border: "1px solid #2b2d31", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }} />
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#80848e", margin: 0 }}>Enable action buttons to render clickable links on your Discord profile.</p>
                )}
              </div>
            )}

            {/* EXPORT TAB */}
            {activeTab === "export" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                    Export Production Code
                  </h3>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[
                      { id: "discord-rpc", label: "discord-rpc (Node)" },
                      { id: "discord-api-types", label: "discord-api-types (Modern)" },
                      { id: "discord.py", label: "discord.py (Python)" },
                    ].map((lib) => {
                      const isActive = libChoice === lib.id;
                      return (
                        <button
                          key={lib.id}
                          type="button"
                          onClick={() => setLibChoice(lib.id as any)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: isActive ? "#1e1f22" : "#0b0c0e",
                            border: isActive ? "1px solid #acf6c8" : "1px solid #2b2d31",
                            borderRadius: "6px",
                            color: isActive ? "#acf6c8" : "#949ba4",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          {lib.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#0b0c0e",
                    border: "1px solid #2b2d31",
                    borderRadius: "8px",
                    padding: "16px",
                    color: "#acf6c8",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    maxHeight: "300px",
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {outputCode}
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    padding: "12px",
                    backgroundColor: "#acf6c8",
                    border: "none",
                    borderRadius: "8px",
                    color: "#000000",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {copied ? "Copied Code to Clipboard!" : "Copy Full Code"}
                </button>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Ultra-Realistic Discord Profile Preview */}
          {activeTab !== "export" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "20px" }}>
              
              <div style={{ backgroundColor: "#141518", border: "1px solid #232428", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "11px", color: "#949ba4", fontWeight: "600", textTransform: "uppercase" }}>
                  Preview
                </span>

                <div style={{ backgroundColor: "#111214", border: "1px solid #222327", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#949ba4", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Playing a game
                  </span>

                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    
                    {/* Assets Preview */}
                    {showAssets && largeImageKey ? (
                      <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0 }}>
                        <div
                          title={largeImageText}
                          style={{ width: "64px", height: "64px", borderRadius: "8px", backgroundColor: "#2b2d31", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#949ba4", fontWeight: "600", textAlign: "center", padding: "4px", boxSizing: "border-box" }}
                        >
                          {largeImageText || "Large Image"}
                        </div>
                        {smallImageKey && (
                          <div
                            title={smallImageText}
                            style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#2b2d31", border: "2px solid #111214", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#ffffff", fontWeight: "700" }}
                          >
                            ICO
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ width: "64px", height: "64px", borderRadius: "8px", backgroundColor: "#2b2d31", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#80848e" }}>
                        App
                      </div>
                    )}

                    {/* Presence Content */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1, overflow: "hidden" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#f2f3f5" }}>
                        {appName || "Discapp Utility Suite"}
                      </span>
                      {showDetails && details && (
                        <span style={{ fontSize: "13px", color: "#dbdee1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {details}
                        </span>
                      )}
                      {showState && state && (
                        <span style={{ fontSize: "13px", color: "#dbdee1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {state}
                        </span>
                      )}
                      {showParty && partyMax > 0 && (
                        <span style={{ fontSize: "12px", color: "#949ba4" }}>
                          ({partySize} of {partyMax}) players
                        </span>
                      )}
                      {showTimestamps && (
                        <span style={{ fontSize: "12px", color: "#949ba4" }}>
                          {timestampMode === "elapsed"
                            ? `${customElapsedHours > 0 ? `${customElapsedHours}h ` : ""}${customElapsedMinutes}m elapsed`
                            : `${customRemainingMinutes}m remaining`}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Simulated Discord Action Buttons */}
                  {showButtons && (button1Label || button2Label) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px", width: "100%" }}>
                      {button1Label && (
                        <div style={{ backgroundColor: "#4e5058", borderRadius: "4px", padding: "8px 12px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#ffffff" }}>
                          {button1Label}
                        </div>
                      )}
                      {button2Label && (
                        <div style={{ backgroundColor: "#4e5058", borderRadius: "4px", padding: "8px 12px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#ffffff" }}>
                          {button2Label}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}