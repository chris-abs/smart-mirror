import { SpotifyNowPlayingCard } from "../../../modules/spotify/components/organisms/spotify-now-playing";
import { WeatherCard } from "../../../modules/weather/components/organisms/weather-card";
import { NewsCard } from "../../../modules/news/components/organisms/news-card";
import { GitHubContributionsChart } from "../../../modules/github/components/organisms/github-contributions-chart";
import { getGreeting } from "../../../lib/utils";

const USER_NAME = "Chris";

export function HomeCanvas() {
  const now = new Date();
  const greeting = getGreeting();

  return (
    <>
      <header className="flex justify-between items-start px-8 py-6">
        <div>
          <div className="text-xl font-medium opacity-80 mb-1">
            {greeting},
          </div>
          <div className="text-4xl font-bold leading-tight tracking-tight">
            {USER_NAME}!
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-light leading-none">
            {now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-sm opacity-70 mt-1">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 pb-8 flex flex-col min-h-0">
        <div className="flex-1 grid gap-6 min-h-0" style={{ gridTemplateColumns: 'minmax(0, 400px) 1fr minmax(0, 400px)' }}>
          <section className="h-full">
            <SpotifyNowPlayingCard />
          </section>

          <section className="h-full flex flex-col gap-6">
            <NewsCard />
          </section>

          <section className="h-full flex flex-col gap-6">
            <WeatherCard />
          </section>
        </div>

        <div className="mt-auto w-full flex justify-center">
          <GitHubContributionsChart />
        </div>
      </main>
    </>
  );
}

