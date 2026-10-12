import type { Metadata } from "next";
import AutomodPermissionDecoder from "./automod-permission-decoder";

export const metadata: Metadata = {
  title: "Automod Permission Decoder | Discapp",
  description: "Decode automod permissions.",
};

export default function AutomodPermissionDecoderPage() {
  return <AutomodPermissionDecoder />;
}
