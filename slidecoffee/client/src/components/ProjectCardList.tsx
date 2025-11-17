import { FileText, MoreVertical, Star, Copy, FolderInput, Trash2, Calendar, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { StatusBadge } from "./ui/status-badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardListProps {
  id: number;
  title: string;
  description?: string;
  status: "draft" | "planning" | "generating" | "completed" | "failed";
  brandName: string;
  brandColor: string;
  thumbnailUrl?: string;
  isFavorite?: boolean;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  onToggleFavorite?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ProjectCardList({
  id,
  title,
  description,
  status,
  brandName,
  brandColor,
  thumbnailUrl,
  isFavorite,
  lastViewedAt,
  createdAt,
  updatedAt,
  onToggleFavorite,
  onDuplicate,
  onExport,
  onDelete,
  className,
}: ProjectCardListProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300",
        className
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail - Smaller for list view */}
        <Link href={`/project/${id}`} className="flex-shrink-0">
          <div className="relative w-32 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded overflow-hidden">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FileText className="h-8 w-8 text-gray-300" />
              </div>
            )}

            {/* Status Badge - Top Left */}
            <div className="absolute top-1 left-1">
              <StatusBadge status={status} />
            </div>

            {/* Brand Color Accent */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: brandColor }}
            />
          </div>
        </Link>

        {/* Content - Takes remaining space */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/project/${id}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate hover:text-blue-600 transition-colors">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {description}
                </p>
              )}
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Favorite Star */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite?.();
                }}
                className="h-8 w-8 p-0"
              >
                <Star
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400 hover:text-yellow-400"
                  )}
                />
              </Button>

              {/* Three-Dot Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExport}>
                    <FolderInput className="w-4 h-4 mr-2" />
                    Move to folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <span>{brandName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Created {formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</span>
            </div>
            {lastViewedAt && (
              <span>Viewed {formatDistanceToNow(lastViewedAt, { addSuffix: true })}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

