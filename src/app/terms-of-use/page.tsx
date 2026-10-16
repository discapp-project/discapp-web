import type { Metadata } from "next";
import TermsOfUse from "./terms-of-use";

export const metadata: Metadata = {
  title: "Terms of Use | Discapp",
  description: "Our terms and guidelines for use of the service",
};

export default function TermsOfUsePage() {
  return <TermsOfUse />;
}