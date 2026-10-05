import type { Metadata } from "next";
import AssetStealer from "./asset-stealer";

export const metadata: Metadata = {
  title: "Asset Stealer | Botless",
  description: "Steal assets from a Discord server.",
};

export default function AssetStealerPage() {
  return <AssetStealer />;
}
