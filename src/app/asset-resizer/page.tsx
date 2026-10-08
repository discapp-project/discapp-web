import type { Metadata } from "next";
import AssetResizer from "./asset-resizer";

export const metadata: Metadata = {
  title: "Asset Resizer | Botless",
  description: "Resize assets for a server or profile.",
};

export default function AssetResizerPage() {
  return <AssetResizer />;
}
