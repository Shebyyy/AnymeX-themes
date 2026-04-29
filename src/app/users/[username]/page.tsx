import type { Metadata } from "next";
import { supabase } from "@/lib/db";
import UserProfileClient from "./user-profile-client";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anymex-themes.vercel.app";

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params;

  try {
    const { data: user } = await supabase
      .from("User")
      .select("username, role")
      .eq("username", username)
      .single();

    if (!user) {
      return {
        title: "User Not Found",
        description: "The user profile you're looking for doesn't exist.",
      };
    }

    const { data: themes } = await supabase
      .from("Theme")
      .select("id")
      .eq("createdBy", (user as any).id);

    const themeCount = themes?.length || 0;

    const title = `${username}'s Themes — AnymeX`;
    const description = `View all themes by ${username}. ${themeCount} theme${themeCount !== 1 ? "s" : ""} created on AnymeX Themes.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        url: `${siteUrl}/users/${username}`,
        username,
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
        card: "summary",
        title,
        description,
        images: [
          "https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png",
        ],
      },
    };
  } catch {
    return {
      title: "User Profile — AnymeX Themes",
      description: "View user themes on AnymeX Themes",
    };
  }
}

export default async function UserProfilePage({ params }: UserPageProps) {
  return <UserProfileClient />;
}
