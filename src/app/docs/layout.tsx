import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to create, submit, and apply themes for AnymeX app",
  openGraph: {
    title: "Documentation — AnymeX Themes",
    description: "Learn how to create, submit, and apply themes for AnymeX app",
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
