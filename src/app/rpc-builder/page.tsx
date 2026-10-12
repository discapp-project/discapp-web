import type { Metadata } from "next";
import RpcBuilder from "./rpc-builder";

export const metadata: Metadata = {
  title: "RPC Builder | Discapp",
  description: "Build custom rich presence displays for your account.",
};

export default function RpcBuilderPage() {
  return <RpcBuilder />;
}
