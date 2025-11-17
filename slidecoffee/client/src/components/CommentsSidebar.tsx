import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Circle,
  X,
  ChevronRight
} from "lucide-react";
import { Comment } from "./CommentThread";

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Array<Comment & { slideNumber: number; slideTitle: string }>;
  onCommentClick: (slideNumber: number, commentId: number) => void;
}

type FilterType = "all" | "resolved" | "unresolved";

export function CommentsSidebar({ isOpen, onClose, comments, onCommentClick }: CommentsSidebarProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredComments = comments.filter(comment => {
    // Filter by resolution status
    if (filter === "resolved" && !comment.resolved) return false;
    if (filter === "unresolved" && comment.resolved) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        comment.content.toLowerCase().includes(query) ||
        comment.author.name.toLowerCase().includes(query) ||
        comment.slideTitle.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const unresolvedCount = comments.filter(c => !c.resolved).length;
  const resolvedCount = comments.filter(c => c.resolved).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">Comments</h2>
              <p className="text-sm text-muted-foreground">
                {comments.length} total • {unresolvedCount} unresolved
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search comments..."
            className="pl-10"
          />
        </div>

        {/* Filter */}
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Comments ({comments.length})
            </SelectItem>
            <SelectItem value="unresolved">
              Unresolved ({unresolvedCount})
            </SelectItem>
            <SelectItem value="resolved">
              Resolved ({resolvedCount})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredComments.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold mb-2">No comments found</h3>
            <p className="text-sm">
              {searchQuery
                ? "Try adjusting your search"
                : filter === "resolved"
                ? "No resolved comments yet"
                : "No unresolved comments"}
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <button
              key={comment.id}
              onClick={() => onCommentClick(comment.slideNumber, comment.id)}
              className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors group"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                    {comment.author.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Author & Time */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(comment.timestamp)}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <p className="text-sm line-clamp-2">{comment.content}</p>

                  {/* Slide Info & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 rounded bg-muted">
                        Slide {comment.slideNumber}
                      </span>
                      <span className="truncate max-w-[120px]">
                        {comment.slideTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {comment.resolved ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-orange-600" />
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>

                  {/* Replies Count */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t bg-muted/30">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-600">{unresolvedCount}</div>
            <div className="text-xs text-muted-foreground">Unresolved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
        </div>
      </div>
    </div>
  );
}

