import type { Metadata } from "next";
import TimestampGenerator from "./timestamp-generator";

export const metadata: Metadata = {
  title: "Timestamp Generator | Botless",
  description: "Generate UNIX timestamps for your messages!",
};

export default function TimestampGeneratorPage() {
  return <TimestampGenerator />;
}
