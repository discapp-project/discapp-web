import type { Metadata } from "next";
import UserLookup from "./user-lookup";

export const metadata: Metadata = {
  title: "Role Icon Maker | Botless",
  description: "Create custom role icons for your Discord server.",
};

export default function UserLookupPage() {
  return <UserLookup />;
}
