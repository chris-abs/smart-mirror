import { Skeleton } from "@/components/ui/skeleton";

export function SpotifyLoadingSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5 min-h-[300px]">
      <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
        Spotify
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <Skeleton className="w-full max-w-[160px] aspect-square rounded-xl mx-auto" />
        <div className="flex flex-col h-full gap-4">
          <div>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-7 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-1.5 w-full mb-1" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
          <div className="mt-auto flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="size-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Skeleton className="w-full h-1.5 rounded-full" />
      </div>
    </div>
  );
}

