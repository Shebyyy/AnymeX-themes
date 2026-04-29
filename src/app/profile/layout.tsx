import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your AnymeX Themes profile and settings",
  openGraph: {
    title: "My Profile — AnymeX Themes",
    description: "Manage your AnymeX Themes profile and settings",
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
