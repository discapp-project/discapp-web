import type { Metadata } from "next";
import Home from "./home";

export const metadata: Metadata = {
  title: "Discapp | All In One Toolkit",
  description:
    "Get access to every tool on Discord as well as libraries to help make your life much easier!",
};

export default function HomePage() {
  return <Home />;
}
