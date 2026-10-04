"use client";

import React, { useState, useRef } from "react";
import { 
  Crown, Shield, Sword, Star, Gem, Flame, Heart, Zap, Award, Target,
  Sparkles, Bot, Terminal, Code, Cpu, ShieldAlert, Skull, Ghost,
  Download, Search, Layers, Palette, Type, Sliders, Moon, Sun, Anchor,
  Axe, BadgeAlert, BadgeCheck, Bell, Bookmark, Box, Briefcase, Bug,
  Building, Cable, Calculator, Camera, Castle, CircleDot, Compass,
  Coins, Dices, Eye, Feather, Fingerprint, Flag, Flashlight, Folder,
  Gamepad2, Gift, Globe, GraduationCap, Hammer, Headphones, HelpCircle,
  Hourglass, Key, Laptop, Lightbulb, Lock, Magnet, Map, MapPin,
  Megaphone, Mic, Music, Newspaper, Package, Paperclip, Pin, Plane,
  Radio, Rocket, Scissors, Server, ShieldCheck, Shirt, ShoppingBag,
  Smile, Speaker, Trophy, Tv, Wand2, Wrench, RotateCcw, Image as ImageIcon,
  Droplet, EyeOff, Sparkle, Grid, Plus, Minus, Move, Activity, AlertCircle,
  AlertTriangle, Aperture, Archive, AtSign, Battery, BatteryCharging,
  Bluetooth, Book, BookOpen, Calendar, Check, CheckCircle, CheckSquare,
  ChevronDown, ChevronRight, ChevronLeft, Circle, Clipboard,
  Clock, Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow,
  Command, Copy, CreditCard, Crop, Crosshair, Disc, DollarSign, Edit,
  Edit2, Edit3, ExternalLink, File, FileText, Film, Filter,
  Frown, GitBranch, GitCommit, GitMerge, GitPullRequest,
  HardDrive, Hash, Home, Inbox, Info, Layout, LifeBuoy, Link, List, Mail, Maximize, Maximize2, MessageCircle, MessageSquare,
  Minimize, Minimize2, Monitor, MoreHorizontal, MoreVertical, MousePointer,
  Navigation, Octagon, Pause, Percent, Phone, PieChart, Play, PlusCircle,
  Power, Printer, RefreshCw, Repeat, RotateCw, Rss, Save, Send, Settings,
  Share, Share2, ShoppingCart, Shuffle, Sidebar, Slash, Smartphone, Square,
  Sunrise, Sunset, Tablet, Tag, Thermometer, ThumbsDown, ThumbsUp, ToggleLeft,
  ToggleRight, Trash, Trash2, TrendingDown, TrendingUp, Triangle,
  Truck, Umbrella, Unlock, User, UserCheck, UserMinus,
  UserPlus, UserX, Users, Video, Voicemail, Volume, Volume1, Volume2,
  VolumeX, Watch, Wifi, Wind, ZoomIn, ZoomOut
} from "lucide-react";

const ALL_ICONS = [
  { id: "gamepad", icon: Gamepad2, label: "Gamepad" },
  { id: "sword", icon: Sword, label: "Sword" },
  { id: "axe", icon: Axe, label: "Axe" },
  { id: "shield", icon: Shield, label: "Shield" },
  { id: "crown", icon: Crown, label: "Crown" },
  { id: "trophy", icon: Trophy, label: "Trophy" },
  { id: "target", icon: Target, label: "Target" },
  { id: "dices", icon: Dices, label: "Dices" },
  { id: "skull", icon: Skull, label: "Skull" },
  { id: "ghost", icon: Ghost, label: "Ghost" },
  { id: "wand", icon: Wand2, label: "Wand" },
  { id: "castle", icon: Castle, label: "Castle" },
  { id: "crosshair", icon: Crosshair, label: "Crosshair" },
  { id: "flame", icon: Flame, label: "Flame" },
  { id: "zap", icon: Zap, label: "Zap" },
  { id: "bot", icon: Bot, label: "Bot" },
  { id: "terminal", icon: Terminal, label: "Terminal" },
  { id: "code", icon: Code, label: "Code" },
  { id: "cpu", icon: Cpu, label: "CPU" },
  { id: "server", icon: Server, label: "Server" },
  { id: "laptop", icon: Laptop, label: "Laptop" },
  { id: "bug", icon: Bug, label: "Bug" },
  { id: "cable", icon: Cable, label: "Cable" },
  { id: "radio", icon: Radio, label: "Radio" },
  { id: "tv", icon: Tv, label: "TV" },
  { id: "command", icon: Command, label: "Command" },
  { id: "hard-drive", icon: HardDrive, label: "Hard Drive" },
  { id: "wifi", icon: Wifi, label: "WiFi" },
  { id: "bluetooth", icon: Bluetooth, label: "Bluetooth" },
  { id: "monitor", icon: Monitor, label: "Monitor" },
  { id: "smartphone", icon: Smartphone, label: "Smartphone" },
  { id: "star", icon: Star, label: "Star" },
  { id: "gem", icon: Gem, label: "Gem" },
  { id: "heart", icon: Heart, label: "Heart" },
  { id: "award", icon: Award, label: "Award" },
  { id: "sparkles", icon: Sparkles, label: "Sparkles" },
  { id: "bell", icon: Bell, label: "Bell" },
  { id: "bookmark", icon: Bookmark, label: "Bookmark" },
  { id: "coins", icon: Coins, label: "Coins" },
  { id: "gift", icon: Gift, label: "Gift" },
  { id: "key", icon: Key, label: "Key" },
  { id: "lock", icon: Lock, label: "Lock" },
  { id: "rocket", icon: Rocket, label: "Rocket" },
  { id: "anchor", icon: Anchor, label: "Anchor" },
  { id: "compass", icon: Compass, label: "Compass" },
  { id: "globe", icon: Globe, label: "Globe" },
  { id: "lightbulb", icon: Lightbulb, label: "Lightbulb" },
  { id: "home", icon: Home, label: "Home" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "camera", icon: Camera, label: "Camera" },
  { id: "clock", icon: Clock, label: "Clock" },
  { id: "cloud", icon: Cloud, label: "Cloud" },
  { id: "credit-card", icon: CreditCard, label: "Credit Card" },
  { id: "file", icon: File, label: "File" },
  { id: "folder", icon: Folder, label: "Folder" },
  { id: "mail", icon: Mail, label: "Mail" },
  { id: "map", icon: Map, label: "Map" },
  { id: "music", icon: Music, label: "Music" },
  { id: "phone", icon: Phone, label: "Phone" },
  { id: "shopping-cart", icon: ShoppingCart, label: "Cart" },
  { id: "sun", icon: Sun, label: "Sun" },
  { id: "moon", icon: Moon, label: "Moon" },
  { id: "user", icon: User, label: "User" },
  { id: "users", icon: Users, label: "Users" },
  { id: "video", icon: Video, label: "Video" },
  { id: "shield-alert", icon: ShieldAlert, label: "Alert Shield" },
  { id: "shield-check", icon: ShieldCheck, label: "Check Shield" },
  { id: "badge-check", icon: BadgeCheck, label: "Verified" },
  { id: "badge-alert", icon: BadgeAlert, label: "Warning" },
  { id: "eye", icon: Eye, label: "Eye" },
  { id: "flag", icon: Flag, label: "Flag" },
  { id: "fingerprint", icon: Fingerprint, label: "Fingerprint" },
  { id: "check", icon: Check, label: "Check" },
  { id: "check-circle", icon: CheckCircle, label: "Check Circle" },
  { id: "alert-circle", icon: AlertCircle, label: "Alert Circle" },
  { id: "alert-triangle", icon: AlertTriangle, label: "Alert Triangle" },
  { id: "info", icon: Info, label: "Info" },
  { id: "help-circle", icon: HelpCircle, label: "Help" },
  { id: "power", icon: Power, label: "Power" },
  { id: "activity", icon: Activity, label: "Activity" },
  { id: "aperture", icon: Aperture, label: "Aperture" },
  { id: "archive", icon: Archive, label: "Archive" },
  { id: "at-sign", icon: AtSign, label: "At Sign" },
  { id: "battery", icon: Battery, label: "Battery" },
  { id: "battery-charging", icon: BatteryCharging, label: "Battery Charging" },
  { id: "book", icon: Book, label: "Book" },
  { id: "book-open", icon: BookOpen, label: "Book Open" },
  { id: "box", icon: Box, label: "Box" },
  { id: "briefcase", icon: Briefcase, label: "Briefcase" },
  { id: "building", icon: Building, label: "Building" },
  { id: "calculator", icon: Calculator, label: "Calculator" },
  { id: "circle-dot", icon: CircleDot, label: "Circle Dot" },
  { id: "clipboard", icon: Clipboard, label: "Clipboard" },
  { id: "cloud-drizzle", icon: CloudDrizzle, label: "Cloud Drizzle" },
  { id: "cloud-lightning", icon: CloudLightning, label: "Cloud Lightning" },
  { id: "cloud-rain", icon: CloudRain, label: "Cloud Rain" },
  { id: "cloud-snow", icon: CloudSnow, label: "Cloud Snow" },
  { id: "copy", icon: Copy, label: "Copy" },
  { id: "crop", icon: Crop, label: "Crop" },
  { id: "disc", icon: Disc, label: "Disc" },
  { id: "dollar-sign", icon: DollarSign, label: "Dollar Sign" },
  { id: "edit", icon: Edit, label: "Edit" },
  { id: "external-link", icon: ExternalLink, label: "External Link" },
  { id: "feather", icon: Feather, label: "Feather" },
  { id: "film", icon: Film, label: "Film" },
  { id: "filter", icon: Filter, label: "Filter" },
  { id: "flashlight", icon: Flashlight, label: "Flashlight" },
  { id: "graduation-cap", icon: GraduationCap, label: "Graduation Cap" },
  { id: "hammer", icon: Hammer, label: "Hammer" },
  { id: "headphones", icon: Headphones, label: "Headphones" },
  { id: "hourglass", icon: Hourglass, label: "Hourglass" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "layout", icon: Layout, label: "Layout" },
  { id: "life-buoy", icon: LifeBuoy, label: "Life Buoy" },
  { id: "link", icon: Link, label: "Link" },
  { id: "magnet", icon: Magnet, label: "Magnet" },
  { id: "map-pin", icon: MapPin, label: "Map Pin" },
  { id: "megaphone", icon: Megaphone, label: "Megaphone" },
  { id: "mic", icon: Mic, label: "Mic" },
  { id: "newspaper", icon: Newspaper, label: "Newspaper" },
  { id: "package", icon: Package, label: "Package" },
  { id: "paperclip", icon: Paperclip, label: "Paperclip" },
  { id: "pin", icon: Pin, label: "Pin" },
  { id: "plane", icon: Plane, label: "Plane" },
  { id: "printer", icon: Printer, label: "Printer" },
  { id: "rss", icon: Rss, label: "Rss" },
  { id: "save", icon: Save, label: "Save" },
  { id: "scissors", icon: Scissors, label: "Scissors" },
  { id: "send", icon: Send, label: "Send" },
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "share", icon: Share, label: "Share" },
  { id: "shirt", icon: Shirt, label: "Shirt" },
  { id: "shopping-bag", icon: ShoppingBag, label: "Shopping Bag" },
  { id: "smile", icon: Smile, label: "Smile" },
  { id: "speaker", icon: Speaker, label: "Speaker" },
  { id: "tag", icon: Tag, label: "Tag" },
  { id: "thermometer", icon: Thermometer, label: "Thermometer" },
  { id: "thumbs-up", icon: ThumbsUp, label: "Thumbs Up" },
  { id: "trash", icon: Trash, label: "Trash" },
  { id: "truck", icon: Truck, label: "Truck" },
  { id: "umbrella", icon: Umbrella, label: "Umbrella" },
  { id: "watch", icon: Watch, label: "Watch" },
  { id: "wind", icon: Wind, label: "Wind" },
  { id: "wrench", icon: Wrench, label: "Wrench" }
];

const ITEMS_PER_PAGE = 30;

const SHAPES = [
  { id: "circle", label: "Circle", rx: "50%" },
  { id: "badge", label: "Scallop Badge", path: "M 50 0 C 60 10, 70 0, 80 10 C 90 20, 100 30, 90 40 C 100 50, 100 60, 90 70 C 100 80, 90 90, 80 90 C 70 100, 60 90, 50 100 C 40 90, 30 100, 20 90 C 10 90, 0 80, 10 70 C 0 60, 0 50, 10 40 C 0 30, 10 20, 20 10 C 30 0, 40 10, 50 0 Z" },
  { id: "shield", label: "Shield Base", path: "M 50 0 L 100 15 V 50 C 100 80, 50 100, 50 100 C 50 100, 0 80, 0 50 V 15 Z" },
  { id: "hexagon", label: "Hexagon", path: "M 50 0 L 93 25 V 75 L 50 100 L 7 75 V 25 Z" },
  { id: "octagon", label: "Octagon", path: "M 30 0 L 70 0 L 100 30 L 100 70 L 70 100 L 30 100 L 0 70 L 0 30 Z" },
  { id: "diamond", label: "Diamond", path: "M 50 0 L 100 50 L 50 100 L 0 50 Z" },
  { id: "star-shape", label: "Star Base", path: "M 50 0 L 63 35 L 100 38 L 72 63 L 80 100 L 50 80 L 20 100 L 28 63 L 0 38 L 37 35 Z" },
  { id: "triangle", label: "Triangle", path: "M 50 0 L 100 100 L 0 100 Z" },
  { id: "pentagon", label: "Pentagon", path: "M 50 0 L 100 38 L 81 100 L 19 100 L 0 38 Z" },
  { id: "cloud-shape", label: "Cloud Frame", path: "M 25 80 C 10 80, 0 70, 0 55 C 0 43, 8 33, 20 31 C 25 13, 40 0, 60 0 C 78 0, 92 12, 97 28 C 100 28, 100 29, 100 30 C 100 45, 90 80, 75 80 Z" },
  { id: "heart-shape", label: "Heart Base", path: "M 50 90 C 50 90, 0 55, 0 30 C 0 12, 15 0, 30 0 C 40 0, 47 6, 50 12 C 53 6, 60 0, 70 0 C 85 0, 100 12, 100 30 C 100 55, 50 90, 50 90 Z" },
  { id: "rounded-square", label: "Soft Square", rx: "24" },
  { id: "square", label: "Sharp Square", rx: "0" },
];

export default function RoleIconBuilder() {
  const [activeTab, setActiveTab] = useState<"icon" | "shape" | "style" | "effects">("icon");
  const [search, setSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("crown");
  const [customText, setCustomText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Customization - Shape
  const [selectedShape, setSelectedShape] = useState("badge");
  const [shapeScale, setShapeScale] = useState(100);
  const [shapeRotation, setShapeRotation] = useState(0);
  const [shapeCornerRadius, setShapeCornerRadius] = useState(24);

  // Customization - Style
  const [bgColor, setBgColor] = useState("#5865F2");
  const [useGradientBg, setUseGradientBg] = useState(false);
  const [bgGradientEnd, setBgGradientEnd] = useState("#eb459e");
  const [bgGradientAngle, setBgGradientAngle] = useState(135);
  
  const [iconColor, setIconColor] = useState("#FFFFFF");
  const [useGradientIcon, setUseGradientIcon] = useState(false);
  const [iconGradientEnd, setIconGradientEnd] = useState("#57f287");
  const [iconGradientAngle, setIconGradientAngle] = useState(45);
  
  const [iconSize, setIconSize] = useState(60);
  const [iconStrokeWidth, setIconStrokeWidth] = useState(2.2);
  const [iconOpacity, setIconOpacity] = useState(100);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [fontWeight, setFontWeight] = useState("bold");

  // Customization - Effects
  const [iconOffsetX, setIconOffsetX] = useState(0);
  const [iconOffsetY, setIconOffsetY] = useState(0);
  const [iconRotation, setIconRotation] = useState(0);
  
  const [enableBorder, setEnableBorder] = useState(false);
  const [borderColor, setBorderColor] = useState("#FFFFFF");
  const [borderWidth, setBorderWidth] = useState(4);
  const [borderStyle, setBorderStyle] = useState("solid");
  
  const [enableGlow, setEnableGlow] = useState(false);
  const [glowColor, setGlowColor] = useState("#5865F2");
  const [glowBlur, setGlowBlur] = useState(8);

  const [enableShadow, setEnableShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(4);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const filteredIcons = ALL_ICONS.filter((item) => 
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIcons.length / ITEMS_PER_PAGE) || 1;
  const currentIcons = filteredIcons.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const SelectedIconComponent = ALL_ICONS.find((i) => i.id === selectedIcon)?.icon || Crown;
  const currentShapeObj = SHAPES.find((s) => s.id === selectedShape);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setCustomText("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const context = canvas.getContext("2d");
      if (context) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, 128, 128);
        const png = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = png;
        downloadLink.download = `role-icon-${selectedIcon}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  const getFilterStyle = () => {
    const filters = [];
    if (enableGlow) filters.push(`drop-shadow(0 0 ${glowBlur}px ${glowColor})`);
    if (enableShadow) filters.push(`drop-shadow(${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor})`);
    return filters.length > 0 ? filters.join(" ") : "none";
  };

  const getDashArray = () => {
    if (borderStyle === "dashed") return "6,6";
    if (borderStyle === "dotted") return "2,4";
    return "none";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111214", color: "#dbdee1", padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "72rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ffffff", letterSpacing: "0.025em" }}>Role Icon Builder</h1>
          <p style={{ fontSize: "0.875rem", color: "#949ba4", marginTop: "0.25rem" }}>
            Design custom Discord role icons with full vector gradient support, customizable shapes, and high-resolution PNG export.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: "1.5rem" }}>
          <div style={{ gridColumn: "span 7 / span 7", backgroundColor: "#1e2024", border: "1px solid #2b2d31", borderRadius: "0.5rem", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #2b2d31", backgroundColor: "#111214" }}>
              {(["icon", "shape", "style", "effects"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    textTransform: "capitalize",
                    borderBottom: activeTab === tab ? "2px solid #57f287" : "2px solid transparent",
                    color: activeTab === tab ? "#ffffff" : "#949ba4",
                    backgroundColor: activeTab === tab ? "#1e2024" : "transparent",
                    cursor: "pointer"
                  }}
                >
                  {tab === "icon" && <Search size={16} />}
                  {tab === "shape" && <Layers size={16} />}
                  {tab === "style" && <Palette size={16} />}
                  {tab === "effects" && <Sparkles size={16} />}
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {activeTab === "icon" && (
                <>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "0.625rem", color: "#949ba4" }} />
                      <input
                        type="text"
                        placeholder="Search all icons..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "100%",
                          backgroundColor: "#111214",
                          border: "1px solid #2b2d31",
                          borderRadius: "0.375rem",
                          paddingLeft: "2.25rem",
                          paddingRight: "0.75rem",
                          paddingTop: "0.375rem",
                          paddingBottom: "0.375rem",
                          fontSize: "0.875rem",
                          color: "#ffffff",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.375rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <Type size={14} /> Custom Text
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="e.g. VIP"
                        value={customText}
                        onChange={(e) => {
                          setCustomText(e.target.value);
                          setUploadedImage(null);
                        }}
                        style={{
                          width: "100%",
                          backgroundColor: "#111214",
                          border: "1px solid #2b2d31",
                          borderRadius: "0.375rem",
                          padding: "0.375rem 0.75rem",
                          fontSize: "0.875rem",
                          color: "#ffffff",
                          outline: "none"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.375rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <ImageIcon size={14} /> Upload Custom Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{
                          width: "100%",
                          backgroundColor: "#111214",
                          border: "1px solid #2b2d31",
                          borderRadius: "0.375rem",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          color: "#ffffff"
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Icons ({filteredIcons.length})
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#949ba4" }}>
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          style={{
                            backgroundColor: "#2b2d31",
                            border: "none",
                            color: "#ffffff",
                            padding: "0.25rem",
                            borderRadius: "0.25rem",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1
                          }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          style={{
                            backgroundColor: "#2b2d31",
                            border: "none",
                            color: "#ffffff",
                            padding: "0.25rem",
                            borderRadius: "0.25rem",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            opacity: currentPage === totalPages ? 0.5 : 1
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "0.5rem", minHeight: "14rem" }}>
                      {currentIcons.map((item) => {
                        const IconComponent = item.icon;
                        const isSelected = selectedIcon === item.id && !customText && !uploadedImage;
                        return (
                          <button
                            key={item.id}
                            title={item.label}
                            onClick={() => {
                              setSelectedIcon(item.id);
                              setCustomText("");
                              setUploadedImage(null);
                            }}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0.75rem",
                              borderRadius: "0.375rem",
                              border: isSelected ? "1px solid #5865F2" : "1px solid transparent",
                              backgroundColor: isSelected ? "rgba(88, 101, 242, 0.2)" : "#111214",
                              color: isSelected ? "#ffffff" : "#b5bac1",
                              cursor: "pointer"
                            }}
                          >
                            <IconComponent size={22} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "shape" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                      Frame Base Shape
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
                      {SHAPES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedShape(s.id)}
                          style={{
                            padding: "0.75rem",
                            borderRadius: "0.375rem",
                            border: selectedShape === s.id ? "1px solid #57f287" : "1px solid #2b2d31",
                            backgroundColor: selectedShape === s.id ? "rgba(87, 242, 135, 0.1)" : "#111214",
                            color: selectedShape === s.id ? "#ffffff" : "#b5bac1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer"
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                        Shape Scale ({shapeScale}%)
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={shapeScale}
                        onChange={(e) => setShapeScale(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#57f287" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                        Shape Rotation ({shapeRotation}°)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={shapeRotation}
                        onChange={(e) => setShapeRotation(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#57f287" }}
                      />
                    </div>
                  </div>

                  {currentShapeObj?.id === "rounded-square" && (
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                        Corner Roundness ({shapeCornerRadius}px)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={shapeCornerRadius}
                        onChange={(e) => setShapeCornerRadius(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#57f287" }}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "style" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Background Fill
                        </label>
                        <button 
                          onClick={() => setUseGradientBg(!useGradientBg)} 
                          style={{ fontSize: "0.65rem", color: "#57f287", background: "none", border: "none", cursor: "pointer" }}
                        >
                          {useGradientBg ? "Use Solid Color" : "Enable Gradient"}
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          style={{ width: "2.25rem", height: "2.25rem", backgroundColor: "transparent", borderRadius: "0.25rem", cursor: "pointer", border: "none" }}
                        />
                        {useGradientBg && (
                          <input
                            type="color"
                            value={bgGradientEnd}
                            onChange={(e) => setBgGradientEnd(e.target.value)}
                            style={{ width: "2.25rem", height: "2.25rem", backgroundColor: "transparent", borderRadius: "0.25rem", cursor: "pointer", border: "none" }}
                          />
                        )}
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          style={{ width: "100%", backgroundColor: "#111214", border: "1px solid #2b2d31", borderRadius: "0.25rem", padding: "0.375rem 0.75rem", fontSize: "0.875rem", color: "#ffffff" }}
                        />
                      </div>
                      {useGradientBg && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <label style={{ fontSize: "0.65rem", color: "#b5bac1" }}>Gradient Angle ({bgGradientAngle}°)</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={bgGradientAngle}
                            onChange={(e) => setBgGradientAngle(Number(e.target.value))}
                            style={{ width: "100%", accentColor: "#57f287" }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Icon / Text Color
                        </label>
                        <button 
                          onClick={() => setUseGradientIcon(!useGradientIcon)} 
                          style={{ fontSize: "0.65rem", color: "#57f287", background: "none", border: "none", cursor: "pointer" }}
                        >
                          {useGradientIcon ? "Use Solid Color" : "Enable Gradient"}
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                          type="color"
                          value={iconColor}
                          onChange={(e) => setIconColor(e.target.value)}
                          style={{ width: "2.25rem", height: "2.25rem", backgroundColor: "transparent", borderRadius: "0.25rem", cursor: "pointer", border: "none" }}
                        />
                        {useGradientIcon && (
                          <input
                            type="color"
                            value={iconGradientEnd}
                            onChange={(e) => setIconGradientEnd(e.target.value)}
                            style={{ width: "2.25rem", height: "2.25rem", backgroundColor: "transparent", borderRadius: "0.25rem", cursor: "pointer", border: "none" }}
                          />
                        )}
                        <input
                          type="text"
                          value={iconColor}
                          onChange={(e) => setIconColor(e.target.value)}
                          style={{ width: "100%", backgroundColor: "#111214", border: "1px solid #2b2d31", borderRadius: "0.25rem", padding: "0.375rem 0.75rem", fontSize: "0.875rem", color: "#ffffff" }}
                        />
                      </div>
                      {useGradientIcon && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <label style={{ fontSize: "0.65rem", color: "#b5bac1" }}>Gradient Angle ({iconGradientAngle}°)</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={iconGradientAngle}
                            onChange={(e) => setIconGradientAngle(Number(e.target.value))}
                            style={{ width: "100%", accentColor: "#57f287" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                        Icon Scale ({iconSize}%)
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="90"
                        value={iconSize}
                        onChange={(e) => setIconSize(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#57f287" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                        Stroke Width ({iconStrokeWidth})
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="4"
                        step="0.1"
                        value={iconStrokeWidth}
                        onChange={(e) => setIconStrokeWidth(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#57f287" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                        Opacity ({iconOpacity}%)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={iconOpacity}
                        onChange={(e) => setIconOpacity(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#57f287" }}
                      />
                    </div>
                  </div>

                  {customText && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                          Font Family
                        </label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          style={{ width: "100%", backgroundColor: "#111214", border: "1px solid #2b2d31", borderRadius: "0.25rem", padding: "0.375rem", color: "#ffffff" }}
                        >
                          <option value="sans-serif">Sans-Serif</option>
                          <option value="serif">Serif</option>
                          <option value="monospace">Monospace</option>
                          <option value="cursive">Cursive</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                          Font Weight
                        </label>
                        <select
                          value={fontWeight}
                          onChange={(e) => setFontWeight(e.target.value)}
                          style={{ width: "100%", backgroundColor: "#111214", border: "1px solid #2b2d31", borderRadius: "0.25rem", padding: "0.375rem", color: "#ffffff" }}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="900">Black</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "effects" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                        Offset X ({iconOffsetX}px)
                      </label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={iconOffsetX}
                        onChange={(e) => setIconOffsetX(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#57f287" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                        Offset Y ({iconOffsetY}px)
                      </label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={iconOffsetY}
                        onChange={(e) => setIconOffsetY(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#57f287" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", display: "block" }}>
                        Rotation ({iconRotation}°)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={iconRotation}
                        onChange={(e) => setIconRotation(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#57f287" }}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #2b2d31", paddingTop: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <input
                        type="checkbox"
                        id="border"
                        checked={enableBorder}
                        onChange={(e) => setEnableBorder(e.target.checked)}
                      />
                      <label htmlFor="border" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase" }}>
                        Outer Border
                      </label>
                    </div>
                    {enableBorder && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem", alignItems: "center" }}>
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          style={{ width: "2rem", height: "2rem", backgroundColor: "transparent", border: "none", cursor: "pointer" }}
                        />
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={borderWidth}
                          onChange={(e) => setBorderWidth(Number(e.target.value))}
                          style={{ accentColor: "#57f287" }}
                        />
                        <select
                          value={borderStyle}
                          onChange={(e) => setBorderStyle(e.target.value)}
                          style={{ backgroundColor: "#111214", border: "1px solid #2b2d31", borderRadius: "0.25rem", color: "#ffffff", padding: "0.25rem" }}
                        >
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: "1px solid #2b2d31", paddingTop: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <input
                        type="checkbox"
                        id="glow"
                        checked={enableGlow}
                        onChange={(e) => setEnableGlow(e.target.checked)}
                      />
                      <label htmlFor="glow" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase" }}>
                        Glow Effect
                      </label>
                    </div>
                    {enableGlow && (
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <input
                          type="color"
                          value={glowColor}
                          onChange={(e) => setGlowColor(e.target.value)}
                          style={{ width: "2rem", height: "2rem", backgroundColor: "transparent", border: "none", cursor: "pointer" }}
                        />
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: "0.65rem", color: "#b5bac1" }}>Blur ({glowBlur}px)</label>
                          <input
                            type="range"
                            min="2"
                            max="20"
                            value={glowBlur}
                            onChange={(e) => setGlowBlur(Number(e.target.value))}
                            style={{ width: "100%", accentColor: "#57f287" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: "1px solid #2b2d31", paddingTop: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <input
                        type="checkbox"
                        id="shadow"
                        checked={enableShadow}
                        onChange={(e) => setEnableShadow(e.target.checked)}
                      />
                      <label htmlFor="shadow" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b5bac1", textTransform: "uppercase" }}>
                        Drop Shadow
                      </label>
                    </div>
                    {enableShadow && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.5rem", alignItems: "center" }}>
                        <input
                          type="color"
                          value={shadowColor}
                          onChange={(e) => setShadowColor(e.target.value)}
                          style={{ width: "2rem", height: "2rem", backgroundColor: "transparent", border: "none", cursor: "pointer" }}
                        />
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#b5bac1" }}>X ({shadowOffsetX}px)</label>
                          <input
                            type="range"
                            min="-10"
                            max="10"
                            value={shadowOffsetX}
                            onChange={(e) => setShadowOffsetX(Number(e.target.value))}
                            style={{ width: "100%", accentColor: "#57f287" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#b5bac1" }}>Y ({shadowOffsetY}px)</label>
                          <input
                            type="range"
                            min="-10"
                            max="10"
                            value={shadowOffsetY}
                            onChange={(e) => setShadowOffsetY(Number(e.target.value))}
                            style={{ width: "100%", accentColor: "#57f287" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#b5bac1" }}>Blur ({shadowBlur}px)</label>
                          <input
                            type="range"
                            min="0"
                            max="15"
                            value={shadowBlur}
                            onChange={(e) => setShadowBlur(Number(e.target.value))}
                            style={{ width: "100%", accentColor: "#57f287" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ gridColumn: "span 5 / span 5", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ backgroundColor: "#1e2024", border: "1px solid #2b2d31", borderRadius: "0.5rem", padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", minHeight: "220px" }}>
              <div 
                style={{
                  width: "9rem",
                  height: "9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.5rem",
                  padding: "0.5rem",
                  backgroundImage: "radial-gradient(#2b2d31 1px, transparent 0)",
                  backgroundSize: "12px 12px"
                }}
              >
                <svg
                  ref={svgRef}
                  viewBox="0 0 100 100"
                  style={{ 
                    width: "7rem", 
                    height: "7rem", 
                    filter: getFilterStyle()
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient 
                      id="bgGrad" 
                      x1={`${Math.cos((bgGradientAngle * Math.PI) / 180) < 0 ? 100 : 0}%`}
                      y1={`${Math.sin((bgGradientAngle * Math.PI) / 180) < 0 ? 100 : 0}%`}
                      x2={`${Math.cos((bgGradientAngle * Math.PI) / 180) >= 0 ? 100 : 0}%`}
                      y2={`${Math.sin((bgGradientAngle * Math.PI) / 180) >= 0 ? 100 : 0}%`}
                    >
                      <stop offset="0%" stopColor={bgColor} />
                      <stop offset="100%" stopColor={bgGradientEnd} />
                    </linearGradient>

                    <linearGradient 
                      id="iconGrad" 
                      x1={`${Math.cos((iconGradientAngle * Math.PI) / 180) < 0 ? 100 : 0}%`}
                      y1={`${Math.sin((iconGradientAngle * Math.PI) / 180) < 0 ? 100 : 0}%`}
                      x2={`${Math.cos((iconGradientAngle * Math.PI) / 180) >= 0 ? 100 : 0}%`}
                      y2={`${Math.sin((iconGradientAngle * Math.PI) / 180) >= 0 ? 100 : 0}%`}
                    >
                      <stop offset="0%" stopColor={iconColor} />
                      <stop offset="100%" stopColor={iconGradientEnd} />
                    </linearGradient>
                  </defs>

                  <g transform={`translate(50, 50) scale(${shapeScale / 100}) rotate(${shapeRotation}) translate(-50, -50)`}>
                    {currentShapeObj?.path ? (
                      <path 
                        d={currentShapeObj.path} 
                        fill={useGradientBg ? "url(#bgGrad)" : bgColor}
                        stroke={enableBorder ? borderColor : "none"}
                        strokeWidth={enableBorder ? borderWidth : 0}
                        strokeDasharray={getDashArray()}
                      />
                    ) : (
                      <rect
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        rx={currentShapeObj?.id === "rounded-square" ? shapeCornerRadius : currentShapeObj?.rx || "0"}
                        fill={useGradientBg ? "url(#bgGrad)" : bgColor}
                        stroke={enableBorder ? borderColor : "none"}
                        strokeWidth={enableBorder ? borderWidth : 0}
                        strokeDasharray={getDashArray()}
                      />
                    )}
                  </g>

                  <g 
                    transform={`translate(${iconOffsetX}, ${iconOffsetY}) rotate(${iconRotation} 50 50)`}
                    opacity={iconOpacity / 100}
                  >
                    {uploadedImage ? (
                      <image
                        href={uploadedImage}
                        x={50 - iconSize / 2}
                        y={50 - iconSize / 2}
                        width={iconSize}
                        height={iconSize}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    ) : customText ? (
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="central"
                        textAnchor="middle"
                        fill={useGradientIcon ? "url(#iconGrad)" : iconColor}
                        fontSize={Math.floor(iconSize * 0.5)}
                        fontWeight={fontWeight}
                        fontFamily={fontFamily}
                      >
                        {customText}
                      </text>
                    ) : (
                      <g transform={`translate(${50 - iconSize / 2}, ${50 - iconSize / 2})`}>
                        <SelectedIconComponent
                          size={iconSize}
                          color={useGradientIcon ? "url(#iconGrad)" : iconColor}
                          strokeWidth={iconStrokeWidth}
                        />
                      </g>
                    )}
                  </g>
                </svg>
              </div>
            </div>

            <div style={{ backgroundColor: "#1e2024", border: "1px solid #2b2d31", borderRadius: "0.5rem", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#949ba4", letterSpacing: "0.05em", display: "block" }}>
                Preview (kinda broken, srry)
              </span>

              <div style={{ backgroundColor: "#313338", borderRadius: "0.375rem", padding: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem", fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                <div style={{ width: "2rem", height: "2rem", borderRadius: "9999px", backgroundColor: "#5865f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "0.75rem", fontWeight: "bold", flexShrink: 0 }}>
                  S
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", lineHeight: 1 }}>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>Soul</span>
                    <svg viewBox="0 0 100 100" style={{ width: "1rem", height: "1rem", display: "inline-block" }}>
                      {currentShapeObj?.path ? (
                        <path d={currentShapeObj.path} fill={bgColor} />
                      ) : (
                        <rect x="0" y="0" width="100" height="100" rx={currentShapeObj?.id === "rounded-square" ? shapeCornerRadius : currentShapeObj?.rx || "0"} fill={bgColor} />
                      )}
                      {uploadedImage ? (
                        <image href={uploadedImage} x="20" y="20" width="60" height="60" />
                      ) : customText ? (
                        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill={iconColor} fontSize="40" fontWeight={fontWeight} fontFamily={fontFamily}>
                          {customText}
                        </text>
                      ) : (
                        <g transform={`translate(${50 - iconSize / 2}, ${50 - iconSize / 2})`}>
                          <SelectedIconComponent size={iconSize} color={iconColor} strokeWidth={iconStrokeWidth} />
                        </g>
                      )}
                    </svg>
                    <span style={{ fontSize: "10px", color: "#949ba4", fontWeight: 500, marginLeft: "0.25rem" }}>Today at 1:00 PM</span>
                  </div>
                  <p style={{ color: "#dbdee1", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    This new icon looks so cool!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadPNG}
              style={{
                width: "100%",
                backgroundColor: "#57f287",
                color: "#0e1015",
                fontWeight: "bold",
                paddingTop: "0.75rem",
                paddingBottom: "0.75rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                borderRadius: "0.375rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                border: "none",
                cursor: "pointer"
              }}
            >
              <Download size={18} /> Export PNG (128x128)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}