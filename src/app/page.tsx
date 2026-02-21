"use client";

import { ThemePreviewRenderer } from "@/components/theme-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ENABLE_THEME_PREVIEW = false;

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

interface Maintainer {
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
}

export default function Home() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [userToken, setUserToken] = useState<string>("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [user, setUser] = useState<{ username: string; role: string } | null>(null);
    const { toast } = useToast();

    // Get or create user token
    useEffect(() => {
        let token = localStorage.getItem("anymex_token");
        if (!token) {
            token = `anymex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("anymex_token", token);
        }
        setUserToken(token);

        // Also set cookie for server-side access
        document.cookie = `anymex_token=${token}; path=/; max-age=31536000; SameSite=Lax`;

        // Check if user is logged in
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const creatorToken = localStorage.getItem("creator_token");
        const adminToken = localStorage.getItem("admin_token");
        const userStr = localStorage.getItem("creator_user") || localStorage.getItem("admin_user");

        if ((creatorToken || adminToken) && userStr) {
            try {
                const token = creatorToken || adminToken;
                const response = await fetch("/api/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsLoggedIn(true);
                    setUser(data.user);
                    setUserRole(data.user.role);
                } else {
                    // Clear invalid tokens
                    localStorage.removeItem("creator_token");
                    localStorage.removeItem("admin_token");
                    localStorage.removeItem("creator_user");
                    localStorage.removeItem("admin_user");
                }
            } catch (error) {
                console.error("Auth check error:", error);
            }
        }

        setAuthChecked(true);
    };

    const handleLogout = async () => {
        const creatorToken = localStorage.getItem("creator_token");
        const adminToken = localStorage.getItem("admin_token");
        const token = creatorToken || adminToken;

        try {
            if (token) {
                await fetch("/api/auth/logout", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("creator_token");
            localStorage.removeItem("admin_token");
            localStorage.removeItem("creator_user");
            localStorage.removeItem("admin_user");
            setIsLoggedIn(false);
            setUser(null);
            setUserRole(null);
            toast({
                title: "Logged out successfully",
            });
        }
    };

    // Fetch themes
    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        try {
            const response = await fetch("/api/themes");
            if (!response.ok) throw new Error("Failed to fetch themes");
            const data = await response.json();
            setThemes(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load themes",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (themeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/themes/${themeId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userToken }),
            });

            if (!response.ok) throw new Error("Failed to like theme");

            const data = await response.json();
            setThemes(
                themes.map(theme =>
                    theme.id === themeId ? { ...theme, likesCount: data.likesCount, isLiked: data.isLiked } : theme,
                ),
            );

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

    const handleView = async (themeId: string) => {
        try {
            const response = await fetch(`/api/themes/${themeId}/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userToken }),
            });
            if (response.ok) {
                const data = await response.json();
                setThemes(
                    themes.map(theme => (theme.id === themeId ? { ...theme, viewsCount: data.viewsCount } : theme)),
                );
            }
        } catch (error) {
            console.error("Failed to track view:", error);
        }
    };

    const handleShare = async (themeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/themes/${themeId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Check out this theme!",
                    url: shareUrl,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast({
                title: "Link copied!",
                description: "Share URL has been copied to your clipboard.",
            });
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        try {
            const response = await fetch(`/api/themes?search=${query}&category=${selectedCategory}`);
            if (!response.ok) throw new Error("Failed to search themes");
            const data = await response.json();
            setThemes(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to search themes",
            });
        }
    };

    const handleCategoryFilter = async (category: string) => {
        setSelectedCategory(category);
        try {
            const response = await fetch(`/api/themes?search=${searchQuery}&category=${category}`);
            if (!response.ok) throw new Error("Failed to filter themes");
            const data = await response.json();
            setThemes(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to filter themes",
            });
        }
    };

    const applyTheme = (themeId: string) => {
        // Construct the JSON URL for the theme
        const jsonUrl = `${window.location.origin}/api/themes/${themeId}/json`;

        // Create the deep link URL
        const deepLink = `anymex://theme?type=player&url=${encodeURIComponent(jsonUrl)}`;

        // Open the deep link
        window.location.href = deepLink;
    };

    const downloadJson = (theme: Theme) => {
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

    // Fetch maintainers
    const [maintainers, setMaintainers] = useState<Maintainer[]>([]);
    useEffect(() => {
        const fetchMaintainers = async () => {
            const usernames = ["RyanYuuki", "Shebyyy"];
            const data = await Promise.all(
                usernames.map(async username => {
                    const res = await fetch(`https://api.github.com/users/${username}`);
                    return res.json();
                }),
            );
            setMaintainers(data);
        };
        fetchMaintainers();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased selection:bg-neutral-200 selection:text-black">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

            {/* Navigation */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-all">
                <div className="px-4 sm:px-6 pl-2">
                    <div className="flex h-14 items-center justify-between gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2 shrink-0 cursor-pointer pl-2">
                            <img
                                src="https://raw.githubusercontent.com/RyanYuuki/AnymeX/main/assets/images/logo_transparent.png"
                                alt="AnymeX"
                                className="w-8 h-8"
                            />
                            <span className="text-sm font-semibold tracking-tight text-white">AnymeX</span>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1">
                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center gap-1">
                                <a
                                    href="/docs"
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                                >
                                    Docs
                                </a>

                                {authChecked && isLoggedIn ? (
                                    <>
                                        {/* Logged in: Show Profile and Dashboard */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                                                    <Icon icon="solar:user-circle-linear" width={16} />
                                                    {user?.username || "Profile"}
                                                    <Icon icon="solar:alt-arrow-down-linear" width={14} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="bg-neutral-900 border-neutral-800 min-w-[180px]"
                                            >
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/profile"
                                                        className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                    >
                                                        <Icon icon="solar:user-linear" width={14} />
                                                        My Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                {userRole === "THEME_CREATOR" && (
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href="/creator/dashboard"
                                                            className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                        >
                                                            <Icon icon="solar:palette-bold" width={14} />
                                                            Creator Dashboard
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href="/creator/dashboard"
                                                                className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                            >
                                                                <Icon icon="solar:palette-bold" width={14} />
                                                                Creator Dashboard
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href="/admin/dashboard"
                                                                className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                            >
                                                                <Icon icon="solar:shield-check-linear" width={14} />
                                                                Admin Dashboard
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator className="bg-neutral-800" />
                                                <DropdownMenuItem
                                                    onClick={handleLogout}
                                                    className="cursor-pointer text-red-400 hover:text-red-300 flex items-center gap-2"
                                                >
                                                    <Icon icon="solar:logout-2-linear" width={14} />
                                                    Logout
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                ) : (
                                    <>
                                        {/* Logged out: Show unified Auth */}
                                        <Link
                                            href="/auth"
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                                        >
                                            <Icon icon="solar:palette-bold" width={16} />
                                            Sign In
                                        </Link>
                                        <a
                                            href="/auth"
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                                        >
                                            <Icon icon="solar:login-3-linear" width={16} />
                                            Admin
                                        </a>
                                    </>
                                )}
                                <div className="h-4 w-px bg-neutral-800 mx-2"></div>
                                <a
                                    href="https://github.com/RyanYuuki/AnymeX"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full bg-neutral-800 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-700 border border-neutral-700 transition-colors inline-flex items-center justify-center"
                                >
                                    Get App
                                </a>
                            </div>

                            {/* Mobile Menu */}
                            <div className="flex md:hidden">
                                <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                                            <Icon icon="solar:hamburger-menu-linear" width={20} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="bg-neutral-900 border-neutral-800 min-w-[200px]"
                                    >
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/docs"
                                                className="cursor-pointer text-neutral-300 hover:text-white"
                                            >
                                                Docs
                                            </Link>
                                        </DropdownMenuItem>

                                        {authChecked && isLoggedIn ? (
                                            <>
                                                <DropdownMenuSeparator className="bg-neutral-800" />
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/profile"
                                                        className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                    >
                                                        <Icon icon="solar:user-linear" width={14} />
                                                        My Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                {userRole === "THEME_CREATOR" && (
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href="/creator/dashboard"
                                                            className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                        >
                                                            <Icon icon="solar:palette-bold" width={14} />
                                                            Creator Dashboard
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href="/creator/dashboard"
                                                                className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                            >
                                                                <Icon icon="solar:palette-bold" width={14} />
                                                                Creator Dashboard
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href="/admin/dashboard"
                                                                className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                            >
                                                                <Icon icon="solar:shield-check-linear" width={14} />
                                                                Admin Dashboard
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator className="bg-neutral-800" />
                                                <DropdownMenuItem
                                                    onClick={handleLogout}
                                                    className="cursor-pointer text-red-400 hover:text-red-300 flex items-center gap-2"
                                                >
                                                    <Icon icon="solar:logout-2-linear" width={14} />
                                                    Logout
                                                </DropdownMenuItem>
                                            </>
                                        ) : (
                                            <>
                                                <DropdownMenuSeparator className="bg-neutral-800" />
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/auth"
                                                        className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                    >
                                                        <Icon icon="solar:palette-bold" width={14} />
                                                        Sign In / Register
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/auth"
                                                        className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                                                    >
                                                        <Icon icon="solar:login-3-linear" width={14} />
                                                        Admin Login
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator className="bg-neutral-800" />
                                        <DropdownMenuItem asChild>
                                            <a
                                                href="https://github.com/RyanYuuki/AnymeX"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cursor-pointer text-white font-medium bg-white/5 hover:bg-white/10"
                                            >
                                                Get App
                                            </a>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto sm:px-6 lg:px-8 py-10">
                {/* Hero Section */}
                <div className="relative py-24 md:py-32 flex flex-col items-center text-center px-4">
                    <Badge
                        variant="outline"
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-xs font-medium text-neutral-400 mb-6 backdrop-blur-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        New themes added weekly
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white max-w-4xl mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Customize your visual experience
                    </h1>
                    <p className="text-neutral-400 max-w-2xl text-base md:text-lg leading-relaxed">
                        Discover community-crafted themes to personalize your AnymeX.
                        <br className="hidden md:block" />
                        From minimalist dark modes to vibrant neon aesthetics.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="sticky top-24 z-40 mb-10 -mx-4 px-4 py-4 md:mx-0 md:px-0 md:py-0 md:static md:bg-transparent backdrop-blur-md md:backdrop-blur-none bg-neutral-950/80 md:bg-transparent border-b border-neutral-800 md:border-none">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-900/30 md:bg-neutral-900/20 md:border border-neutral-800/50 md:p-1.5 md:rounded-2xl backdrop-blur-sm">
                        {/* Search */}
                        <div className="relative w-full md:max-w-sm group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-neutral-300 transition-colors">
                                <Icon icon="solar:magnifer-linear" width={18} />
                            </div>
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="block w-full rounded-xl md:rounded-xl border border-neutral-800 md:border-transparent bg-neutral-900 md:bg-transparent py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:border-neutral-700 focus:bg-neutral-800 md:focus:bg-neutral-800/50 focus:ring-0 transition-all"
                                placeholder="Search themes..."
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-[10px] text-neutral-600 font-mono">CMD+K</span>
                            </div>
                        </div>

                        {/* Filters & Sort */}
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                            <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800/50 md:border-transparent md:bg-transparent">
                                {["All", "Dark", "Light", "AMOLED"].map(category => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryFilter(category)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                            selectedCategory === category
                                                ? "bg-neutral-800 text-white shadow-sm"
                                                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            <div className="h-6 w-px bg-neutral-800 mx-1 hidden md:block"></div>

                            <button className="shrink-0 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-all ml-auto md:ml-0">
                                <Icon icon="solar:sort-vertical-linear" width={14} />
                                <span>Popular</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Themes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => (
                              <div
                                  key={i}
                                  className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/20 p-2"
                              >
                                  <Skeleton className="aspect-video w-full rounded-lg" />
                                  <div className="flex flex-col gap-3 p-3">
                                      <Skeleton className="h-4 w-3/4" />
                                      <Skeleton className="h-3 w-1/2" />
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                          <Skeleton className="h-9" />
                                          <Skeleton className="h-9" />
                                      </div>
                                  </div>
                              </div>
                          ))
                        : themes.map(theme => (
                              <div
                                  key={theme.id}
                                  className="group relative flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/20 p-2 transition-all hover:border-neutral-700 hover:bg-neutral-900/40 hover:shadow-lg hover:shadow-black/50"
                              >
                                  {/* Clickable area for theme detail - wraps preview and info */}
                                  {theme.themeId ? (
                                      <Link
                                          href={`/themes/${theme.themeId}`}
                                          onClick={() => handleView(theme.id)}
                                          className="flex-1 flex flex-col"
                                      >
                                          {/* Preview */}
                                          <div className="aspect-video w-full overflow-hidden rounded-lg relative">
                                              {ENABLE_THEME_PREVIEW ? (
                                                  <ThemePreviewRenderer
                                                      themeJson={theme.themeJson}
                                                      backgroundImage="/preview-bg.jpg"
                                                      className="w-full h-full"
                                                      controllerState={undefined}
                                                      width={undefined}
                                                      height={undefined}
                                                      style={undefined}
                                                  />
                                              ) : (
                                                  <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 flex items-center justify-center">
                                                      <span className="text-xs md:text-sm text-neutral-300 font-medium tracking-wide">
                                                          Preview coming soon
                                                      </span>
                                                  </div>
                                              )}
                                          </div>
                                      </Link>
                                  ) : (
                                      <div onClick={() => handleView(theme.id)} className="flex-1 flex flex-col">
                                          {/* Preview */}
                                          <div className="aspect-video w-full overflow-hidden rounded-lg relative">
                                              {ENABLE_THEME_PREVIEW ? (
                                                  <ThemePreviewRenderer
                                                      themeJson={theme.themeJson}
                                                      backgroundImage="/preview-bg.jpg"
                                                      className="w-full h-full"
                                                      controllerState={undefined}
                                                      width={undefined}
                                                      height={undefined}
                                                      style={undefined}
                                                  />
                                              ) : (
                                                  <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 flex items-center justify-center">
                                                      <span className="text-xs md:text-sm text-neutral-300 font-medium tracking-wide">
                                                          Preview coming soon
                                                      </span>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  )}

                                  <div className="flex flex-col gap-3 p-3">
                                      {/* Theme info - clickable */}
                                      <div className="flex justify-between items-start">
                                          {theme.themeId ? (
                                              <Link
                                                  href={`/themes/${theme.themeId}`}
                                                  onClick={e => e.stopPropagation()}
                                                  className="flex-1"
                                              >
                                                  <h3 className="text-sm font-medium text-neutral-100 group-hover:text-white">
                                                      {theme.name}
                                                  </h3>
                                                  <div className="flex items-center gap-1 mt-0.5">
                                                      <span className="text-xs text-neutral-500">by</span>
                                                      {theme.creator?.profileUrl ? (
                                                          <a
                                                              href={theme.creator.profileUrl}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              onClick={e => e.stopPropagation()}
                                                              className="text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer hover:underline"
                                                          >
                                                              {theme.creatorName}
                                                          </a>
                                                      ) : (
                                                          <span className="text-xs text-neutral-400">
                                                              {theme.creatorName}
                                                          </span>
                                                      )}
                                                  </div>
                                              </Link>
                                          ) : (
                                              <div className="flex-1">
                                                  <h3 className="text-sm font-medium text-neutral-100 group-hover:text-white">
                                                      {theme.name}
                                                  </h3>
                                                  <div className="flex items-center gap-1 mt-0.5">
                                                      <span className="text-xs text-neutral-500">by</span>
                                                      {theme.creator?.profileUrl ? (
                                                          <a
                                                              href={theme.creator.profileUrl}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              onClick={e => e.stopPropagation()}
                                                              className="text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer hover:underline"
                                                          >
                                                              {theme.creatorName}
                                                          </a>
                                                      ) : (
                                                          <span className="text-xs text-neutral-400">
                                                              {theme.creatorName}
                                                          </span>
                                                      )}
                                                  </div>
                                              </div>
                                          )}
                                          <div className="flex items-center gap-1">
                                              {theme.themeId && (
                                                  <button
                                                      onClick={e => handleShare(theme.themeId, e)}
                                                      className="flex items-center gap-1 text-xs p-1.5 rounded-full border border-neutral-800 bg-neutral-900/50 transition-colors text-neutral-500 hover:text-blue-400 hover:bg-neutral-800"
                                                      title="Share"
                                                  >
                                                      <Icon icon="solar:share-linear" width={14} />
                                                  </button>
                                              )}
                                              <button
                                                  onClick={e => handleLike(theme.id, e)}
                                                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 transition-colors ${
                                                      theme.isLiked
                                                          ? "text-rose-500"
                                                          : "text-neutral-500 hover:text-rose-500"
                                                  }`}
                                              >
                                                  <Icon
                                                      icon="solar:heart-linear"
                                                      className={theme.isLiked ? "text-rose-500" : ""}
                                                  />
                                                  {theme.likesCount}
                                              </button>
                                          </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                          <Button
                                              onClick={e => {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                  applyTheme(theme.id);
                                              }}
                                              className="flex items-center justify-center gap-2 rounded-lg bg-neutral-100 py-2 text-xs font-medium text-black hover:bg-white transition-colors"
                                          >
                                              <Icon icon="solar:magic-stick-3-linear" width={14} />
                                              Apply
                                          </Button>
                                          <Button
                                              variant="outline"
                                              onClick={e => {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                  downloadJson(theme);
                                              }}
                                              className="flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-transparent py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                                          >
                                              <Icon icon="solar:file-download-linear" width={14} />
                                              JSON
                                          </Button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                </div>

                {/* Load More */}
                {!loading && themes.length > 0 && (
                    <div className="mt-12 flex justify-center">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-6 py-3 text-sm font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900 hover:text-white transition-all"
                        >
                            <span>Load more themes</span>
                            <Icon icon="solar:refresh-linear" width={16} />
                        </Button>
                    </div>
                )}

                {/* Maintainers */}
                <div className="mt-20 w-full max-w-2xl mx-auto px-4 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-neutral-800"></div>
                        <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                            Maintained by
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-neutral-800"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {maintainers.map(maintainer => (
                            <a
                                key={maintainer.login}
                                href={maintainer.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/20 p-3 transition-all hover:border-neutral-700 hover:bg-neutral-900/40 hover:shadow-lg hover:shadow-black/50"
                            >
                                <img
                                    src={maintainer.avatar_url}
                                    alt={maintainer.login}
                                    className="h-10 w-10 rounded-full border border-neutral-800 object-cover transition-colors group-hover:border-neutral-600"
                                />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-neutral-200 transition-colors group-hover:text-white truncate">
                                        {maintainer.name || maintainer.login}
                                    </span>
                                    <span className="text-xs text-neutral-500 group-hover:text-neutral-400 truncate">
                                        @{maintainer.login}
                                    </span>
                                </div>
                                <Icon
                                    icon="lucide:github"
                                    width={18}
                                    className="ml-auto text-neutral-600 transition-colors group-hover:text-white shrink-0"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-neutral-600">© 2024 AnymeX Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="/docs" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                            Documentation
                        </a>
                        <a href="#" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                            Terms
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
