"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  role: string;
  profileUrl: string | null;
}

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
  themeJson: string;
  previewImage: string | null;
  creatorName: string | null;
  creator?: {
    id: string;
    username: string;
    profileUrl: string | null;
  };
}

interface Stats {
  myThemes?: number;
  totalViews?: number;
  totalLikes?: number;
  growthPercent?: number;
  totalUsers?: number;
  pendingThemes?: number;
  totalThemes?: number;
  newUsersThisWeek?: number;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}

export default function UnifiedDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  
  // Upload form
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "",
    themeJson: "",
    previewImage: "",
  });
  const [uploading, setUploading] = useState(false);
  
  // Edit form
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    themeJson: "",
    previewImage: "",
  });
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    checkAuth();
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  const checkAuth = async () => {
    const creatorToken = localStorage.getItem("creator_token");
    const adminToken = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("creator_user") || localStorage.getItem("admin_user");
    
    if ((creatorToken || adminToken) && userStr) {
      try {
        const token = creatorToken || adminToken;
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setUserRole(data.user.role);
        } else {
          localStorage.clear();
          router.push("/auth");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth");
      }
    } else {
      router.push("/auth");
    }
  };
  
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("creator_token") || localStorage.getItem("admin_token");
      
      // Fetch user stats
      const statsRes = await fetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      // Fetch themes
      const themesRes = await fetch("/api/creator/themes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (themesRes.ok) {
        const themesData = await themesRes.json();
        setThemes(themesData.themes || []);
      }
      
      // Fetch activities
      const activityRes = await fetch("/api/dashboard/activity", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.activities || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("creator_token") || localStorage.getItem("admin_token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      setUser(null);
      setUserRole(null);
      router.push("/auth");
    }
  };
  
  const handleUploadTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const token = localStorage.getItem("creator_token") || localStorage.getItem("admin_token");
      const response = await fetch("/api/creator/themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(uploadForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to upload theme");
      
      toast({
        title: "Theme uploaded successfully! 🎉",
        description: `${uploadForm.name} has been added to your collection`,
      });
      
      setUploadDialogOpen(false);
      setUploadForm({ name: "", description: "", category: "", themeJson: "", previewImage: "" });
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleUpdateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTheme) return;
    
    setEditing(true);
    
    try {
      const token = localStorage.getItem("creator_token") || localStorage.getItem("admin_token");
      const response = await fetch(`/api/creator/themes/${selectedTheme.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to update theme");
      
      toast({
        title: "Theme updated successfully! ✨",
      });
      
      setEditDialogOpen(false);
      setSelectedTheme(null);
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setEditing(false);
    }
  };
  
  const handleDeleteTheme = async () => {
    if (!selectedTheme) return;
    
    setDeleting(true);
    
    try {
      const token = localStorage.getItem("creator_token") || localStorage.getItem("admin_token");
      const response = await fetch(`/api/creator/themes/${selectedTheme.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to delete theme");
      
      toast({
        title: "Theme deleted successfully! 🗑️",
      });
      
      setDeleteDialogOpen(false);
      setSelectedTheme(null);
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "An error occurred",
      });
    } finally {
      setDeleting(false);
    }
  };
  
  const openEditDialog = (theme: Theme) => {
    setSelectedTheme(theme);
    setEditForm({
      name: theme.name,
      description: theme.description || "",
      category: theme.category || "",
      themeJson: theme.themeJson,
      previewImage: theme.previewImage || "",
    });
    setEditDialogOpen(true);
  };
  
  const openDeleteDialog = (theme: Theme) => {
    setSelectedTheme(theme);
    setDeleteDialogOpen(true);
  };
  
  const handleShare = async (themeId: string) => {
    const shareUrl = `${window.location.origin}/themes/${themeId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share URL has been copied to your clipboard",
    });
  };
  
  const getRoleBadge = () => {
    const badges = {
      THEME_CREATOR: { text: "Creator", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      ADMIN: { text: "Admin", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      SUPER_ADMIN: { text: "Super Admin", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
    };
    const badge = badges[userRole as keyof typeof badges] || badges.THEME_CREATOR;
    return (
      <Badge variant="outline" className={badge.color}>
        <Icon icon="solar:shield-check-bold" width={12} className="mr-1" />
        {badge.text}
      </Badge>
    );
  };
  
  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
      BROKEN: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors] || colors.PENDING}>
        {status}
      </Badge>
    );
  };
  
  const getStatCards = () => {
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return [
        {
          title: "Total Users",
          value: stats?.totalUsers || 0,
          icon: "solar:users-group-rounded-bold",
          color: "bg-blue-500/10 text-blue-500",
          borderColor: "border-neutral-800",
        },
        {
          title: "Total Themes",
          value: stats?.totalThemes || 0,
          icon: "solar:gallery-wide-bold",
          color: "bg-purple-500/10 text-purple-500",
          borderColor: "border-neutral-800",
        },
        {
          title: "Pending Review",
          value: stats?.pendingThemes || 0,
          icon: "solar:clock-circle-bold",
          color: "bg-yellow-500/10 text-yellow-500",
          borderColor: "border-neutral-800",
        },
        {
          title: "New This Week",
          value: stats?.newUsersThisWeek || 0,
          icon: "solar:user-plus-bold",
          color: "bg-green-500/10 text-green-500",
          borderColor: "border-neutral-800",
        },
      ];
    }
    
    return [
      {
        title: "My Themes",
        value: stats?.myThemes || 0,
        icon: "solar:gallery-wide-bold",
        color: "bg-purple-500/10 text-purple-500",
        borderColor: "border-neutral-800",
      },
      {
        title: "Total Views",
        value: stats?.totalViews || 0,
        icon: "solar:eye-bold",
        color: "bg-blue-500/10 text-blue-500",
        borderColor: "border-neutral-800",
      },
      {
        title: "Total Likes",
        value: stats?.totalLikes || 0,
        icon: "solar:heart-bold",
        color: "bg-red-500/10 text-red-500",
        borderColor: "border-neutral-800",
      },
      {
        title: "Growth",
        value: `+${stats?.growthPercent || 0}%`,
        icon: "solar:graph-up-bold",
        color: "bg-green-500/10 text-green-500",
        borderColor: "border-neutral-800",
      },
    ];
  };
  
  const getQuickActions = () => {
    const baseActions = [
      {
        icon: "solar:upload-minimalistic-bold",
        label: "Upload Theme",
        description: "Share your creation",
        action: () => setUploadDialogOpen(true),
        color: "bg-purple-500/10 text-purple-500",
      },
      {
        icon: "solar:chart-bold",
        label: "Analytics",
        description: "View your stats",
        action: () => router.push("/analytics"),
        color: "bg-blue-500/10 text-blue-500",
      },
      {
        icon: "solar:settings-bold",
        label: "Settings",
        description: "Manage account",
        action: () => router.push("/settings"),
        color: "bg-neutral-500/10 text-neutral-500",
      },
    ];
    
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return [
        ...baseActions,
        {
          icon: "solar:users-group-rounded-bold",
          label: "Manage Users",
          description: "User management",
          action: () => router.push("/admin/users"),
          color: "bg-green-500/10 text-green-500",
        },
        {
          icon: "solar:check-read-bold",
          label: "Review Themes",
          description: "Approve pending",
          action: () => router.push("/admin/themes?status=PENDING"),
          color: "bg-yellow-500/10 text-yellow-500",
        },
        {
          icon: "solar:document-text-bold",
          label: "Activity Log",
          description: "View recent actions",
          action: () => router.push("/admin/activity"),
          color: "bg-indigo-500/10 text-indigo-500",
        },
      ];
    }
    
    return [
      ...baseActions,
      {
        icon: "solar:book-bookmark-bold",
        label: "Documentation",
        description: "Learn more",
        action: () => router.push("/docs"),
        color: "bg-emerald-500/10 text-emerald-500",
      },
      {
        icon: "solar:help-circle-bold",
        label: "Help Center",
        description: "Get support",
        action: () => router.push("/help"),
        color: "bg-orange-500/10 text-orange-500",
      },
    ];
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <DashboardHeader user={null} onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border border-neutral-800 bg-neutral-900/40">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border border-neutral-800 bg-neutral-900/40">
                <Skeleton className="h-48 w-full" />
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }
  
  const statCards = getStatCards();
  const quickActions = getQuickActions();
  
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300">
      <DashboardHeader user={user} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, {user?.username}!
                </h1>
                {getRoleBadge()}
              </div>
              <p className="text-neutral-400">
                {userRole === "ADMIN" || userRole === "SUPER_ADMIN"
                  ? `${stats?.pendingThemes || 0} themes are pending review. Platform is running smoothly!`
                  : `You have ${stats?.myThemes || 0} themes with ${stats?.totalViews || 0} total views!`
                }
              </p>
            </div>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-white text-black hover:bg-neutral-200"
            >
              <Icon icon="solar:add-circle-bold" width={18} className="mr-2" />
              Upload New Theme
            </Button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className={`border ${stat.borderColor} bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60 transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-lg ${stat.color}`}>
                    <Icon icon={stat.icon} width={20} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800 transition-all text-left"
              >
                <div className={`p-2.5 rounded-lg ${action.color} shrink-0`}>
                  <Icon icon={action.icon} width={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{action.label}</p>
                  <p className="text-xs text-neutral-500 truncate">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* My Themes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? "All Themes" : "My Themes"}
            </h2>
            <Link href="/themes">
              <Button variant="outline" className="border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800">
                View All
                <Icon icon="solar:alt-arrow-right-linear" width={16} className="ml-2" />
              </Button>
            </Link>
          </div>
          
          {themes.length === 0 ? (
            <Card className="border border-neutral-800 bg-neutral-900/40 p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center">
                  <Icon icon="solar:gallery-wide-linear" className="text-neutral-400" width={32} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No themes yet</h3>
              <p className="text-neutral-400 mb-6">
                {userRole === "ADMIN" || userRole === "SUPER_ADMIN"
                  ? "There are no themes in the platform yet"
                  : "Upload your first theme to get started"
                }
              </p>
              <Button
                onClick={() => setUploadDialogOpen(true)}
                className="bg-white text-black hover:bg-neutral-200"
              >
                <Icon icon="solar:add-circle-bold" width={18} className="mr-2" />
                Upload Your First Theme
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {themes.slice(0, 8).map((theme) => (
                <Card key={theme.id} className="border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60 transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {theme.name}
                        </h3>
                        {theme.category && (
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs mb-2">
                            {theme.category}
                          </Badge>
                        )}
                      </div>
                      {getStatusBadge(theme.status)}
                    </div>
                    
                    {theme.description && (
                      <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                        {theme.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Icon icon="solar:heart-bold" width={16} />
                        <span>{theme.likesCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon icon="solar:eye-bold" width={16} />
                        <span>{theme.viewsCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {theme.themeId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(theme.themeId!)}
                          className="border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                          <Icon icon="solar:share-linear" width={16} />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(theme)}
                        className="flex-1 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800"
                      >
                        <Icon icon="solar:pen-bold" width={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(theme)}
                        className="border-red-800/50 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      >
                        <Icon icon="solar:trash-bin-minimalistic-bold" width={16} />
                      </Button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <p className="text-xs text-neutral-600">
                        Uploaded {new Date(theme.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Activity Feed */}
        {activities.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <Link href="/dashboard/activity">
                <Button variant="outline" className="border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800">
                  View All
                  <Icon icon="solar:alt-arrow-right-linear" width={16} className="ml-2" />
                </Button>
              </Link>
            </div>
            
            <Card className="border border-neutral-800 bg-neutral-900/40">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg ${activity.color} shrink-0`}>
                        <Icon icon={activity.icon} width={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-300">{activity.message}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Admin Only Section */}
        {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              <Icon icon="solar:shield-check-bold" width={20} className="inline mr-2 text-indigo-400" />
              Admin Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-indigo-800/50 bg-indigo-950/30">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-indigo-200">
                    Platform Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-300">Total Themes</span>
                      <span className="text-sm font-semibold text-indigo-100">{stats?.totalThemes || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-300">Pending</span>
                      <span className="text-sm font-semibold text-yellow-500">{stats?.pendingThemes || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-300">Active Users</span>
                      <span className="text-sm font-semibold text-indigo-100">{stats?.totalUsers || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-indigo-800/50 bg-indigo-950/30">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-indigo-200">
                    Quick Admin Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/admin/themes?status=PENDING">
                      <Button variant="outline" className="w-full justify-start border-indigo-800/50 text-indigo-300 hover:bg-indigo-900/50">
                        <Icon icon="solar:check-read-bold" width={16} className="mr-2" />
                        Review Pending Themes
                      </Button>
                    </Link>
                    <Link href="/admin/users">
                      <Button variant="outline" className="w-full justify-start border-indigo-800/50 text-indigo-300 hover:bg-indigo-900/50">
                        <Icon icon="solar:users-group-rounded-bold" width={16} className="mr-2" />
                        Manage Users
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-indigo-800/50 bg-indigo-950/30">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-indigo-200">
                    Recent Admin Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-2 text-sm">
                        <Icon icon={activity.icon} width={14} className="text-indigo-400" />
                        <span className="text-indigo-300 truncate">{activity.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      {/* Upload Theme Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-neutral-900 border border-neutral-800 text-neutral-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Upload New Theme</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Share your custom theme with the community
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadTheme} className="space-y-4">
            <div>
              <Label htmlFor="name">Theme Name *</Label>
              <Input
                id="name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white mt-2 focus:border-neutral-600"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[100px] focus:border-neutral-600"
                placeholder="Describe your theme..."
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem value="Dark">Dark</SelectItem>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="AMOLED">AMOLED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="previewImage">Preview Image *</Label>
              <Input
                id="previewImage"
                value={uploadForm.previewImage}
                onChange={(e) => setUploadForm({ ...uploadForm, previewImage: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white mt-2 focus:border-neutral-600"
                placeholder="https://example.com/preview.jpg"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">Enter the URL to your preview image</p>
            </div>
            <div>
              <Label htmlFor="themeJson">Theme JSON *</Label>
              <Textarea
                id="themeJson"
                value={uploadForm.themeJson}
                onChange={(e) => setUploadForm({ ...uploadForm, themeJson: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[200px] font-mono text-sm focus:border-neutral-600"
                placeholder='{"id": "my-theme", "name": "My Theme", ...}'
                required
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="bg-white text-black hover:bg-neutral-200"
              >
                {uploading ? "Uploading..." : "Upload Theme"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Theme Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-neutral-900 border border-neutral-800 text-neutral-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Theme</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Update your theme information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTheme} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Theme Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white mt-2 focus:border-neutral-600"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[100px] focus:border-neutral-600"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem value="Dark">Dark</SelectItem>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="AMOLED">AMOLED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-previewImage">Preview Image</Label>
              <Input
                id="edit-previewImage"
                value={editForm.previewImage}
                onChange={(e) => setEditForm({ ...editForm, previewImage: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white mt-2 focus:border-neutral-600"
                placeholder="https://example.com/preview.jpg"
              />
            </div>
            <div>
              <Label htmlFor="edit-themeJson">Theme JSON</Label>
              <Textarea
                id="edit-themeJson"
                value={editForm.themeJson}
                onChange={(e) => setEditForm({ ...editForm, themeJson: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[200px] font-mono text-sm focus:border-neutral-600"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editing}
                className="bg-white text-black hover:bg-neutral-200"
              >
                {editing ? "Updating..." : "Update Theme"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border border-neutral-800 text-neutral-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Theme?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete "{selectedTheme?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTheme}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DashboardHeader({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem("creator_token") || localStorage.getItem("admin_token");
        const response = await fetch("/api/dashboard/pending-count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching pending count:", error);
      }
    };
    
    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
      fetchPendingCount();
    }
  }, [user]);
  
  return (
    <header className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="https://raw.githubusercontent.com/RyanYuuki/AnymeX/main/assets/images/logo_transparent.png"
              alt="AnymeX"
              className="w-8 h-8"
            />
            <span className="text-lg font-semibold text-white">AnymeX Themes</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Browse Themes
            </Link>
            <Link href="/docs" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Docs
            </Link>
            {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
              <Link href="/admin/users" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Manage Users
              </Link>
            )}
          </nav>
          
          <div className="flex items-center gap-3">
            {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
              <Link href="/admin/themes?status=PENDING" className="relative">
                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-neutral-800">
                  <Icon icon="solar:bell-bold" width={20} />
                </Button>
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-neutral-300 hover:bg-neutral-800">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                    <Icon icon="solar:user-circle-bold" width={20} className="text-neutral-400" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{user?.username}</span>
                  <Icon icon="solar:alt-arrow-down-linear" width={16} className="text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-neutral-900 border border-neutral-800 w-56">
                <div className="px-3 py-2 border-b border-neutral-800">
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-neutral-500 capitalize">{user?.role?.toLowerCase().replace("_", " ")}</p>
                </div>
                <DropdownMenuSeparator className="bg-neutral-800" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer text-neutral-300 hover:text-white hover:bg-neutral-800">
                    <Icon icon="solar:user-linear" width={16} className="mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer text-neutral-300 hover:text-white hover:bg-neutral-800">
                    <Icon icon="solar:settings-bold" width={16} className="mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-800" />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/30"
                >
                  <Icon icon="solar:logout-2-linear" width={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
