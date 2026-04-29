import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AnymeX Themes account to create and manage themes",
  openGraph: {
    title: "Sign In — AnymeX Themes",
    description: "Sign in to your AnymeX Themes account to create and manage themes",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
