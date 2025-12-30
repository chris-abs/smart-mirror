import { SpotifyNowPlayingCard } from "../../modules/spotify/components/organisms/spotify-now-playing";
import { WeatherCard } from "../../modules/weather/components/organisms/weather-card";

export function Canvas() {
  const now = new Date();

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col">
      <header className="flex justify-between items-start px-8 py-6">
        <div className="text-lg font-semibold">Jarvis Mirror</div>
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

      <main className="flex-1 px-8 pb-8 grid gap-6" style={{ gridTemplateColumns: 'minmax(0, 400px) 1fr minmax(0, 400px)' }}>
        <section>
          <SpotifyNowPlayingCard />
        </section>

        <section>
          <div className="border border-white/10 rounded-xl p-4 bg-white/5">
            <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
              News
            </div>
            <div className="text-sm opacity-60">
              Placeholder for news / UFC / events…
            </div>
          </div>
        </section>

        <section>
          <WeatherCard />
        </section>
      </main>
    </div>
  );
}
