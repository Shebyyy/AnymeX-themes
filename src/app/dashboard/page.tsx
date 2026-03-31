"use client";

import { useEffect, useState, useRef } from "react";
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
  totalUsers?: number;
  pendingThemes?: number;
  totalThemes?: number;
  themeCreatorsCount?: number;
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
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [themeJsonFile, setThemeJsonFile] = useState<File | null>(null);
  const [isDraggingJson, setIsDraggingJson] = useState(false);
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  // File input refs
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const previewFileInputRef = useRef<HTMLInputElement>(null);
  
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
      let previewImageUrl = uploadForm.previewImage;
      let themeJsonContent = uploadForm.themeJson;

      // Upload preview image file if provided
      if (previewImageFile) {
        try {
          previewImageUrl = await handleUploadFile(previewImageFile);
        } catch (error) {
          throw new Error("Failed to upload preview image: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      }

      // Read theme JSON file if provided
      if (themeJsonFile) {
        try {
          themeJsonContent = await themeJsonFile.text();
        } catch (error) {
          throw new Error("Failed to read theme JSON file");
        }
      }

      // Validate required fields
      if (!uploadForm.name || !themeJsonContent) {
        throw new Error("Theme name and JSON are required");
      }

      if (!previewImageUrl) {
        throw new Error("Preview image is required");
      }

      const token = localStorage.getItem("creator_token") || localStorage.getItem("admin_token");
      const response = await fetch("/api/creator/themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: uploadForm.name,
          description: uploadForm.description,
          category: uploadForm.category,
          themeJson: themeJsonContent,
          previewImage: previewImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to upload theme");

      toast({
        title: "Theme uploaded successfully! 🎉",
        description: `${uploadForm.name} has been added to your collection`,
      });

      setUploadDialogOpen(false);
      setUploadForm({ name: "", description: "", category: "", themeJson: "", previewImage: "" });
      setPreviewImageFile(null);
      setPreviewImageUrl("");
      setThemeJsonFile(null);
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
      if (previewFileInputRef.current) previewFileInputRef.current.value = "";
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

  const handleUploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  // Process JSON file
  const processJsonFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JSON file",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const json = JSON.parse(content);

        // Auto-fill form fields if possible
        const updatedForm = { ...uploadForm, themeJson: content };

        if (json.name && !uploadForm.name) {
          updatedForm.name = json.name;
        }

        if (json.description && !uploadForm.description) {
          updatedForm.description = json.description;
        }

        if (json.category && !uploadForm.category) {
          updatedForm.category = json.category;
        }

        setUploadForm(updatedForm);
        setThemeJsonFile(file);

        toast({
          title: "File uploaded successfully! 📁",
          description: `${file.name} has been loaded`,
        });
      } catch {
        toast({
          variant: "destructive",
          title: "Invalid JSON",
          description: "The file contains invalid JSON",
        });
      }
    };
    reader.readAsText(file);
  };

  // Process preview image file
  const processPreviewImageFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 5MB",
      });
      return;
    }

    try {
      const url = await handleUploadFile(file);
      setPreviewImageFile(file);
      setPreviewImageUrl(url);
      setUploadForm({ ...uploadForm, previewImage: url });

      toast({
        title: "Preview image uploaded! 📸",
        description: file.name,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload preview image",
      });
    }
  };

  // Clear functions
  const clearJsonFile = () => {
    setThemeJsonFile(null);
    setUploadForm({ ...uploadForm, themeJson: "" });
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.value = "";
    }
  };

  const clearPreviewImage = async () => {
    if (previewImageUrl) {
      const filename = previewImageUrl.split('/').pop();
      try {
        await fetch(`/api/upload?filename=${filename}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to delete preview image:', error);
      }
    }
    setPreviewImageFile(null);
    setPreviewImageUrl("");
    setUploadForm({ ...uploadForm, previewImage: "" });
    if (previewFileInputRef.current) {
      previewFileInputRef.current.value = "";
    }
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
          href: "/admin/users",
        },
        {
          title: "Total Themes",
          value: stats?.totalThemes || 0,
          icon: "solar:gallery-wide-bold",
          color: "bg-purple-500/10 text-purple-500",
          borderColor: "border-neutral-800",
          href: "/admin/themes",
        },
        {
          title: "Pending Themes",
          value: stats?.pendingThemes || 0,
          icon: "solar:clock-circle-bold",
          color: "bg-yellow-500/10 text-yellow-500",
          borderColor: "border-neutral-800",
          href: "/admin/themes?status=PENDING",
        },
        {
          title: "Approved Themes",
          value: stats?.totalThemes || 0,
          icon: "solar:check-circle-bold",
          color: "bg-green-500/10 text-green-500",
          borderColor: "border-neutral-800",
          href: "/admin/themes?status=APPROVED",
        },
        {
          title: "Theme Creators",
          value: stats?.themeCreatorsCount || 0,
          icon: "solar:users-rounded-bold",
          color: "bg-cyan-500/10 text-cyan-500",
          borderColor: "border-neutral-800",
          href: "/admin/users",
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
    ];
  };
  
  const getQuickActions = () => {
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return [
        {
          icon: "solar:user-plus-bold",
          label: "Create User",
          description: "Add new user",
          action: () => router.push("/admin/users?action=create"),
          color: "bg-blue-500/10 text-blue-500",
        },
        {
          icon: "solar:user-circle-plus-bold",
          label: "Add Creator",
          description: "Register creator",
          action: () => router.push("/creator/register"),
          color: "bg-purple-500/10 text-purple-500",
        },
        {
          icon: "solar:home-2-bold",
          label: "Creator Hub",
          description: "Go to dashboard",
          action: () => router.push("/dashboard"),
          color: "bg-cyan-500/10 text-cyan-500",
        },
        {
          icon: "solar:check-read-bold",
          label: "Review Themes",
          description: "Approve pending",
          action: () => router.push("/admin/themes?status=PENDING"),
          color: "bg-yellow-500/10 text-yellow-500",
        },
        {
          icon: "solar:shield-warning-bold",
          label: "Clean Broken",
          description: "Fix broken themes",
          action: () => router.push("/admin/themes?status=BROKEN"),
          color: "bg-red-500/10 text-red-500",
        },
        {
          icon: "solar:global-bold",
          label: "View Site",
          description: "Go to homepage",
          action: () => router.push("/"),
          color: "bg-green-500/10 text-green-500",
        },
      ];
    }
    
    const creatorActions = [
      {
        icon: "solar:upload-minimalistic-bold",
        label: "Upload Theme",
        description: "Share your creation",
        action: () => setUploadDialogOpen(true),
        color: "bg-purple-500/10 text-purple-500",
      },
      {
        icon: "solar:user-circle-bold",
        label: "My Profile",
        description: "Edit your profile",
        action: () => router.push("/profile"),
        color: "bg-blue-500/10 text-blue-500",
      },
      {
        icon: "solar:book-bookmark-bold",
        label: "Documentation",
        description: "Learn more",
        action: () => router.push("/docs"),
        color: "bg-emerald-500/10 text-emerald-500",
      },
      {
        icon: "solar:global-bold",
        label: "View Site",
        description: "Go to homepage",
        action: () => router.push("/"),
        color: "bg-orange-500/10 text-orange-500",
      },
    ];
    
    return creatorActions;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={null} onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="modern-surface">
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
              <Card key={i} className="modern-surface">
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
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader user={user} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold modern-gradient-text">
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
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              <Icon icon="solar:add-circle-bold" width={18} className="mr-2" />
              Upload New Theme
            </Button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link key={index} href={stat.href || "#"} className={stat.href ? "" : "pointer-events-none"}>
              <Card className={`h-full border-border bg-card/70 ${stat.href ? "hover:border-primary/40 hover:bg-card/90 cursor-pointer" : ""} transition-shadow`}>
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
            </Link>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className={`grid gap-4 ${userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/70 hover:border-primary/40 hover:bg-card transition-all text-left"
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
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">
                {userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? "All Themes" : "My Themes"}
              </h2>
              {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 text-xs">
                  <Icon icon="solar:shield-bold" width={12} className="mr-1" />
                  Admin View
                </Badge>
              )}
            </div>
            <Link href="/themes">
              <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-card">
                View All
                <Icon icon="solar:alt-arrow-right-linear" width={16} className="ml-2" />
              </Button>
            </Link>
          </div>
          
          {themes.length === 0 ? (
            <Card className="modern-surface p-12 text-center">
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
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                <Icon icon="solar:add-circle-bold" width={18} className="mr-2" />
                Upload Your First Theme
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {themes.slice(0, 8).map((theme) => (
                <Card key={theme.id} className="border border-border bg-card/70 hover:border-primary/40 hover:bg-card transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {theme.name}
                        </h3>
                        <p className="text-xs text-neutral-500 font-mono mb-2">
                          {theme.themeId || "N/A"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {theme.category && (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs">
                              {theme.category}
                            </Badge>
                          )}
                          {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && theme.creatorName && (
                            theme.creator ? (
                              <Link href={`/users/${theme.creator.username}`}>
                                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 text-xs hover:bg-cyan-500/20 transition-colors">
                                  <Icon icon="solar:user-bold" width={10} className="mr-1" />
                                  {theme.creatorName}
                                </Badge>
                              </Link>
                            ) : (
                              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 text-xs">
                                <Icon icon="solar:user-bold" width={10} className="mr-1" />
                                {theme.creatorName}
                              </Badge>
                            )
                          )}
                        </div>
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
                        <Link href={`/themes/${theme.themeId}`} className="flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800"
                          >
                            <Icon icon="solar:external-link-linear" width={16} />
                          </Button>
                        </Link>
                      )}
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
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            
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

            {/* Preview Image Upload */}
            <div>
              <Label htmlFor="previewImageCreate">
                Preview Image * <span className="text-neutral-500 font-normal">(Required for Discord)</span>
              </Label>
              <input
                type="file"
                ref={previewFileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processPreviewImageFile(file);
                }}
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
              />
              <div
                onClick={() => previewFileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) processPreviewImageFile(file);
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingPreview(true); }}
                onDragLeave={() => setIsDraggingPreview(false)}
                className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all mb-3 ${
                  previewImageUrl
                    ? "border-green-500 bg-green-500/10"
                    : isDraggingPreview
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-800"
                }`}
              >
                {previewImageUrl ? (
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src={previewImageUrl}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {previewImageFile?.name || 'Preview image'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {(previewImageFile?.size || 0) / 1024} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearPreviewImage();
                      }}
                      className="ml-auto text-neutral-400 hover:text-white transition-colors"
                    >
                      <Icon icon="solar:close-circle-bold" width={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Icon
                      icon="solar:gallery-add-linear"
                      width={32}
                      className="text-neutral-400"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-300">
                        Upload preview image
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Drag & drop or click to browse
                      </p>
                      <p className="text-xs text-neutral-600 mt-1">
                        JPEG, PNG, WebP, GIF (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* JSON File Upload */}
            <div>
              <Label htmlFor="themeJson">Theme JSON *</Label>
              <input
                type="file"
                ref={jsonFileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processJsonFile(file);
                }}
                accept=".json"
                className="hidden"
              />

              {/* Drag and Drop Zone */}
              <div
                onClick={() => jsonFileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingJson(false);
                  const file = e.dataTransfer.files[0];
                  if (file) processJsonFile(file);
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingJson(true); }}
                onDragLeave={() => setIsDraggingJson(false)}
                className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all mb-3 ${
                  isDraggingJson
                    ? "border-blue-500 bg-blue-500/10"
                    : themeJsonFile
                      ? "border-green-500 bg-green-500/10"
                      : "border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-800"
                }`}
              >
                {themeJsonFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <Icon
                      icon="solar:file-check-bold"
                      width={32}
                      className="text-green-500"
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {themeJsonFile.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {(themeJsonFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearJsonFile();
                      }}
                      className="ml-auto text-neutral-400 hover:text-white transition-colors"
                    >
                      <Icon icon="solar:close-circle-bold" width={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Icon
                      icon={
                        isDraggingJson
                          ? "solar:file-upload-bold"
                          : "solar:upload-minimalistic-linear"
                      }
                      width={32}
                      className={`${
                        isDraggingJson ? "text-blue-500" : "text-neutral-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-300">
                        {isDraggingJson ? "Drop your file here" : "Drag & drop JSON file"}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        or click to browse
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
        <header className="sticky top-0 z-50 modern-nav border-b shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png"
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
              <>
                <Link href="/admin/users" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Manage Users
                </Link>
                <Link href="/admin/themes" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Theme Approvals
                </Link>
              </>
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
                  <Link href="/" className="cursor-pointer text-neutral-300 hover:text-white hover:bg-neutral-800">
                    <Icon icon="solar:home-2-linear" width={16} className="mr-2" />
                    Browse Themes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer text-neutral-300 hover:text-white hover:bg-neutral-800">
                    <Icon icon="solar:user-linear" width={16} className="mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users" className="cursor-pointer text-neutral-300 hover:text-white hover:bg-neutral-800">
                        <Icon icon="solar:users-group-rounded-bold" width={16} className="mr-2" />
                        Manage Users
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/themes" className="cursor-pointer text-neutral-300 hover:text-white hover:bg-neutral-800">
                        <Icon icon="solar:gallery-wide-bold" width={16} className="mr-2" />
                        Theme Approvals
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
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
