import { WorkoutStreak } from "../../modules/workout/components/organisms/workout-streak";

export function WorkoutCanvas() {
  return (
    <>
      <header className="flex justify-center items-center px-8 py-6">
        <div className="text-4xl font-bold">Workout Mode</div>
      </header>

      <main className="flex-1 px-8 pb-8 flex flex-col min-h-0">
        <div className="flex-1 grid gap-6 min-h-0" style={{ gridTemplateColumns: 'minmax(0, 400px) 1fr minmax(0, 400px)' }}>
          <section className="h-full">
            {/* Left column - can add more components here */}
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
            <div></div>
          </div>
        </div>
      </main>
    </>
  );
}

