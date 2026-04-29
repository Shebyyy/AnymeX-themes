import type { Metadata } from "next";
import { supabase } from "@/lib/db";
import ThemeDetailClient from "./theme-detail-client";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anymex-themes.vercel.app";

interface ThemePageProps {
  params: Promise<{ themeId: string }>;
}

export async function generateMetadata({ params }: ThemePageProps): Promise<Metadata> {
  const { themeId } = await params;

  try {
    const { data: theme } = await supabase
      .from("Theme")
      .select("name, description, previewImage, category, creatorName")
      .eq("themeId", themeId)
      .single();

    if (!theme) {
      return {
        title: "Theme Not Found",
        description: "The theme you're looking for doesn't exist.",
      };
    }

    const title = `${theme.name} — AnymeX Theme`;
    const description =
      theme.description ||
      `${theme.category || "Custom"} theme by ${theme.creatorName} for AnymeX`;

    const ogImages = theme.previewImage
      ? [
          {
            url: theme.previewImage,
            width: 1200,
            height: 630,
            alt: theme.name,
          },
        ]
      : [
          {
            url: "https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png",
            width: 512,
            height: 512,
            alt: "AnymeX Themes",
          },
        ];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: `${siteUrl}/themes/${themeId}`,
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: theme.previewImage
          ? [theme.previewImage]
          : ["https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png"],
      },
    };
  } catch {
    return {
      title: "Theme — AnymeX Themes",
      description: "Browse and share themes for AnymeX app",
    };
  }
}

export default async function ThemeDetailPage({ params }: ThemePageProps) {
  return <ThemeDetailClient params={params} />;
}
