import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, type ProjectStatus } from "@/components/ui/status-badge";
import { FileText, MoreVertical, Star, Edit, Copy, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  id: number;
  title: string;
  description?: string;
  status: ProjectStatus;
  brandName: string;
  brandColor: string;
  isFavorite: boolean;
  lastViewedAt?: Date;
  createdAt: Date;
  thumbnailUrl?: string;
  onToggleFavorite: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ProjectCard({
  id,
  title,
  description,
  status,
  brandName,
  brandColor,
  isFavorite,
  lastViewedAt,
  createdAt,
  thumbnailUrl,
  onToggleFavorite,
  onDuplicate,
  onExport,
  onDelete,
  className,
}: ProjectCardProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300",
        className
      )}
    >
      <Link href={`/project/${id}`} className="block">
          {/* Thumbnail Container - 16:9 Aspect Ratio */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FileText className="h-16 w-16 text-gray-300" />
              </div>
            )}

            {/* Status Badge - Top Left */}
            <div className="absolute top-2 left-2">
              <StatusBadge status={status} />
            </div>

            {/* Favorite Star - Top Right */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={cn(
                "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200",
                "bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-110",
                "opacity-0 group-hover:opacity-100"
              )}
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                )}
              />
            </button>

            {/* Brand Color Accent Bar - Bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ backgroundColor: brandColor }}
            />
          </div>
      </Link>

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/project/${id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate hover:text-blue-600 transition-colors">
              {title}
            </h3>
          </Link>

          {/* Three-Dot Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
        )}

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: brandColor }}
            />
            <span className="font-medium">{brandName}</span>
          </div>
          <span>
            {lastViewedAt
              ? `Viewed ${formatDistanceToNow(lastViewedAt, { addSuffix: true })}`
              : `Created ${formatDistanceToNow(createdAt, { addSuffix: true })}`}
          </span>
        </div>
      </div>
    </Card>
  );
}

