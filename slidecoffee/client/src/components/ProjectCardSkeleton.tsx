export function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-muted rounded-md" />
      
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
      
      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-8 w-8 bg-muted rounded-full" />
      </div>
    </div>
  );
}

export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

