import { useEffect, useState, useRef, useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ArticleProgressLine } from "../molecules/article-progress-line";
import { useLocation } from "../../../../hooks/use-location";
import { useBreakingNews, useUFCNews } from "../../queries";
import { getTimeAgo, filterBettingArticles } from "../../utils";

const SCROLL_INTERVAL = 10000;

export function NewsCard() {
  const { countryCode, isLoading: locationLoading } = useLocation();
  const countryCodeString = countryCode || "gb";
  const { data: breakingNews, isLoading: breakingLoading } = useBreakingNews(countryCodeString, 10);
  const { data: ufcNews, isLoading: ufcLoading } = useUFCNews(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentType, setCurrentType] = useState<"breaking" | "ufc">("breaking");
  const [progress, setProgress] = useState(0);
  const prevDataKeyRef = useRef<string>("");
  const progressIntervalRef = useRef<number | null>(null);

  const allArticles = useMemo(() => {
    const combined = [
      ...(breakingNews?.articles.map((article) => ({ ...article, type: "breaking" as const })) || []),
      ...(ufcNews?.articles.map((article) => ({ ...article, type: "ufc" as const })) || []),
    ];
    return filterBettingArticles(combined);
  }, [breakingNews?.articles, ufcNews?.articles]);

  const isLoading = locationLoading || breakingLoading || ufcLoading;
  const hasData = allArticles.length > 0;

  const dataKey = useMemo(() => {
    return `${breakingNews?.totalResults || 0}-${ufcNews?.totalResults || 0}`;
  }, [breakingNews?.totalResults, ufcNews?.totalResults]);

  useEffect(() => {
    if (hasData && prevDataKeyRef.current !== dataKey) {
      prevDataKeyRef.current = dataKey;
      const timeoutId = setTimeout(() => {
        setCurrentIndex(0);
        setProgress(0);
        if (allArticles[0]) {
          setCurrentType(allArticles[0].type);
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [hasData, dataKey, allArticles]);

  useEffect(() => {
    if (!hasData || allArticles.length === 0) return;

    const resetTimeout = setTimeout(() => {
      setProgress(0);
    }, 0);

    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / SCROLL_INTERVAL, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        progressIntervalRef.current = window.setTimeout(updateProgress, 16);
      }
    };

    const animationTimeout = window.setTimeout(updateProgress, 16);

    return () => {
      clearTimeout(resetTimeout);
      if (progressIntervalRef.current) {
        clearTimeout(progressIntervalRef.current);
      }
      clearTimeout(animationTimeout);
    };
  }, [hasData, allArticles.length, currentIndex]);

  useEffect(() => {
    if (!hasData || allArticles.length === 0 || progress < 1) return;

    const timeoutId = setTimeout(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % allArticles.length;
        const nextArticle = allArticles[nextIndex];
        if (nextArticle) {
          setCurrentType(nextArticle.type);
        }
        return nextIndex;
      });
    }, 100); 

    return () => clearTimeout(timeoutId);
  }, [hasData, allArticles.length, allArticles, progress]);

  if (isLoading && !hasData) {
    return (
      <div className="rounded-xl p-4 bg-white/5 w-full">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
          News
        </div>
        <div className="flex flex-col gap-2 min-h-30">
          <Skeleton className="h-14 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="rounded-xl p-4 bg-white/5 w-full">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
          News
        </div>
        <div className="text-sm opacity-60">No news available</div>
      </div>
    );
  }

  const currentArticle = allArticles[currentIndex];
  const timeAgo = currentArticle.publishedAt
    ? getTimeAgo(new Date(currentArticle.publishedAt))
    : null;

  return (
    <div className="rounded-xl p-4 bg-white/5 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          {currentType === "breaking" ? "Breaking News" : "UFC News"}
        </div>
        <div className="text-xs opacity-40">
          {currentIndex + 1} / {allArticles.length}
        </div>
      </div>

      <div className="space-y-2 min-h-[120px]">
        <h3 className="text-2xl font-bold leading-tight line-clamp-2 tracking-tight">
          {currentArticle.title}
        </h3>
        <div className="min-h-10">
          {currentArticle.description ? (
            <p className="text-sm opacity-70 line-clamp-2 leading-relaxed">
              {currentArticle.description}
            </p>
          ) : (
            <p className="text-sm line-clamp-2 leading-relaxed opacity-0">
              &nbsp;
            </p>
          )}
        </div>
      </div>
        <div className="flex items-center justify-between text-xs opacity-50 pt-1">
          <span>{currentArticle.source.name}</span>
          {timeAgo && <span>{timeAgo}</span>}
        </div>

      <ArticleProgressLine
        totalArticles={allArticles.length}
        currentIndex={currentIndex}
        progress={progress}
      />
    </div>
  );
}


