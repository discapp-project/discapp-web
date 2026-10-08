import type { Metadata } from "next";
import SoundboardStudio from "./soundboard-studio";

export const metadata: Metadata = {
  title: "Soundboard Studio | Botless",
  description: "Setup and manage sounds for Discord.",
};

export default function SoundboardStudioPage() {
  return <SoundboardStudio />;
}
