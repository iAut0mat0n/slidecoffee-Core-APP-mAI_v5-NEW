import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  MoreVertical,
  Reply,
  Trash2,
  Edit3,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  timestamp: Date;
  resolved: boolean;
  replies?: Comment[];
}

interface CommentThreadProps {
  slideId: number;
  position?: { x: number; y: number };
  onClose?: () => void;
  initialComments?: Comment[];
}

export function CommentThread({ slideId, position, onClose, initialComments = [] }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [resolved, setResolved] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      author: {
        name: "You",
        avatar: "",
        initials: "YO",
      },
      content: newComment,
      timestamp: new Date(),
      resolved: false,
      replies: [],
    };

    setComments([...comments, comment]);
    setNewComment("");
    toast.success("Comment added");
  };

  const handleAddReply = (commentId: number) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: Date.now(),
      author: {
        name: "You",
        avatar: "",
        initials: "YO",
      },
      content: replyText,
      timestamp: new Date(),
      resolved: false,
    };

    setComments(comments.map(c => 
      c.id === commentId 
        ? { ...c, replies: [...(c.replies || []), reply] }
        : c
    ));
    setReplyText("");
    setReplyTo(null);
    toast.success("Reply added");
  };

  const handleResolve = () => {
    setResolved(!resolved);
    toast.success(resolved ? "Thread reopened" : "Thread resolved");
  };

  const handleDelete = (commentId: number) => {
    setComments(comments.filter(c => c.id !== commentId));
    toast.success("Comment deleted");
  };

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

  return (
    <div 
      className="w-80 bg-card border rounded-lg shadow-lg"
      style={position ? { position: "absolute", top: position.y, left: position.x } : {}}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Comments</h3>
          {comments.length > 0 && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={resolved ? "outline" : "ghost"}
            size="sm"
            onClick={handleResolve}
            className={resolved ? "text-green-600 border-green-600" : ""}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {resolved ? "Resolved" : "Resolve"}
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Start a conversation about this slide</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Main Comment */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {comment.author.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(comment.timestamp)}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setReplyTo(comment.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-2 border-l-2 border-muted pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs">
                          {reply.author.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs">{reply.author.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replyTo === comment.id && (
                <div className="ml-11 flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[60px] text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleAddReply(comment.id);
                      }
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyText.trim()}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText("");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Comment Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment... (Cmd/Ctrl + Enter to send)"
            className="min-h-[80px] text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAddComment();
              }
            }}
          />
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Tip: Use @name to mention collaborators
        </p>
      </div>
    </div>
  );
}

