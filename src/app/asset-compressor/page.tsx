import type { Metadata } from "next";
import AssetCompressor from "./asset-compressor";

export const metadata: Metadata = {
  title: "Asset Compressor | Discapp",
  description: "Compress stickers and emojis.",
};

export default function AssetCompressorPage() {
  return <AssetCompressor />;
}
