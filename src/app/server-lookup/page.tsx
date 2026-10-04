import type { Metadata } from "next";
import ServerLookup from "./server-lookup";

export const metadata: Metadata = {
  title: "Server Lookup | Botless",
  description: "Get information about a Discord server by invite link.",
};

export default function ServerLookupPage() {
  return <ServerLookup />;
}
