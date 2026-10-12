import type { Metadata } from "next";
import SnowflakeDecoder from "./snowflake-decoder";

export const metadata: Metadata = {
  title: "Snowflake Decoder | Discapp",
  description: "Decode Discord snowflakes to get information about them.",
};

export default function SnowflakeDecoderPage() {
  return <SnowflakeDecoder />;
}
