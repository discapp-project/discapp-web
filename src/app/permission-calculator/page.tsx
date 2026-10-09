import type { Metadata } from "next";
import PermissionCalculator from "./permission-calculator";

export const metadata: Metadata = {
  title: "Permission Calculator | Botless",
  description: "Calculate and manage permissions for your bots / roles.",
};

export default function PermissionCalculatorPage() {
  return <PermissionCalculator />;
}
