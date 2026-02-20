"use client";

import { useEffect, useState, useRef } from "react";
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
  creatorName: string | null;
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
  });
  const [creating, setCreating] = useState(false);

  // Create dialog file upload
  const [isDraggingCreate, setIsDraggingCreate] = useState(false);
  const [selectedFileCreate, setSelectedFileCreate] = useState<File | null>(null);
  const fileInputCreateRef = useRef<HTMLInputElement>(null);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    themeJson: "",
  });
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit dialog file upload
  const [isDraggingEdit, setIsDraggingEdit] = useState(false);
  const [selectedFileEdit, setSelectedFileEdit] = useState<File | null>(null);
  const fileInputEditRef = useRef<HTMLInputElement>(null);

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
      });
      setSelectedFileCreate(null);
      if (fileInputCreateRef.current) {
        fileInputCreateRef.current.value = "";
      }
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
    });
    setSelectedFileEdit(null);
    if (fileInputEditRef.current) {
      fileInputEditRef.current.value = "";
    }
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

  // File handling for create dialog
  const processFileCreate = (file: File) => {
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
        const updatedForm = { ...createForm, themeJson: content };

        if (json.name && !createForm.name) {
          updatedForm.name = json.name;
        }

        if (json.creatorName) {
          // creatorName is not stored in the form, but we could log it
        }

        if (json.description && !createForm.description) {
          updatedForm.description = json.description;
        }

        if (json.category && !createForm.category) {
          updatedForm.category = json.category;
        }

        setCreateForm(updatedForm);
        setSelectedFileCreate(file);

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

  const handleFileSelectCreate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFileCreate(file);
    }
  };

  const handleDropCreate = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCreate(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFileCreate(file);
    }
  };

  const handleDragOverCreate = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCreate(true);
  };

  const handleDragLeaveCreate = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCreate(false);
  };

  const openFileDialogCreate = () => {
    fileInputCreateRef.current?.click();
  };

  const clearFileCreate = () => {
    setSelectedFileCreate(null);
    setCreateForm({ ...createForm, themeJson: "" });
    if (fileInputCreateRef.current) {
      fileInputCreateRef.current.value = "";
    }
  };

  // File handling for edit dialog
  const processFileEdit = (file: File) => {
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
        const updatedForm = { ...editForm, themeJson: content };

        if (json.name && !editForm.name) {
          updatedForm.name = json.name;
        }

        if (json.description && !editForm.description) {
          updatedForm.description = json.description;
        }

        if (json.category && !editForm.category) {
          updatedForm.category = json.category;
        }

        setEditForm(updatedForm);
        setSelectedFileEdit(file);

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

  const handleFileSelectEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFileEdit(file);
    }
  };

  const handleDropEdit = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingEdit(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFileEdit(file);
    }
  };

  const handleDragOverEdit = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingEdit(true);
  };

  const handleDragLeaveEdit = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingEdit(false);
  };

  const openFileDialogEdit = () => {
    fileInputEditRef.current?.click();
  };

  const clearFileEdit = () => {
    setSelectedFileEdit(null);
    setEditForm({ ...editForm, themeJson: "" });
    if (fileInputEditRef.current) {
      fileInputEditRef.current.value = "";
    }
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
            <Button className="bg-white text-black hover:bg-neutral-200">
              <Icon icon="solar:add-circle-bold" width={18} className="mr-2" />
              Upload Theme
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-200 max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  className="bg-neutral-800 border-neutral-700 text-white mt-2"
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
                  className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[100px]"
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
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputCreateRef}
                  onChange={handleFileSelectCreate}
                  accept=".json"
                  className="hidden"
                />

                {/* Drag and Drop Zone */}
                <div
                  onClick={openFileDialogCreate}
                  onDrop={handleDropCreate}
                  onDragOver={handleDragOverCreate}
                  onDragLeave={handleDragLeaveCreate}
                  className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all mb-3 ${
                    isDraggingCreate
                      ? "border-blue-500 bg-blue-500/10"
                      : selectedFileCreate
                      ? "border-green-500 bg-green-500/10"
                      : "border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-800"
                  }`}
                >
                  {selectedFileCreate ? (
                    <div className="flex items-center justify-center gap-3">
                      <Icon
                        icon="solar:file-check-bold"
                        width={32}
                        className="text-green-500"
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">
                          {selectedFileCreate.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {(selectedFileCreate.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFileCreate();
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
                          isDraggingCreate
                            ? "solar:file-upload-bold"
                            : "solar:upload-minimalistic-linear"
                        }
                        width={32}
                        className={`${
                          isDraggingCreate ? "text-blue-500" : "text-neutral-400"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-neutral-300">
                          {isDraggingCreate ? "Drop your file here" : "Drag & drop JSON file"}
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
                  onClick={() => setCreateDialogOpen(false)}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-white text-black hover:bg-neutral-200"
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
            <Card key={i} className="bg-neutral-900/40 border-neutral-800">
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
        <Card className="bg-neutral-900/40 border-neutral-800 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center">
              <Icon icon="solar:gallery-wide-linear" className="text-neutral-400" width={32} />
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
              className="bg-white text-black hover:bg-neutral-200"
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
              className="bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 transition-all"
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
                    className="flex-1 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
                  >
                    <Icon icon="solar:pen-bold" width={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(theme)}
                    className="border-red-700 text-red-400 hover:text-red-300 hover:bg-red-900/20"
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

      {/* Edit Theme Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-200 max-w-2xl max-h-[90vh] overflow-y-auto">
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
                className="bg-neutral-800 border-neutral-700 text-white mt-2"
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
                className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[100px]"
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
              <input
                type="file"
                ref={fileInputEditRef}
                onChange={handleFileSelectEdit}
                accept=".json"
                className="hidden"
              />

              {/* Drag and Drop Zone */}
              <div
                onClick={openFileDialogEdit}
                onDrop={handleDropEdit}
                onDragOver={handleDragOverEdit}
                onDragLeave={handleDragLeaveEdit}
                className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all mb-3 ${
                  isDraggingEdit
                    ? "border-blue-500 bg-blue-500/10"
                    : selectedFileEdit
                    ? "border-green-500 bg-green-500/10"
                    : "border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-800"
                }`}
              >
                {selectedFileEdit ? (
                  <div className="flex items-center justify-center gap-3">
                    <Icon
                      icon="solar:file-check-bold"
                      width={32}
                      className="text-green-500"
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {selectedFileEdit.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {(selectedFileEdit.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFileEdit();
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
                        isDraggingEdit
                          ? "solar:file-upload-bold"
                          : "solar:upload-minimalistic-linear"
                      }
                      width={32}
                      className={`${
                        isDraggingEdit ? "text-blue-500" : "text-neutral-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-300">
                        {isDraggingEdit ? "Drop your file here" : "Drag & drop JSON file"}
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
                {editing ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
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
