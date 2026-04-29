import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage users and themes on AnymeX Themes",
  openGraph: {
    title: "Admin Dashboard — AnymeX Themes",
    description: "Manage users and themes on AnymeX Themes",
  },
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
