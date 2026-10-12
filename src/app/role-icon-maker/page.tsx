import type { Metadata } from "next";
import RoleIconMaker from "./role-icon-maker";

export const metadata: Metadata = {
  title: "Role Icon Maker | Discapp",
  description: "Create custom role icons for your Discord server.",
};

export default function RoleIconMakerPage() {
  return <RoleIconMaker />;
}
