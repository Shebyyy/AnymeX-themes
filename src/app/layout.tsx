import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anymex-themes.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AnymeX Themes",
    template: "%s — AnymeX Themes",
  },
  description: "Browse and share themes for AnymeX app",
  keywords: ["AnymeX", "themes", "anime", "dark theme", "AMOLED", "custom themes", "theme store"],
  authors: [{ name: "AnymeX", url: "https://github.com/RyanYuuki/AnymeX" }],
  creator: "AnymeX",
  icons: {
    icon: "https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "AnymeX Themes",
    title: "AnymeX Themes",
    description: "Browse and share themes for AnymeX app",
    images: [
      {
        url: "https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png",
        width: 512,
        height: 512,
        alt: "AnymeX Themes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AnymeX Themes",
    description: "Browse and share themes for AnymeX app",
    images: [
      "https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0b14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
