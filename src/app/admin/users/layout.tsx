import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users",
  description: "Manage user accounts on AnymeX Themes",
  openGraph: {
    title: "Manage Users — AnymeX Themes",
    description: "Manage user accounts on AnymeX Themes",
  },
};

export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
