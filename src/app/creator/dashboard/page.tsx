"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface Theme {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: string;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  themeJson: string;
  previewData: string | null;
}

export default function CreatorDashboard() {
  const { toast } = useToast();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [canEditAll, setCanEditAll] = useState(false);

  // Create form
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    category: "",
    themeJson: "",
    previewData: "",
  });
  const [creating, setCreating] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    themeJson: "",
    previewData: "",
  });
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const token = localStorage.getItem("creator_token");
      const response = await fetch("/api/creator/themes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch themes");

      const data = await response.json();
      setThemes(data.themes || []);
      setCanEditAll(data.canEditAll || false);
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

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem("creator_token");
      const response = await fetch("/api/creator/themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to create theme");

      toast({
        title: "Theme created successfully! 🎉",
        description: `${createForm.name} has been uploaded`,
      });

      setCreateDialogOpen(false);
      setCreateForm({
        name: "",
        description: "",
        category: "",
        themeJson: "",
        previewData: "",
      });
      fetchThemes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create theme",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTheme) return;

    setEditing(true);

    try {
      const token = localStorage.getItem("creator_token");
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
      fetchThemes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update theme",
      });
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteTheme = async () => {
    if (!selectedTheme) return;

    setDeleting(true);

    try {
      const token = localStorage.getItem("creator_token");
      const response = await fetch(`/api/creator/themes/${selectedTheme.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete theme");

      toast({
        title: "Theme deleted successfully! 🗑️",
      });

      setDeleteDialogOpen(false);
      setSelectedTheme(null);
      fetchThemes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete theme",
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
      previewData: theme.previewData || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (theme: Theme) => {
    setSelectedTheme(theme);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
      BROKEN: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return (
      <Badge
        variant="outline"
        className={colors[status as keyof typeof colors] || colors.PENDING}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              {canEditAll ? "All Themes" : "My Themes"}
            </h1>
            {canEditAll && (
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Icon icon="solar:shield-check-bold" width={14} className="mr-1" />
                Admin View
              </Badge>
            )}
          </div>
          <p className="text-neutral-400">
            {canEditAll
              ? "Manage all themes in the platform"
              : "Upload and manage your custom themes"
            }
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
              <Icon icon="solar:add-circle-bold" width={18} className="mr-2" />
              Upload Theme
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-purple-900/30 text-neutral-200 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Upload New Theme</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Share your custom theme with the community
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTheme} className="space-y-4">
              <div>
                <Label htmlFor="name">Theme Name *</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="bg-slate-800/50 border-purple-900/30 text-white mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  className="bg-slate-800/50 border-purple-900/30 text-white mt-2 min-h-[100px]"
                  placeholder="Describe your theme..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={createForm.category}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, category: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-purple-900/30 text-white mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-900/30">
                      <SelectItem value="Dark">Dark</SelectItem>
                      <SelectItem value="Light">Light</SelectItem>
                      <SelectItem value="AMOLED">AMOLED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="themeJson">Theme JSON *</Label>
                <Textarea
                  id="themeJson"
                  value={createForm.themeJson}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, themeJson: e.target.value })
                  }
                  className="bg-slate-800/50 border-purple-900/30 text-white mt-2 min-h-[200px] font-mono text-sm"
                  placeholder='{"colors": {"primary": "#..."}, ...}'
                  required
                />
              </div>
              <div>
                <Label htmlFor="previewData">Preview JSON (Optional)</Label>
                <Textarea
                  id="previewData"
                  value={createForm.previewData}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, previewData: e.target.value })
                  }
                  className="bg-slate-800/50 border-purple-900/30 text-white mt-2 min-h-[150px] font-mono text-sm"
                  placeholder='Preview data for theme showcase...'
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="border-purple-900/30 text-neutral-300 hover:bg-purple-900/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                >
                  {creating ? "Uploading..." : "Upload Theme"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Themes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-slate-900/40 border-purple-900/30">
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : themes.length === 0 ? (
        <Card className="bg-slate-900/40 border-purple-900/30 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Icon icon="solar:gallery-wide-linear" className="text-purple-500" width={32} />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No themes yet</h3>
          <p className="text-neutral-400 mb-6">
            {canEditAll 
              ? "There are no themes in the platform yet"
              : "Upload your first theme to get started"
            }
          </p>
          {!canEditAll && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              <Icon icon="solar:add-circle-bold" width={18} className="mr-2" />
              Upload Your First Theme
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className="bg-slate-900/40 border-purple-900/30 hover:border-purple-500/50 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {theme.name}
                    </h3>
                    {theme.category && (
                      <Badge
                        variant="outline"
                        className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs"
                      >
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(theme)}
                    className="flex-1 border-purple-900/30 text-neutral-300 hover:text-white hover:bg-purple-900/20"
                  >
                    <Icon icon="solar:pen-bold" width={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(theme)}
                    className="border-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Icon icon="solar:trash-bin-minimalistic-bold" width={16} />
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-purple-900/30">
                  <p className="text-xs text-neutral-600">
                    Uploaded {new Date(theme.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Theme Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-purple-900/30 text-neutral-200 max-w-2xl max-h-[90vh] overflow-y-auto">
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
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="bg-slate-800/50 border-purple-900/30 text-white mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="bg-slate-800/50 border-purple-900/30 text-white mt-2 min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, category: value })
                }
              >
                <SelectTrigger className="bg-slate-800/50 border-purple-900/30 text-white mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-900/30">
                  <SelectItem value="Dark">Dark</SelectItem>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="AMOLED">AMOLED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-themeJson">Theme JSON</Label>
              <Textarea
                id="edit-themeJson"
                value={editForm.themeJson}
                onChange={(e) =>
                  setEditForm({ ...editForm, themeJson: e.target.value })
                }
                className="bg-slate-800/50 border-purple-900/30 text-white mt-2 min-h-[200px] font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="edit-previewData">Preview JSON</Label>
              <Textarea
                id="edit-previewData"
                value={editForm.previewData}
                onChange={(e) =>
                  setEditForm({ ...editForm, previewData: e.target.value })
                }
                className="bg-slate-800/50 border-purple-900/30 text-white mt-2 min-h-[150px] font-mono text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-purple-900/30 text-neutral-300 hover:bg-purple-900/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              >
                {editing ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-purple-900/30 text-neutral-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Theme
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete "{selectedTheme?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-purple-900/30 text-neutral-300 hover:bg-purple-900/20">
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
