import type { Metadata } from "next";
import UserLookup from "./user-lookup";

export const metadata: Metadata = {
  title: "User Lookup | Discapp",
  description: "Get information about a Discord user by ID.",
};

export default function UserLookupPage() {
  return <UserLookup />;
}
