"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/hooks/use-toast";
import { DashboardTabs, StatCard, QuickActionButtons, ThemeCard } from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Theme {
  id: string;
  themeId: string | null;
  name: string;
  description: string | null;
  category: string | null;
  status: string;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  previewImage: string | null;
  creator?: {
    username: string;
  };
}

interface User {
  id: string;
  username: string;
  role: string;
  email?: string | null;
  createdAt: string;
  isActive: boolean;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch themes
      const token = localStorage.getItem("admin_token");
      const [themesRes, usersRes] = await Promise.all([
        fetch("/api/admin/themes", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [themesData, usersData] = await Promise.all([
        themesRes.json(),
        usersRes.json(),
      ]);

      if (!themesRes.ok) throw new Error("Failed to fetch themes");
      if (!usersRes.ok) throw new Error("Failed to fetch users");

      setThemes(themesData.themes || []);
      setUsers(usersData.users || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", href: "/admin/dashboard?tab=overview" },
    { id: "themes", label: "Themes", href: "/admin/dashboard?tab=themes" },
    { id: "users", label: "Users", href: "/admin/dashboard?tab=users" },
  ];

  const pendingThemesCount = themes.filter((t) => t.status === "PENDING").length;

  const filteredThemes = themes.filter((theme) => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || theme.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">✅ Approved</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">⏳ Pending</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">❌ Rejected</Badge>;
      case "BROKEN":
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">⚠️ Broken</Badge>;
      default:
        return <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string, isActive: boolean) => {
    if (isActive) return null;
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">ADMIN</Badge>;
      case "SUPER_ADMIN":
        return <Badge className="bg-pink-500/10 text-pink-400 border-pink-500/20">SUPER_ADMIN</Badge>;
      case "THEME_CREATOR":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">CREATOR</Badge>;
      default:
        return <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20">{role}</Badge>;
    }
  };

  const handleApproveTheme = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/themes/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to approve theme");

      toast({
        title: "Theme approved! ✅",
        description: "The theme is now visible to all users",
      });

      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve theme",
      });
    }
  };

  const handleRejectTheme = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/themes/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "REJECTED" }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to reject theme");

      toast({
        title: "Theme rejected ❌",
        description: "The theme has been rejected",
      });

      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject theme",
      });
    }
  };

  const handleDeleteTheme = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/themes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete theme");

      toast({
        title: "Theme deleted 🗑️",
        description: "The theme has been permanently deleted",
      });

      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete theme",
      });
    }
  };

  const handleBanUser = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: false }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to ban user");

      toast({
        title: "User banned 🔨",
        description: "The user has been banned",
      });

      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to ban user",
      });
    }
  };

  const handleUnbanUser = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: true }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to unban user");

      toast({
        title: "User unbanned 🔓",
        description: "The user has been unbanned",
      });

      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unban user",
      });
    }
  };

  // Overview Tab Content
  const renderOverview = () => {
    const approvedCount = themes.filter((t) => t.status === "APPROVED").length;
    const creatorCount = users.filter((u) => u.role === "THEME_CREATOR").length;
    const todayJoined = users.filter((u) => {
      const joinDate = new Date(u.createdAt);
      const today = new Date();
      return (
        joinDate.getDate() === today.getDate() &&
        joinDate.getMonth() === today.getMonth() &&
        joinDate.getFullYear() === today.getFullYear()
      );
    }).length;

    return (
      <>
        {/* System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon="solar:gallery-wide-linear" label="Total Themes" value={themes.length} />
          <StatCard
            icon="solar:clock-circle-linear"
            label="Pending Review"
            value={pendingThemesCount}
          />
          <StatCard icon="solar:users-group-rounded-linear" label="Total Users" value={users.length} />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon="solar:check-circle-linear" label="Approved" value={approvedCount} />
          <StatCard icon="solar:user-circle-linear" label="Creators" value={creatorCount} />
          <StatCard icon="solar:calendar-linear" label="Joined Today" value={todayJoined} />
        </div>

        {/* Quick Actions */}
        <QuickActionButtons
          actions={[
            {
              label: pendingThemesCount > 0
                ? `Review Pending Themes (${pendingThemesCount})`
                : "Review Themes",
              icon: "solar:shield-check-bold",
              variant: "default",
              href: "#",
            },
            {
              label: "Manage Users",
              icon: "solar:users-group-rounded-linear",
              variant: "outline",
              href: "#",
            },
          ]}
          className="mb-6"
        />

        {/* Pending Themes (if any) */}
        {pendingThemesCount > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              ⚠️ Pending Review ({pendingThemesCount})
            </h2>
            <div className="space-y-4">
              {themes
                .filter((t) => t.status === "PENDING")
                .slice(0, 3)
                .map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    showActions={false}
                    showViewButton={true}
                    viewButtonHref={`/themes/${theme.themeId}`}
                  />
                ))}
              {pendingThemesCount > 3 && (
                <div className="text-center pt-2">
                  <Link
                    href="/admin/dashboard?tab=themes&status=PENDING"
                    className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1"
                  >
                    View All Pending →
                    <Icon icon="solar:arrow-right-linear" width={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity (simplified) */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {themes.slice(0, 5).map((theme) => (
              <div key={theme.id} className="flex items-center gap-3 text-sm py-2 border-b border-neutral-800/50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                  <Icon icon="solar:gallery-add-linear" width={16} className="text-neutral-400" />
                </div>
                <div className="flex-1">
                  <span className="text-neutral-300">
                    Theme <strong>"{theme.name}"</strong> submitted
                  </span>
                  <span className="text-neutral-500 ml-2">by {theme.creator?.username || "Unknown"}</span>
                </div>
                <div className="text-xs text-neutral-500">
                  {formatDate(theme.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // Themes Tab Content
  const renderThemes = () => (
    <>
      {/* Search & Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon
                icon="solar:magnifer-linear"
                width={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <Input
                placeholder="Search themes by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              All ({themes.length})
            </Button>
            <Button
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              Pending ({themes.filter(t => t.status === "PENDING").length})
            </Button>
            <Button
              variant={statusFilter === "APPROVED" ? "default" : "outline"}
              onClick={() => setStatusFilter("APPROVED")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              Approved ({themes.filter(t => t.status === "APPROVED").length})
            </Button>
            <Button
              variant={statusFilter === "REJECTED" ? "default" : "outline"}
              onClick={() => setStatusFilter("REJECTED")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              Rejected ({themes.filter(t => t.status === "REJECTED").length})
            </Button>
          </div>
        </div>
      </div>

      {/* Themes List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-neutral-900/30 border border-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <Icon icon="solar:search-linear" width={48} className="mx-auto mb-4 text-neutral-600" />
          <p>No themes found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              showActions={true}
              showViewButton={true}
              viewButtonHref={`/themes/${theme.themeId}`}
              onEdit={() => alert(`Edit theme ${theme.name}`)}
              onDelete={() => {
                if (confirm(`Are you sure you want to delete "${theme.name}"?`)) {
                  handleDeleteTheme(theme.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </>
  );

  // Users Tab Content
  const renderUsers = () => (
    <>
      {/* Search & Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon
                icon="solar:magnifer-linear"
                width={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <Input
                placeholder="Search users by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={userRoleFilter === "all" ? "default" : "outline"}
              onClick={() => setUserRoleFilter("all")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              All ({users.length})
            </Button>
            <Button
              variant={userRoleFilter === "THEME_CREATOR" ? "default" : "outline"}
              onClick={() => setUserRoleFilter("THEME_CREATOR")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              Creators ({users.filter((u) => u.role === "THEME_CREATOR").length})
            </Button>
            <Button
              variant={userRoleFilter === "ADMIN" ? "default" : "outline"}
              onClick={() => setUserRoleFilter("ADMIN")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              Admins ({users.filter((u) => u.role === "ADMIN").length})
            </Button>
            <Button
              variant={userRoleFilter === "SUPER_ADMIN" ? "default" : "outline"}
              onClick={() => setUserRoleFilter("SUPER_ADMIN")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              Super Admins ({users.filter((u) => u.role === "SUPER_ADMIN").length})
            </Button>
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-neutral-900/30 border border-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <Icon icon="solar:search-linear" width={48} className="mx-auto mb-4 text-neutral-600" />
          <p>No users found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">
                    {user.username}
                  </span>
                  {getRoleBadge(user.role, false)}
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>{user.email || "No email"}</span>
                  <span>•</span>
                  <span>{formatDate(user.createdAt)}</span>
                  <span>•</span>
                  <span className={user.isActive ? "text-green-400" : "text-red-400"}>
                    {user.isActive ? "Active" : "Banned"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {user.isActive ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBanUser(user.id)}
                    className="border-red-700 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Icon icon="solar:shield-lock-linear" width={14} className="mr-1" />
                    Ban
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnbanUser(user.id)}
                    className="border-green-700 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                  >
                    <Icon icon="solar:lock-unlock-linear" width={14} className="mr-1" />
                    Unban
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                  title="View Profile"
                >
                  <Icon icon="solar:eye-linear" width={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "themes":
        return renderThemes();
      case "users":
        return renderUsers();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased flex flex-col">
      {/* Main Navigation - Same as Home */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl rounded-full border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-all sm:w-[95%]">
        <div className="px-4 sm:px-6 pl-2">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0 cursor-pointer pl-2">
              <img
                src="https://raw.githubusercontent.com/RyanYuuki/AnymeX/main/assets/images/logo_transparent.png"
                alt="AnymeX"
                className="w-8 h-8"
              />
              <span className="text-sm font-semibold tracking-tight text-white">AnymeX</span>
            </Link>

            <div className="flex items-center gap-1">
              <a
                href="/docs"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Docs
              </a>

              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Profile
              </Link>

              <div className="h-4 w-px bg-neutral-800 mx-2 hidden sm:block"></div>

              <a
                href="https://github.com/RyanYuuki/AnymeX"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-neutral-800 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-700 border border-neutral-700 transition-colors inline-flex items-center justify-center"
              >
                Get App
              </a>

              {/* Mobile Menu */}
              <div className="flex md:hidden">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  <Icon icon="solar:user-circle-linear" width={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-neutral-400">Manage themes, users, and platform settings</p>
        </div>

        {/* Dashboard Tabs */}
        <DashboardTabs tabs={tabs} activeTab={activeTab} />

        {/* Content */}
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-neutral-600">
            © 2024 AnymeX Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
