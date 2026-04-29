import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your themes on AnymeX Themes",
  openGraph: {
    title: "Dashboard — AnymeX Themes",
    description: "Manage your themes on AnymeX Themes",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
