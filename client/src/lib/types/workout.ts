export interface WorkoutStreak {
  streak: number;
  lastWorkoutDate: string | null;
}

export interface WorkoutCounts {
  daily: number;
  weekly: number;
  monthly: number;
  lastWorkoutDate: string | null;
}

export interface WorkoutEntry {
  date: string;
  has_workout: boolean;
  has_daily_exercise: boolean;
  has_weights?: boolean;
  has_class?: boolean;
}

export interface ContributionsData {
  entries: WorkoutEntry[];
  total: number;
}

