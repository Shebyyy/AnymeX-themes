"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ThemePreviewRenderer } from "@/components/theme-preview";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Creator {
  id: string;
  username: string;
  profileUrl: string | null;
}

interface Theme {
  id: string;
  themeId: string | null;
  name: string;
  description: string | null;
  creatorName: string;
  themeJson: string;
  category: string | null;
  previewData: string | null;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  isLiked?: boolean;
  creator?: Creator | null;
}

export default function ThemeDetailPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState<string>("");
  const { toast } = useToast();
  const router = useRouter();

  // Get user token
  useEffect(() => {
    let token = localStorage.getItem("anymex_token");
    if (!token) {
      token = `anymex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("anymex_token", token);
    }
    setUserToken(token);
  }, []);

  // Fetch theme
  useEffect(() => {
    const fetchTheme = async () => {
      const { themeId } = await params;
      try {
        const response = await fetch(`/api/themes/by-id/${themeId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/");
            toast({
              variant: "destructive",
              title: "Theme not found",
              description: "The theme you're looking for doesn't exist.",
            });
            return;
          }
          throw new Error("Failed to fetch theme");
        }
        const data = await response.json();
        setTheme(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load theme",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [params]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!theme) return;

    try {
      const response = await fetch(`/api/themes/${theme.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken }),
      });

      if (!response.ok) throw new Error("Failed to like theme");

      const data = await response.json();
      setTheme({
        ...theme,
        likesCount: data.likesCount,
        isLiked: data.isLiked,
      });

      toast({
        title: data.isLiked ? "Theme liked! ❤️" : "Like removed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like theme",
      });
    }
  };

  const applyTheme = () => {
    if (!theme) return;

    // Construct the JSON URL for the theme
    const jsonUrl = `${window.location.origin}/api/themes/${theme.id}/json`;

    // Create the deep link URL
    const deepLink = `anymex://theme?type=player&url=${encodeURIComponent(jsonUrl)}`;

    // Open the deep link
    window.location.href = deepLink;
  };

  const downloadJson = () => {
    if (!theme) return;

    const blob = new Blob([theme.themeJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, "-")}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareTheme = async () => {
    if (!theme) return;

    if (!theme.themeId) {
      toast({
        variant: "destructive",
        title: "Cannot share",
        description: "This theme does not have a shareable ID.",
      });
      return;
    }

    const shareUrl = `${window.location.origin}/themes/${theme.themeId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: theme.name,
          text: theme.description || `Check out this ${theme.name} theme!`,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share URL has been copied to your clipboard.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
          >
            <Icon icon="solar:alt-arrow-left-linear" width={16} />
            Back to Themes
          </Link>

          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!theme) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased">
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <Icon icon="solar:alt-arrow-left-linear" width={16} />
          Back to Themes
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-semibold text-white">
                {theme.name}
              </h1>
              {theme.category && (
                <Badge
                  variant="outline"
                  className="border-neutral-800 bg-neutral-900/50 text-neutral-400"
                >
                  {theme.category}
                </Badge>
              )}
            </div>
            <p className="text-neutral-400 flex items-center gap-2 text-sm">
              <span>by</span>
              {theme.creator?.profileUrl ? (
                <a
                  href={theme.creator.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white cursor-pointer hover:underline"
                >
                  {theme.creatorName}
                </a>
              ) : (
                <span className="text-neutral-300">{theme.creatorName}</span>
              )}
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-1">
                <Icon icon="solar:eye-linear" width={14} />
                {theme.viewsCount} views
              </span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-1">
                <Icon icon="solar:heart-linear" width={14} />
                {theme.likesCount} likes
              </span>
            </p>
          </div>

          <Button
            onClick={shareTheme}
            variant="outline"
            className="shrink-0 border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            <Icon icon="solar:share-linear" width={16} className="mr-2" />
            Share
          </Button>
        </div>

        {/* Description */}
        {theme.description && (
          <p className="text-neutral-400 mb-8 text-lg">{theme.description}</p>
        )}

        {/* Preview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Live Preview</h2>
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/20">
            <ThemePreviewRenderer
              themeJson={theme.themeJson}
              backgroundImage="/preview-bg.jpg"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={applyTheme}
            className="flex items-center gap-2 bg-neutral-100 text-black hover:bg-white"
          >
            <Icon icon="solar:magic-stick-3-linear" width={16} />
            Apply Theme
          </Button>
          <Button
            onClick={downloadJson}
            variant="outline"
            className="flex items-center gap-2 border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            <Icon icon="solar:file-download-linear" width={16} />
            Download JSON
          </Button>
          <Button
            onClick={handleLike}
            variant="outline"
            className={`flex items-center gap-2 border-neutral-800 bg-neutral-900/50 ${
              theme.isLiked ? "text-rose-500 border-rose-500/50" : "text-neutral-300 hover:text-rose-500"
            } hover:bg-neutral-800`}
          >
            <Icon
              icon={theme.isLiked ? "solar:heart-bold" : "solar:heart-linear"}
              width={16}
            />
            {theme.isLiked ? "Liked" : "Like"}
          </Button>
        </div>

        {/* Theme ID & Info */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Theme Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                Theme ID
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-neutral-300 bg-neutral-900/50 px-3 py-1.5 rounded-lg">
                  {theme.themeId || "Not available"}
                </code>
                {theme.themeId && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(theme.themeId!);
                      toast({
                        title: "ID copied!",
                        description: "Theme ID has been copied to your clipboard.",
                      });
                    }}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    <Icon icon="solar:copy-linear" width={16} />
                  </button>
                )}
              </div>
            </div>
            {theme.themeId && (
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                  Share URL
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-neutral-300 bg-neutral-900/50 px-3 py-1.5 rounded-lg flex-1 truncate">
                    {`${window.location.origin}/themes/${theme.themeId}`}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/themes/${theme.themeId}`
                      );
                      toast({
                        title: "URL copied!",
                        description: "Share URL has been copied to your clipboard.",
                      });
                    }}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
                  >
                    <Icon icon="solar:copy-linear" width={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
