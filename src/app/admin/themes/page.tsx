"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
import { useSearchParams } from "next/navigation";

interface Theme {
  id: string;
  themeId: string | null;
  name: string;
  description: string | null;
  creatorName: string;
  category: string | null;
  status: string;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  creator?: {
    id: string;
    username: string;
    name: string | null;
  };
}

export default function ThemesPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(statusParam || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [statusParam]);

  useEffect(() => {
    fetchThemes();
  }, [statusFilter, searchQuery]);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/admin/themes?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

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

  const handleUpdateStatus = async (themeId: string, newStatus: string) => {
    setUpdating(themeId);

    try {
      const response = await fetch(`/api/admin/themes/${themeId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to update status");

      toast({
        title: "Theme status updated! ✨",
        description: `Theme is now ${newStatus}`,
      });

      fetchThemes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteTheme = async () => {
    if (!selectedTheme) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/themes/${selectedTheme.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
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

  const openDeleteDialog = (theme: Theme) => {
    setSelectedTheme(theme);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
      BROKEN: "bg-red-600/10 text-red-600 border-red-600/20",
    };
    const labels = {
      PENDING: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      BROKEN: "Broken",
    };
    return (
      <Badge
        variant="outline"
        className={colors[status as keyof typeof colors] || colors.PENDING}
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Themes</h1>
        <p className="text-neutral-400">
          Manage and moderate community themes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Icon icon="solar:magnifer-linear" width={18} />
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-800/50 border-neutral-800 text-white pl-10"
              placeholder="Search themes..."
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-neutral-800/50 border-neutral-800 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-800">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="BROKEN">Broken</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Themes Table */}
      <Card className="border-neutral-800 bg-neutral-900/40">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead className="text-neutral-400">Theme</TableHead>
                <TableHead className="text-neutral-400">Creator</TableHead>
                <TableHead className="text-neutral-400">Category</TableHead>
                <TableHead className="text-neutral-400">Status</TableHead>
                <TableHead className="text-neutral-400">Stats</TableHead>
                <TableHead className="text-neutral-400">Created</TableHead>
                <TableHead className="text-neutral-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-neutral-800">
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-32 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : themes.map((theme) => (
                    <TableRow
                      key={theme.id}
                      className="border-neutral-800 hover:bg-neutral-800/50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{theme.name}</p>
                          {theme.themeId && (
                            <p className="text-xs text-neutral-500 font-mono">
                              {theme.themeId}
                            </p>
                          )}
                          {theme.description && (
                            <p className="text-sm text-neutral-500 line-clamp-1">
                              {theme.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-neutral-300">{theme.creatorName}</p>
                          {theme.creator && (
                            <p className="text-xs text-neutral-600">
                              @{theme.creator.username}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-neutral-400">
                          {theme.category || "-"}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(theme.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-3 text-sm">
                          <span className="text-neutral-400">
                            <Icon icon="solar:heart-bold" width={14} className="inline mr-1" />
                            {theme.likesCount}
                          </span>
                          <span className="text-neutral-400">
                            <Icon icon="solar:eye-bold" width={14} className="inline mr-1" />
                            {theme.viewsCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-neutral-500">
                          {new Date(theme.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {theme.themeId && (
                            <Link
                              href={`/themes/${theme.themeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                title="View Theme"
                              >
                                <Icon icon="solar:external-link-linear" width={18} />
                              </Button>
                            </Link>
                          )}
                          {theme.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateStatus(theme.id, "APPROVED")}
                                disabled={updating === theme.id}
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                title="Approve"
                              >
                                <Icon icon="solar:check-circle-bold" width={18} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateStatus(theme.id, "REJECTED")}
                                disabled={updating === theme.id}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                title="Reject"
                              >
                                <Icon icon="solar:close-circle-bold" width={18} />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateStatus(theme.id, "BROKEN")}
                            disabled={updating === theme.id}
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                            title="Mark as Broken"
                          >
                            <Icon icon="solar:danger-circle-bold" width={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(theme)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Icon icon="solar:trash-bin-minimalistic-bold" width={18} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Theme
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete the theme "{selectedTheme?.name}" by {selectedTheme?.creatorName}?
              This action cannot be undone.
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
