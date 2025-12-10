import { SpotifyNowPlayingCard } from "./modules/spotify/components/organisms/spotify-now-playing";

function App() {
  const now = new Date();

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col">
      <header className="flex justify-between items-start px-8 py-4">
        <div className="text-lg font-semibold">Jarvis Mirror</div>
        <div className="text-right">
          <div className="text-4xl font-light leading-none">
            {now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-xs opacity-70 mt-1">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 pb-8 grid grid-cols-3 gap-6">
        <section className="col-span-1">
          <SpotifyNowPlayingCard />
        </section>

        <section className="col-span-1 border border-white/10 rounded-xl p-4">
          <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
            Weather
          </div>
          <div className="text-sm opacity-60">
            Placeholder for weather module…
          </div>
        </section>

        <section className="col-span-1 border border-white/10 rounded-xl p-4">
          <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
            News
          </div>
          <div className="text-sm opacity-60">
            Placeholder for news / UFC / events…
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
