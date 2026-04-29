import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup",
  description: "Get started with AnymeX Themes — learn how to browse and apply themes",
  openGraph: {
    title: "Setup — AnymeX Themes",
    description: "Get started with AnymeX Themes — learn how to browse and apply themes",
  },
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
