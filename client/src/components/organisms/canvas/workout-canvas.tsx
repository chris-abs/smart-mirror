import { useState, useEffect } from "react";

import { WorkoutStreak } from "../../../modules/workout/components/organisms/workout-streak";
import { WorkoutPanel } from "../../../modules/workout/components/organisms/workout-panel";
import { SpotifyNowPlayingCard } from "../../../modules/spotify/components/organisms/spotify-now-playing";

export function WorkoutCanvas() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="flex justify-between items-start px-8 py-6">

          <div>
          <div className="text-xl font-medium opacity-80 mb-1">
            Abstracked
          </div>
          <div className="text-4xl font-bold leading-tight tracking-tight">
            No such Inner Bitch!
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

          <section className="h-full">
            {/* Center column - main workout content */}
          </section>

          <section className="h-full">
            {/* Right column - can add more components here */}
          </section>
        </div>

        <div className="mt-auto pt-6 w-full">
          <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0, 400px) 1fr minmax(0, 400px)' }}>
            <div>
              <WorkoutStreak />
            </div>
            <div></div>
            <div>
              <WorkoutPanel />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

