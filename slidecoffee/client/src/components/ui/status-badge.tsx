import { cn } from "@/lib/utils";
import { FileText, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export type ProjectStatus = "draft" | "planning" | "generating" | "completed" | "failed";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusConfig: Record<ProjectStatus, {
  label: string;
  icon: typeof FileText;
  className: string;
  animate?: boolean;
}> = {
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  planning: {
    label: "Planning",
    icon: Clock,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  generating: {
    label: "Generating",
    icon: Loader2,
    className: "bg-purple-100 text-purple-700 border-purple-200",
    animate: true,
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
        config.className,
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", config.animate && "animate-spin")} />
      <span>{config.label}</span>
    </div>
  );
}

