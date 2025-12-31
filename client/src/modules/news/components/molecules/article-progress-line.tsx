type ArticleProgressLineProps = {
  totalArticles: number;
  currentIndex: number;
  progress: number;
};

export function ArticleProgressLine({
  totalArticles,
  currentIndex,
  progress,
}: ArticleProgressLineProps) {
  return (
    <div className="mt-2 flex items-center">
      {Array.from({ length: totalArticles }).map((_, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const sectionProgress = isActive ? progress : isCompleted ? 1 : 0;
        const isCircleActive = isCompleted || (isActive && progress === 1);

        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-white/30 transition-all duration-75 ease-linear"
                style={{
                  width: `${sectionProgress * 100}%`,
                }}
              />
            </div>
            {index < totalArticles - 1 && (
              <div className="flex items-center justify-center px-0.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isCircleActive ? "bg-white/30" : "bg-white/10"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

