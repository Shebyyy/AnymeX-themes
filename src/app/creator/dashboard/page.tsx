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
}

export default function CreatorDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      let token = localStorage.getItem("creator_token");
      let response = await fetch("/api/creator/themes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok && !token) {
        token = localStorage.getItem("admin_token");
        response = await fetch("/api/creator/themes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (!response.ok) throw new Error("Failed to fetch themes");

      const data = await response.json();
      setThemes(data.themes || []);
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

  const tabs = [
    { id: "overview", label: "Overview", href: "/creator/dashboard?tab=overview" },
    { id: "themes", label: "My Themes", href: "/creator/dashboard?tab=themes" },
    { id: "profile", label: "Profile Settings", href: "/creator/dashboard?tab=profile" },
  ];

  const filteredThemes = themes.filter((theme) => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || theme.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalThemes = themes.length;
  const totalLikes = themes.reduce((sum, theme) => sum + theme.likesCount, 0);
  const totalViews = themes.reduce((sum, theme) => sum + theme.viewsCount, 0);

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

  // Overview Tab Content
  const renderOverview = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon="solar:gallery-wide-linear" label="Themes Created" value={totalThemes} />
        <StatCard icon="solar:heart-bold" label="Total Likes" value={totalLikes} />
        <StatCard icon="solar:eye-bold" label="Total Views" value={totalViews} />
      </div>

      {/* Quick Actions */}
      <QuickActionButtons
        actions={[
          {
            label: "+ Upload New Theme",
            icon: "solar:add-circle-bold",
            variant: "default",
            href: "#",
          },
          {
            label: "Manage Profile",
            icon: "solar:user-circle-linear",
            variant: "outline",
            href: "/profile",
          },
        ]}
        className="mb-6"
      />

      {/* Recent Themes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Your Recent Themes</h2>
        </div>

        {themes.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Icon icon="solar:gallery-wide-linear" width={48} className="mx-auto mb-4 text-neutral-600" />
            <p className="mb-4">No themes yet</p>
            <Button
              onClick={() => {
                // Open create dialog (will implement)
                alert("Upload feature coming soon!");
              }}
              className="bg-white text-black hover:bg-neutral-200"
            >
              <Icon icon="solar:add-circle-bold" width={18} className="mr-2" />
              Upload Your First Theme
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {themes.slice(0, 3).map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                showActions={false}
                showViewButton={true}
                viewButtonHref={`/themes/${theme.themeId}`}
              />
            ))}
            {themes.length > 3 && (
              <div className="text-center pt-4">
                <Link
                  href="/creator/dashboard?tab=themes"
                  className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1"
                >
                  View All Themes →
                  <Icon icon="solar:arrow-right-linear" width={16} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  // My Themes Tab Content
  const renderMyThemes = () => (
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
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              onClick={() => setCategoryFilter("all")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              All ({totalThemes})
            </Button>
            <Button
              variant={categoryFilter === "APPROVED" ? "default" : "outline"}
              onClick={() => setCategoryFilter("APPROVED")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              Approved ({themes.filter(t => t.status === "APPROVED").length})
            </Button>
            <Button
              variant={categoryFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setCategoryFilter("PENDING")}
              className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              Pending ({themes.filter(t => t.status === "PENDING").length})
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="mb-6">
        <Button
          onClick={() => {
            alert("Upload dialog - will implement");
          }}
          className="w-full bg-white text-black hover:bg-neutral-200"
        >
          <Icon icon="solar:add-circle-bold" width={18} className="mr-2" />
          Upload New Theme
        </Button>
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
              onEdit={(id) => alert(`Edit theme ${id}`)}
              onDelete={(id) => alert(`Delete theme ${id}`)}
            />
          ))}
        </div>
      )}
    </>
  );

  // Profile Tab Content
  const renderProfile = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-neutral-400 mb-2">Username</label>
            <Input
              defaultValue="your-username"
              className="bg-neutral-800 border-neutral-700 text-white"
              disabled
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 mb-2">Profile URL (optional)</label>
            <Input
              placeholder="https://github.com/yourusername"
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Link to your GitHub, social media, or personal website
            </p>
          </div>
          <Button className="bg-neutral-800 text-white hover:bg-neutral-700">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
        <Button
          variant="outline"
          className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
        >
          <Icon icon="solar:lock-keyhole-linear" width={16} className="mr-2" />
          Change Password
        </Button>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Details</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-neutral-400 mb-1">Role</label>
            <p className="text-white">THEME_CREATOR</p>
          </div>
          <div>
            <label className="text-sm text-neutral-400 mb-1">Joined</label>
            <p className="text-white">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "themes":
        return renderMyThemes();
      case "profile":
        return renderProfile();
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

              {/* Mobile Menu - Simplified for now */}
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
          <h1 className="text-3xl font-bold text-white mb-2">Creator Dashboard</h1>
          <p className="text-neutral-400">Manage your themes and profile</p>
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
