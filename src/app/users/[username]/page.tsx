"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/avatar";

interface UserProfile {
  id: string;
  username: string;
  role: string;
  profileUrl: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface UserStats {
  totalThemes: number;
  totalLikes: number;
  totalViews: number;
  approvedThemes: number;
  pendingThemes: number;
  categories: {
    Dark: number;
    Light: number;
    AMOLED: number;
    Other: number;
  };
}

interface Theme {
  id: string;
  themeId: string | null;
  name: string;
  description: string | null;
  category: string | null;
  likesCount: number;
  viewsCount: number;
  status: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const username = params.username as string;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [themesLoading, setThemesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
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
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    }

    setAuthChecked(true);
  };

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserThemes();
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchUserThemes();
    }
  }, [selectedCategory, sortBy]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            variant: "destructive",
            title: "User not found",
            description: "The user profile you're looking for doesn't exist.",
          });
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      setUserProfile(data.user);
      setUserStats(data.stats);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserThemes = async () => {
    setThemesLoading(true);
    try {
      const response = await fetch(
        `/api/users/${username}/themes?category=${selectedCategory}&sort=${sortBy}`
      );
      if (!response.ok) throw new Error("Failed to fetch user themes");
      const data = await response.json();
      setThemes(data.themes || []);
    } catch (error) {
      console.error("Error fetching user themes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user themes",
      });
    } finally {
      setThemesLoading(false);
    }
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
      setCurrentUser(null);
      toast({
        title: "Logged out successfully",
      });
    }
  };

  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  const isOwnProfile = currentUser?.username === username;
  const canViewStatus = isAdmin || isOwnProfile;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "ADMIN":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "THEME_CREATOR":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "BROKEN":
        return "bg-red-900/30 text-red-300 border-red-900/50";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased">
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-all">
          <div className="px-4 sm:px-6 pl-2">
            <div className="flex h-14 items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
          </div>
        </nav>
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-all">
        <div className="px-4 sm:px-6 pl-2">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 cursor-pointer pl-2">
              <img
                src="https://raw.githubusercontent.com/RyanYuuki/AnymeX/main/assets/images/logo_transparent.png"
                alt="AnymeX"
                className="w-8 h-8"
              />
              <span className="text-sm font-semibold tracking-tight text-white">
                AnymeX
              </span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                <a
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Themes
                </a>
                <a
                  href="/docs"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Docs
                </a>

                {authChecked && isLoggedIn ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                          <Icon icon="solar:user-circle-linear" width={16} />
                          {currentUser?.username || "Profile"}
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
                        <DropdownMenuItem asChild>
                          <Link
                            href="/dashboard"
                            className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                          >
                            <Icon icon="solar:palette-bold" width={14} />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator className="bg-neutral-800" />
                            <DropdownMenuItem asChild>
                              <Link
                                href="/admin/users"
                                className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                              >
                                <Icon icon="solar:users-group-rounded-bold" width={14} />
                                Manage Users
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/admin/themes"
                                className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                              >
                                <Icon icon="solar:gallery-wide-bold" width={14} />
                                Theme Approvals
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
                    <Link
                      href="/auth"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                    >
                      <Icon icon="solar:palette-bold" width={16} />
                      Sign In
                    </Link>
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
                      <a href="/" className="cursor-pointer text-neutral-300 hover:text-white">
                        Themes
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/docs" className="cursor-pointer text-neutral-300 hover:text-white">
                        Docs
                      </a>
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
                        <DropdownMenuItem asChild>
                          <Link
                            href="/dashboard"
                            className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                          >
                            <Icon icon="solar:palette-bold" width={14} />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator className="bg-neutral-800" />
                            <DropdownMenuItem asChild>
                              <Link
                                href="/admin/users"
                                className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                              >
                                <Icon icon="solar:users-group-rounded-bold" width={14} />
                                Manage Users
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/admin/themes"
                                className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2"
                              >
                                <Icon icon="solar:gallery-wide-bold" width={14} />
                                Theme Approvals
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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - User Info */}
          <aside className="w-full md:w-80 space-y-6">
            {/* Profile Card */}
            <Card className="border-neutral-800 bg-neutral-900/30">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full border-2 border-neutral-700 overflow-hidden bg-gradient-to-br from-neutral-700 to-neutral-800">
                    <img
                      src={getAvatarUrl(userProfile.username, userProfile.profileUrl)}
                      alt={`${userProfile.username}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const icon = target.parentElement?.querySelector('div');
                        if (icon) icon.style.display = 'flex';
                      }}
                    />
                    {/* Fallback icon (hidden by default) */}
                    <div className="w-full h-full flex items-center justify-center hidden">
                      <Icon icon="solar:user-bold" width={48} className="text-neutral-400" />
                    </div>
                  </div>

                  {/* Username & Role */}
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-white">
                      {userProfile.username}
                    </h1>
                    <Badge variant="outline" className={getRoleColor(userProfile.role)}>
                      {userProfile.role.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Profile Link */}
                  {userProfile.profileUrl && (
                    <a
                      href={userProfile.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 underline break-all"
                    >
                      {userProfile.profileUrl}
                    </a>
                  )}

                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={
                      userProfile.isActive
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }
                  >
                    {userProfile.isActive ? "Active" : "Inactive"}
                  </Badge>

                  {/* Joined Date */}
                  <div className="text-xs text-neutral-500">
                    <Icon icon="solar:calendar-bold" width={14} className="inline mr-1" />
                    Joined{" "}
                    {new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            {userStats && (
              <Card className="border-neutral-800 bg-neutral-900/30">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Statistics</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-sm">Total Themes</span>
                      <span className="text-white font-semibold">{userStats.totalThemes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-sm">Total Likes</span>
                      <span className="text-white font-semibold">{userStats.totalLikes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-sm">Total Views</span>
                      <span className="text-white font-semibold">{userStats.totalViews}</span>
                    </div>
                    <div className="border-t border-neutral-800 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 text-sm">Approved</span>
                        <span className="text-green-400 font-semibold">{userStats.approvedThemes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 text-sm">Pending</span>
                        <span className="text-yellow-400 font-semibold">{userStats.pendingThemes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  {userStats.categories && (
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <h3 className="text-sm font-medium text-neutral-400 mb-2">By Category</h3>
                      <div className="space-y-2">
                        {userStats.categories.Dark > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-500">Dark</span>
                            <span className="text-neutral-300">{userStats.categories.Dark}</span>
                          </div>
                        )}
                        {userStats.categories.Light > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-500">Light</span>
                            <span className="text-neutral-300">{userStats.categories.Light}</span>
                          </div>
                        )}
                        {userStats.categories.AMOLED > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-500">AMOLED</span>
                            <span className="text-neutral-300">{userStats.categories.AMOLED}</span>
                          </div>
                        )}
                        {userStats.categories.Other > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-500">Other</span>
                            <span className="text-neutral-300">{userStats.categories.Other}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Admin Actions */}
            {isAdmin && !isOwnProfile && (
              <Card className="border-neutral-800 bg-neutral-900/30">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Admin Actions</h2>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <Icon icon="solar:shield-check-bold" width={16} className="mr-2" />
                      View Full Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <Icon icon="solar:pen-new-square-bold" width={16} className="mr-2" />
                      Change Role
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start border-neutral-700 hover:bg-neutral-800 ${
                        userProfile.isActive ? "text-yellow-400" : "text-green-400"
                      }`}
                    >
                      <Icon
                        icon={userProfile.isActive ? "solar:shield-cross-bold" : "solar:shield-check-bold"}
                        width={16}
                        className="mr-2"
                      />
                      {userProfile.isActive ? "Ban User" : "Activate User"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main Content - Themes */}
          <section className="flex-1 space-y-6">
            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {userProfile.username}'s Themes
              </h2>
              <p className="text-neutral-400">
                {userStats?.totalThemes || 0} theme{userStats?.totalThemes !== 1 ? "s" : ""} created
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-neutral-900/20 border border-neutral-800/50 p-1.5 rounded-xl backdrop-blur-sm">
              {/* Category Filter */}
              <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800/50 w-full sm:w-auto overflow-x-auto">
                {["All", "Dark", "Light", "AMOLED"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-neutral-800 text-white shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="shrink-0 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-all">
                    <Icon icon="solar:sort-vertical-linear" width={14} />
                    <span>
                      {sortBy === "newest" && "Newest"}
                      {sortBy === "oldest" && "Oldest"}
                      {sortBy === "likes" && "Most Liked"}
                      {sortBy === "views" && "Most Viewed"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 min-w-[140px]">
                  <DropdownMenuItem
                    onClick={() => setSortBy("newest")}
                    className={sortBy === "newest" ? "text-white bg-neutral-800" : "text-neutral-300"}
                  >
                    Newest
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortBy("oldest")}
                    className={sortBy === "oldest" ? "text-white bg-neutral-800" : "text-neutral-300"}
                  >
                    Oldest
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral-800" />
                  <DropdownMenuItem
                    onClick={() => setSortBy("likes")}
                    className={sortBy === "likes" ? "text-white bg-neutral-800" : "text-neutral-300"}
                  >
                    Most Liked
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortBy("views")}
                    className={sortBy === "views" ? "text-white bg-neutral-800" : "text-neutral-300"}
                  >
                    Most Viewed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {themesLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="border-neutral-800 bg-neutral-900/20 p-2">
                      <Skeleton className="aspect-video w-full rounded-lg" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="flex gap-2 mt-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </Card>
                  ))
                : themes.length > 0
                ? themes.map((theme) => (
                    <Card
                      key={theme.id}
                      className="group border-neutral-800 bg-neutral-900/20 p-2 transition-all hover:border-neutral-700 hover:bg-neutral-900/40 hover:shadow-lg hover:shadow-black/50"
                    >
                      {theme.themeId ? (
                        <Link
                          href={`/themes/${theme.themeId}`}
                          className="block"
                        >
                          {/* Preview Placeholder */}
                          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 flex items-center justify-center">
                            <Icon icon="solar:palette-bold" width={32} className="text-neutral-500" />
                          </div>

                          <div className="p-3 space-y-2">
                            <h3 className="text-sm font-medium text-neutral-100 group-hover:text-white">
                              {theme.name}
                            </h3>

                            <div className="flex flex-wrap gap-2">
                              {theme.category && (
                                <Badge variant="outline" className="text-[10px] border-neutral-700 bg-neutral-800/50 text-neutral-400">
                                  {theme.category}
                                </Badge>
                              )}
                              {canViewStatus && (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${getStatusColor(theme.status)}`}
                                >
                                  {theme.status}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                              <div className="flex items-center gap-1">
                                <Icon icon="solar:heart-bold" width={14} />
                                {theme.likesCount}
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon icon="solar:eye-bold" width={14} />
                                {theme.viewsCount}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="p-3 space-y-2">
                          <h3 className="text-sm font-medium text-neutral-100">
                            {theme.name}
                          </h3>

                          <div className="flex flex-wrap gap-2">
                            {theme.category && (
                              <Badge variant="outline" className="text-[10px] border-neutral-700 bg-neutral-800/50 text-neutral-400">
                                {theme.category}
                              </Badge>
                            )}
                            {canViewStatus && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${getStatusColor(theme.status)}`}
                              >
                                {theme.status}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                              <Icon icon="solar:heart-bold" width={14} />
                              {theme.likesCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon icon="solar:eye-bold" width={14} />
                              {theme.viewsCount}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                : (
                    <div className="col-span-full py-12 text-center">
                      <Icon
                        icon="solar:gallery-wide-linear"
                        width={48}
                        className="text-neutral-600 mx-auto mb-4"
                      />
                      <p className="text-neutral-400">No themes found</p>
                      <p className="text-neutral-500 text-sm mt-1">
                        {selectedCategory !== "All" ? `Try a different category filter` : "This creator hasn't published any themes yet"}
                      </p>
                    </div>
                  )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-600">
            © 2024 AnymeX Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Browse Themes
            </Link>
            <Link
              href="/docs"
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
