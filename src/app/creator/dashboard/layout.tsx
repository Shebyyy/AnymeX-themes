import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Dashboard",
  description: "Create and manage your themes on AnymeX Themes",
  openGraph: {
    title: "Creator Dashboard — AnymeX Themes",
    description: "Create and manage your themes on AnymeX Themes",
  },
};

export default function CreatorDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
