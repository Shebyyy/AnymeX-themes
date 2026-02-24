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

  const getRoleGradient = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "from-red-600 via-red-700 to-red-800";
      case "ADMIN":
        return "from-orange-600 via-orange-700 to-orange-800";
      case "THEME_CREATOR":
        return "from-purple-600 via-purple-700 to-purple-800";
      default:
        return "from-neutral-600 via-neutral-700 to-neutral-800";
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Dark":
        return "bg-neutral-500";
      case "Light":
        return "bg-gray-400";
      case "AMOLED":
        return "bg-black";
      case "Other":
        return "bg-purple-500";
      default:
        return "bg-neutral-500";
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
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="flex gap-4">
              <Skeleton className="w-32 h-32 rounded-full -mt-16 border-4 border-neutral-950" />
              <div className="flex-1 space-y-2 pt-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-6 w-48 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const totalCategories = Object.values(userStats?.categories || {}).reduce((a, b) => a + b, 0);

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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="mb-8">
            {/* Gradient Banner */}
            <div
              className={`bg-gradient-to-br ${getRoleGradient(userProfile.role)} h-48 sm:h-56 rounded-2xl relative mb-0 overflow-hidden`}
            >
              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              ></div>
            </div>

            {/* Avatar & Info Section */}
            <div className="px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end">
                {/* Avatar */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-2xl border-4 border-neutral-950 bg-neutral-950 flex-shrink-0">
                  <img
                    src={getAvatarUrl(userProfile.username, userProfile.profileUrl)}
                    alt={`${userProfile.username}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const icon = target.parentElement?.querySelector("div");
                      if (icon) icon.style.display = "flex";
                    }}
                  />
                  {/* Fallback icon */}
                  <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600">
                    <Icon icon="solar:user-bold" width={48} className="text-white" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-3 sm:pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {userProfile.username}
                    </h1>
                    <Badge
                      variant="outline"
                      className={getRoleColor(userProfile.role)}
                    >
                      {userProfile.role.replace(/_/g, " ")}
                    </Badge>
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
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="solar:calendar-bold" width={16} />
                      <span>
                        Joined{" "}
                        {new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                    {userProfile.profileUrl && (
                      <a
                        href={userProfile.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300"
                      >
                        <Icon icon="solar:link-bold" width={16} />
                        <span className="break-all">{userProfile.profileUrl}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Admin Actions */}
                {isAdmin && !isOwnProfile && (
                  <div className="flex gap-2 shrink-0 sm:pb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <Icon icon="solar:shield-check-bold" width={16} className="mr-1" />
                      <span className="hidden sm:inline">View Details</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-neutral-700 hover:bg-neutral-800 ${
                        userProfile.isActive ? "text-yellow-400" : "text-green-400"
                      }`}
                    >
                      <Icon
                        icon={userProfile.isActive ? "solar:shield-cross-bold" : "solar:shield-check-bold"}
                        width={16}
                        className="mr-1"
                      />
                      <span className="hidden sm:inline">
                        {userProfile.isActive ? "Ban" : "Activate"}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          {userStats && (
            <div className="mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 sm:p-5 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Icon icon="solar:palette-bold" width={16} className="sm:w-5 sm:h-5 text-purple-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {userStats.totalThemes}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-500">Total Themes</div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 sm:p-5 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Icon icon="solar:heart-bold" width={16} className="sm:w-5 sm:h-5 text-pink-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {userStats.totalLikes}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-500">Total Likes</div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 sm:p-5 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Icon icon="solar:eye-bold" width={16} className="sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {userStats.totalViews}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-500">Total Views</div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 sm:p-5 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Icon icon="solar:check-circle-bold" width={16} className="sm:w-5 sm:h-5 text-green-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-400">
                      {userStats.approvedThemes}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-500">Approved</div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 sm:p-5 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Icon icon="solar:clock-circle-bold" width={16} className="sm:w-5 sm:h-5 text-yellow-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
                      {userStats.pendingThemes}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-500">Pending</div>
                </div>
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {userStats?.categories && (
            <div className="mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Dark", "Light", "AMOLED", "Other"].map((category) => {
                  const count = userStats.categories[category as keyof typeof userStats.categories] || 0;
                  const percentage = totalCategories > 0 ? (count / totalCategories) * 100 : 0;
                  return (
                    <div key={category} className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-neutral-300">{category}</span>
                        <span className="text-lg font-bold text-white">{count}</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className={`${getCategoryColor(category)} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Themes Section */}
          <section className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {userProfile.username}'s Themes
                </h2>
                <p className="text-neutral-400 text-sm">
                  {userStats?.totalThemes || 0} theme{userStats?.totalThemes !== 1 ? "s" : ""} created
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-neutral-900/20 border border-neutral-800/50 p-1.5 rounded-xl backdrop-blur-sm">
              {/* Category Filter */}
              <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800/50 w-full sm:w-auto overflow-x-auto">
                {["All", "Dark", "Light", "AMOLED"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-lg px-4 py-2 text-xs font-medium transition-all whitespace-nowrap ${
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
                  <button className="shrink-0 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-all">
                    <Icon icon="solar:sort-vertical-linear" width={16} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      className="group border-neutral-800 bg-neutral-900/20 rounded-xl overflow-hidden transition-all hover:translate-y-[-2px] hover:border-neutral-700 hover:bg-neutral-900/40 hover:shadow-lg hover:shadow-black/50"
                    >
                      {theme.themeId ? (
                        <Link href={`/themes/${theme.themeId}`} className="block">
                          {/* Preview Placeholder */}
                          <div className="aspect-video w-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 flex items-center justify-center">
                            <Icon icon="solar:palette-bold" width={40} className="text-neutral-500" />
                          </div>

                          <div className="p-4 space-y-3">
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

                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                              <div className="flex items-center gap-1">
                                <Icon icon="solar:heart-bold" width={16} />
                                {theme.likesCount}
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon icon="solar:eye-bold" width={16} />
                                {theme.viewsCount}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="p-4 space-y-3">
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

                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                              <Icon icon="solar:heart-bold" width={16} />
                              {theme.likesCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon icon="solar:eye-bold" width={16} />
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
                        {selectedCategory !== "All"
                          ? `Try a different category filter`
                          : "This creator hasn't published any themes yet"}
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
