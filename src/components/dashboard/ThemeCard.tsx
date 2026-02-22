import { Icon } from "@iconify/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  previewImage?: string | null;
}

interface ThemeCardProps {
  theme: Theme;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  showViewButton?: boolean;
  viewButtonHref?: string;
}

export function ThemeCard({
  theme,
  onEdit,
  onDelete,
  showActions = false,
  showViewButton = false,
  viewButtonHref,
}: ThemeCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">✅ Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">⏳ Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">❌ Rejected</Badge>;
      case 'BROKEN':
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">⚠️ Broken</Badge>;
      default:
        return <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 hover:bg-neutral-900/50 transition-all">
      <div className="flex gap-4">
        {/* Preview Image */}
        {theme.previewImage ? (
          <div className="w-32 h-20 rounded-lg overflow-hidden shrink-0 bg-neutral-950 flex items-center justify-center">
            <img
              src={theme.previewImage}
              alt={theme.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-32 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 flex items-center justify-center">
            <span className="text-xs text-neutral-500">No preview</span>
          </div>
        )}

        {/* Theme Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-medium text-white truncate">{theme.name}</h3>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white">
                    <Icon icon="solar:menu-dots-circle-linear" width={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800">
                  {showViewButton && viewButtonHref && (
                    <DropdownMenuItem asChild>
                      <Link href={viewButtonHref} className="cursor-pointer text-neutral-300 hover:text-white">
                        <Icon icon="solar:eye-linear" width={14} className="mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(theme.id)}
                      className="cursor-pointer text-neutral-300 hover:text-white"
                    >
                      <Icon icon="solar:pen-linear" width={14} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator className="bg-neutral-800" />
                      <DropdownMenuItem
                        onClick={() => onDelete(theme.id)}
                        className="cursor-pointer text-red-400 hover:text-red-300"
                      >
                        <Icon icon="solar:trash-bin-minimalistic-linear" width={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            {theme.category && (
              <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-xs">
                {theme.category}
              </Badge>
            )}
            {getStatusBadge(theme.status)}
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-500 mb-2">
            <span className="flex items-center gap-1">
              <Icon icon="solar:heart-linear" width={12} />
              {theme.likesCount} likes
            </span>
            <span className="flex items-center gap-1">
              <Icon icon="solar:eye-linear" width={12} />
              {theme.viewsCount} views
            </span>
            <span>{formatDate(theme.createdAt)}</span>
          </div>

          {theme.description && (
            <p className="text-sm text-neutral-400 line-clamp-2">{theme.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
