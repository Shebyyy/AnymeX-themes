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
import { useEffect, useState, useMemo } from "react";
import { getAvatarUrl } from "@/lib/avatar";

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

/* -----------------------------------------------------------
   Helper: extract up to 6 hex colors from a theme JSON string
   ----------------------------------------------------------- */
function extractThemeColors(jsonStr: string): string[] {
    try {
        const parsed = JSON.parse(jsonStr);
        const colors: string[] = [];
        const seen = new Set<string>();

        const walk = (obj: Record<string, unknown>) => {
            for (const val of Object.values(obj)) {
                if (colors.length >= 6) return;
                if (typeof val === "string" && /^#[0-9a-fA-F]{6}$/.test(val) && !seen.has(val.toLowerCase())) {
                    seen.add(val.toLowerCase());
                    colors.push(val);
                } else if (typeof val === "object" && val !== null) {
                    walk(val as Record<string, unknown>);
                }
            }
        };

        walk(parsed);
        return colors;
    } catch {
        return [];
    }
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
    const [user, setUser] = useState<{ username: string; role: string; profileUrl?: string | null } | null>(null);
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
                title: data.isLiked ? "Theme liked!" : "Like removed",
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
        <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/30 selection:text-foreground flex flex-col">
            {/* ============================================ */}
            {/* Ambient Background Glow Orbs                 */}
            {/* ============================================ */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
                <div className="glow-orb glow-orb-violet w-[600px] h-[400px] top-[-10%] left-[10%] animate-float-slow" />
                <div className="glow-orb glow-orb-cyan w-[500px] h-[350px] top-[-5%] right-[5%] animate-float-slow" style={{ animationDelay: "2s" }} />
                <div className="glow-orb glow-orb-rose w-[400px] h-[300px] top-[50%] left-[50%] -translate-x-1/2 animate-float-slow" style={{ animationDelay: "4s", opacity: 0.3 }} />
            </div>

            {/* ============================================ */}
            {/* Navigation                                    */}
            {/* ============================================ */}
            <nav className="glass-nav fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl rounded-2xl transition-all sm:w-[94%]">
                <div className="px-4 sm:px-6 pl-2">
                    <div className="flex h-14 items-center justify-between gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer pl-2">
                            <img
                                src="https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png"
                                alt="AnymeX"
                                className="w-8 h-8"
                            />
                            <span className="text-sm font-semibold tracking-tight text-foreground">AnymeX</span>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1">
                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center gap-1">
                                <a
                                    href="/docs"
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                                >
                                    Docs
                                </a>

                                {authChecked && isLoggedIn ? (
                                    <>
                                        {/* Logged in: Show Profile and Dashboard */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
                                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-border bg-card">
                                                        {user ? (
                                                            <img
                                                                src={getAvatarUrl(user.username, user.profileUrl)}
                                                                alt={user.username}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    const icon = target.parentElement?.querySelector('div');
                                                                    if (icon) icon.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className="w-full h-full hidden items-center justify-center">
                                                            <Icon icon="solar:user-bold" width={14} className="text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                    {user?.username || "Profile"}
                                                    <Icon icon="solar:alt-arrow-down-linear" width={14} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="glass-surface min-w-[180px] border-border/50"
                                            >
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/profile"
                                                        className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                                                    >
                                                        <Icon icon="solar:user-linear" width={14} />
                                                        My Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/dashboard"
                                                        className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                                                    >
                                                        <Icon icon="solar:palette-bold" width={14} />
                                                        Dashboard
                                                    </Link>
                                                </DropdownMenuItem>
                                                {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href="/admin/users"
                                                                className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                                                            >
                                                                <Icon icon="solar:users-group-rounded-bold" width={14} />
                                                                Manage Users
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href="/admin/themes"
                                                                className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                                                            >
                                                                <Icon icon="solar:gallery-wide-bold" width={14} />
                                                                Theme Approvals
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator className="bg-border/50" />
                                                <DropdownMenuItem
                                                    onClick={handleLogout}
                                                    className="cursor-pointer text-destructive hover:text-destructive flex items-center gap-2"
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
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                                        >
                                            <Icon icon="solar:login-3-linear" width={16} />
                                            Sign In
                                        </Link>
                                    </>
                                )}
                                <div className="h-4 w-px bg-border/50 mx-2"></div>
                                <a
                                    href="https://github.com/RyanYuuki/AnymeX"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-violet rounded-full px-5 py-2 text-xs font-semibold inline-flex items-center justify-center cursor-pointer"
                                >
                                    Get App
                                </a>
                            </div>

                            {/* Mobile Menu */}
                            <div className="flex md:hidden">
                                <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                            <Icon icon="solar:hamburger-menu-linear" width={20} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="glass-surface min-w-[200px] border-border/50"
                                    >
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/docs"
                                                className="cursor-pointer text-foreground/80 hover:text-foreground"
                                            >
                                                Docs
                                            </Link>
                                        </DropdownMenuItem>

                                        {authChecked && isLoggedIn ? (
                                            <>
                                                <DropdownMenuSeparator className="bg-border/50" />
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/profile"
                                                        className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                                                    >
                                                        <Icon icon="solar:user-linear" width={14} />
                                                        My Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/dashboard"
                                                        className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                                                    >
                                                        <Icon icon="solar:palette-bold" width={14} />
                                                        Dashboard
                                                    </Link>
                                                </DropdownMenuItem>
                                                {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href="/admin/users"
                                                                className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                                                            >
                                                                <Icon icon="solar:users-group-rounded-bold" width={14} />
                                                                Manage Users
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href="/admin/themes"
                                                                className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                                                            >
                                                                <Icon icon="solar:gallery-wide-bold" width={14} />
                                                                Theme Approvals
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator className="bg-border/50" />
                                                <DropdownMenuItem
                                                    onClick={handleLogout}
                                                    className="cursor-pointer text-destructive hover:text-destructive flex items-center gap-2"
                                                >
                                                    <Icon icon="solar:logout-2-linear" width={14} />
                                                    Logout
                                                </DropdownMenuItem>
                                            </>
                                        ) : (
                                            <>
                                                <DropdownMenuSeparator className="bg-border/50" />
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/auth"
                                                        className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                                                    >
                                                        <Icon icon="solar:login-3-linear" width={14} />
                                                        Sign In / Register
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator className="bg-border/50" />
                                        <DropdownMenuItem asChild>
                                            <a
                                                href="https://github.com/RyanYuuki/AnymeX"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cursor-pointer text-foreground font-medium"
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

            {/* ============================================ */}
            {/* Main Content                                  */}
            {/* ============================================ */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
                {/* Hero Section */}
                <div className="relative py-24 md:py-36 flex flex-col items-center text-center">
                    <Badge
                        variant="outline"
                        className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground mb-7"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        New themes added weekly
                    </Badge>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mb-6 gradient-text leading-[1.1]">
                        Customize your visual experience
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-base md:text-lg leading-relaxed">
                        Discover community-crafted themes to personalize your AnymeX.
                        <br className="hidden md:block" />
                        From minimalist dark modes to vibrant neon aesthetics.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="sticky top-24 z-40 mb-10 backdrop-blur-md md:backdrop-blur-none bg-background/60 md:bg-transparent border-b border-border/30 md:border-none -mx-4 md:mx-0 px-4 md:px-0 md:py-0">
                    <div className="glass-surface flex flex-col md:flex-row gap-4 justify-between items-center md:p-1.5 rounded-2xl py-4">
                        {/* Search */}
                        <div className="relative w-full md:max-w-sm group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-foreground/70 transition-colors duration-200">
                                <Icon icon="solar:magnifer-linear" width={18} />
                            </div>
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="block w-full rounded-xl md:rounded-xl border border-border/50 md:border-transparent bg-card/50 md:bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-border focus:bg-card/60 md:focus:bg-card/40 focus:ring-0 transition-all duration-200 input-glow"
                                placeholder="Search themes..."
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-[10px] text-muted-foreground/50 font-mono">CMD+K</span>
                            </div>
                        </div>

                        {/* Filters & Sort */}
                        <div className="flex items-center w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                            <div className="flex items-center rounded-xl bg-card/40 border border-border/40 overflow-hidden">
                                {["All", "Dark", "Light", "AMOLED"].map(category => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryFilter(category)}
                                        className={`cursor-pointer px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                                            selectedCategory === category
                                                ? "bg-primary/15 text-primary border-primary/20"
                                                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                                <div className="h-6 w-px bg-border/40 mx-1 hidden md:block" />
                                <button
                                    className="shrink-0 cursor-pointer flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card/60 transition-colors duration-200 ml-auto md:ml-0"
                                    // NOTE: current API sorts by likes count; this button is visual until backend sort is wired.
                                    onClick={() => handleCategoryFilter(selectedCategory)}
                                >
                                    <Icon icon="solar:sort-vertical-linear" width={14} />
                                    <span>Popular</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Themes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => (
                              <div
                                  key={i}
                                  className="glass-surface flex flex-col rounded-xl p-2 animate-fade-in-up"
                                  style={{ animationDelay: `${i * 60}ms` }}
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
                        : themes.map((theme, idx) => (
                              <div
                                  key={theme.id}
                                  className="group relative flex flex-col rounded-xl border border-border/40 bg-card/40 p-2 transition-all duration-300 hover:border-primary/30 hover:bg-card/65 hover:shadow-xl hover:shadow-primary/5 animate-fade-in-up"
                                  style={{ animationDelay: `${idx * 40}ms` }}
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
                                                  <ThemeColorPreview themeJson={theme.themeJson} />
                                              )}
                                          </div>
                                      </Link>
                                  ) : (
                                      <div onClick={() => handleView(theme.id)} className="flex-1 flex flex-col cursor-pointer">
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
                                                  <ThemeColorPreview themeJson={theme.themeJson} />
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
                                                  <h3 className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-200">
                                                      {theme.name}
                                                  </h3>
                                                  <div className="flex items-center gap-1 mt-0.5">
                                                      <span className="text-xs text-muted-foreground/60">by</span>
                                                      {theme.creator ? (
                                                          <Link
                                                              href={`/users/${theme.creator.username}`}
                                                              onClick={e => e.stopPropagation()}
                                                              className="text-xs text-muted-foreground hover:text-foreground/80 cursor-pointer hover:underline transition-colors duration-200"
                                                          >
                                                              {theme.creatorName}
                                                          </Link>
                                                      ) : theme.creator?.profileUrl ? (
                                                          <a
                                                              href={theme.creator.profileUrl}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              onClick={e => e.stopPropagation()}
                                                              className="text-xs text-muted-foreground hover:text-foreground/80 cursor-pointer hover:underline transition-colors duration-200"
                                                          >
                                                              {theme.creatorName}
                                                          </a>
                                                      ) : (
                                                          <span className="text-xs text-muted-foreground">
                                                              {theme.creatorName}
                                                          </span>
                                                      )}
                                                  </div>
                                              </Link>
                                          ) : (
                                              <div className="flex-1">
                                                  <h3 className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-200">
                                                      {theme.name}
                                                  </h3>
                                                  <div className="flex items-center gap-1 mt-0.5">
                                                      <span className="text-xs text-muted-foreground/60">by</span>
                                                      {theme.creator ? (
                                                          <span className="text-xs text-muted-foreground">
                                                              {theme.creatorName}
                                                          </span>
                                                      ) : (
                                                          <span className="text-xs text-muted-foreground">
                                                              {theme.creatorName}
                                                          </span>
                                                      )}
                                                  </div>
                                              </div>
                                          )}
                                          <div className="flex items-center gap-1">
                                              {theme.themeId && (
                                                  <button
                                                      onClick={e => handleShare(theme.themeId!, e)}
                                                      className="flex items-center gap-1 text-xs p-1.5 rounded-full border border-border/40 bg-card/30 transition-all duration-200 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                                                      title="Share"
                                                  >
                                                      <Icon icon="solar:share-linear" width={14} />
                                                  </button>
                                              )}
                                              <button
                                                  onClick={e => handleLike(theme.id, e)}
                                                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all duration-200 cursor-pointer ${
                                                      theme.isLiked
                                                          ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
                                                          : "text-muted-foreground border-border/40 bg-card/30 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5"
                                                  }`}
                                              >
                                                  <Icon
                                                      icon={theme.isLiked ? "solar:heart-bold" : "solar:heart-linear"}
                                                      className={theme.isLiked ? "text-rose-400" : ""}
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
                                              className="btn-violet flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium cursor-pointer"
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
                                              className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/30 py-2 text-xs font-medium text-foreground/70 hover:bg-card/60 hover:text-foreground transition-all duration-200 cursor-pointer"
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
                    <div className="mt-14 flex justify-center">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/30 px-7 py-3 text-sm font-medium text-foreground/70 hover:border-primary/30 hover:bg-card/50 hover:text-foreground transition-all duration-300 cursor-pointer"
                        >
                            <span>Load more themes</span>
                            <Icon icon="solar:refresh-linear" width={16} />
                        </Button>
                    </div>
                )}

                {/* Maintainers */}
                <div className="mt-24 w-full max-w-2xl mx-auto px-4 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-border"></div>
                        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
                            Maintained by
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-border"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {maintainers.map(maintainer => (
                            <a
                                key={maintainer.login}
                                href={maintainer.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 p-3.5 transition-all duration-300 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                            >
                                <img
                                    src={maintainer.avatar_url}
                                    alt={maintainer.login}
                                    className="h-10 w-10 rounded-full border border-border/50 object-cover transition-all duration-300 group-hover:border-primary/40"
                                />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-foreground/85 transition-colors duration-200 group-hover:text-foreground truncate">
                                        {maintainer.name || maintainer.login}
                                    </span>
                                    <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 truncate">
                                        @{maintainer.login}
                                    </span>
                                </div>
                                <Icon
                                    icon="lucide:github"
                                    width={18}
                                    className="ml-auto text-muted-foreground/40 transition-colors duration-200 group-hover:text-foreground shrink-0"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-border/30 bg-card/10 backdrop-blur-sm py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground/50">&copy; 2025 AnymeX. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="/docs" className="text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-200">
                            Documentation
                        </a>
                        <a href="#" className="text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-200">
                            Privacy
                        </a>
                        <a href="#" className="text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-200">
                            Terms
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* -----------------------------------------------------------
   Theme Color Preview Component
   Shows extracted colors as a visual palette instead of
   a generic "Preview coming soon" placeholder.
   ----------------------------------------------------------- */
function ThemeColorPreview({ themeJson }: { themeJson: string }) {
    const colors = useMemo(() => extractThemeColors(themeJson), [themeJson]);

    if (colors.length === 0) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-card via-card/80 to-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground/50 font-medium tracking-wide">
                    No preview
                </span>
            </div>
        );
    }

    // Build a gradient background from the theme's own colors
    const bgGradient = `linear-gradient(135deg, ${colors[0]}15, ${colors[colors.length > 1 ? 1 : 0]}10)`;

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center gap-3 relative"
            style={{ background: bgGradient }}
        >
            {/* Subtle mesh using the theme's primary color */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    background: `radial-gradient(circle at 30% 40%, ${colors[0]}40, transparent 70%)`,
                }}
            />
            {/* Color palette dots */}
            <div className="relative flex items-center gap-2">
                {colors.map((color, i) => (
                    <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-white/10 shadow-lg transition-transform duration-200 hover:scale-110"
                        style={{
                            backgroundColor: color,
                            boxShadow: `0 2px 8px ${color}40`,
                        }}
                        title={color}
                    />
                ))}
            </div>
            <span className="relative text-[10px] text-white/40 font-medium tracking-wide">
                {colors.length} colors
            </span>
        </div>
    );
}
