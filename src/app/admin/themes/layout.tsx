import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theme Approvals",
  description: "Review and approve community themes on AnymeX Themes",
  openGraph: {
    title: "Theme Approvals — AnymeX Themes",
    description: "Review and approve community themes on AnymeX Themes",
  },
};

export default function AdminThemesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
