import { query } from "../../db/index.js";


export async function getWorkoutStreak() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const result = await query(
    `SELECT date FROM workout_entries 
     WHERE has_daily_exercise = true 
     ORDER BY date DESC`
  );

  if (result.rows.length === 0) {
    return {
      streak: 0,
      lastWorkoutDate: null,
    };
  }

  const lastDate = new Date(result.rows[0].date);
  lastDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff > 1) {
    return {
      streak: 0,
      lastWorkoutDate: result.rows[0].date,
    };
  }

  let streak = 0;
  let checkDate = new Date(result.rows[0].date);
  const dates = new Set(result.rows.map((row) => row.date));

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (dates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    streak,
    lastWorkoutDate: result.rows[0].date,
  };
}

export async function recordWorkout() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  await query(
    `INSERT INTO workout_entries (date, has_daily_exercise, has_workout)
     VALUES ($1, true, COALESCE((SELECT has_workout FROM workout_entries WHERE date = $1), false))
     ON CONFLICT (date) 
     DO UPDATE SET has_daily_exercise = true, updated_at = CURRENT_TIMESTAMP`,
    [todayStr]
  );

  return getWorkoutStreak();
}

export async function resetWorkoutStreak() {
  await query(
    `UPDATE workout_entries SET has_daily_exercise = false WHERE has_daily_exercise = true`
  );

  return {
    streak: 0,
    lastWorkoutDate: null,
  };
}

export async function getWorkoutCounts() {
  const now = new Date();

  const dailyStart = new Date(now);
  dailyStart.setHours(0, 1, 0, 0);
  if (now < dailyStart) {
    dailyStart.setDate(dailyStart.getDate() - 1);
  }

  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);
  startOfWeek.setHours(0, 1, 0, 0);
  if (now < startOfWeek) {
    startOfWeek.setDate(startOfWeek.getDate() - 7);
  }

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    1,
    0,
    0
  );
  if (now < startOfMonth) {
    startOfMonth.setMonth(startOfMonth.getMonth() - 1);
  }

  const dailyResult = await query(
    `SELECT COUNT(*) as count FROM workout_entries 
     WHERE has_workout = true AND date >= $1`,
    [dailyStart.toISOString().split("T")[0]]
  );

  const weeklyResult = await query(
    `SELECT COUNT(*) as count FROM workout_entries 
     WHERE has_workout = true AND date >= $1`,
    [startOfWeek.toISOString().split("T")[0]]
  );

  const monthlyResult = await query(
    `SELECT COUNT(*) as count FROM workout_entries 
     WHERE has_workout = true AND date >= $1`,
    [startOfMonth.toISOString().split("T")[0]]
  );

  const lastWorkoutResult = await query(
    `SELECT date FROM workout_entries 
     WHERE has_workout = true 
     ORDER BY date DESC 
     LIMIT 1`
  );

  return {
    daily: parseInt(dailyResult.rows[0]?.count || "0", 10),
    weekly: parseInt(weeklyResult.rows[0]?.count || "0", 10),
    monthly: parseInt(monthlyResult.rows[0]?.count || "0", 10),
    lastWorkoutDate: lastWorkoutResult.rows[0]?.date || null,
  };
}

export async function recordWorkoutType(dates, type) {
  if (!Array.isArray(dates) || dates.length === 0) {
    throw new Error("Dates array is required and must not be empty");
  }

  if (!['weights', 'class', 'dailies'].includes(type)) {
    throw new Error("Type must be 'weights', 'class', or 'dailies'");
  }

  // Process each date individually to handle different types cleanly
  for (const dateStr of dates) {
    if (type === 'dailies') {
      await query(
        `INSERT INTO workout_entries (date, has_daily_exercise)
         VALUES ($1, true)
         ON CONFLICT (date) 
         DO UPDATE SET 
           has_daily_exercise = true,
           updated_at = CURRENT_TIMESTAMP`,
        [dateStr]
      );
    } else if (type === 'weights') {
      await query(
        `INSERT INTO workout_entries (date, has_workout, has_weights)
         VALUES ($1, true, true)
         ON CONFLICT (date) 
         DO UPDATE SET 
           has_workout = true,
           has_weights = true,
           updated_at = CURRENT_TIMESTAMP`,
        [dateStr]
      );
    } else if (type === 'class') {
      await query(
        `INSERT INTO workout_entries (date, has_workout, has_class)
         VALUES ($1, true, true)
         ON CONFLICT (date) 
         DO UPDATE SET 
           has_workout = true,
           has_class = true,
           updated_at = CURRENT_TIMESTAMP`,
        [dateStr]
      );
    }
  }

  return { recorded: dates.length };
}

export async function getContributionsData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneYearAgo = new Date(today);
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  const startDate = oneYearAgo.toISOString().split("T")[0];

  const result = await query(
    `SELECT date, has_workout, has_daily_exercise, has_weights, has_class
     FROM workout_entries 
     WHERE date >= $1 
     ORDER BY date ASC`,
    [startDate]
  );

  const entriesMap = new Map();
  result.rows.forEach((row) => {
    // Convert date to string format (YYYY-MM-DD) for consistent map key
    const dateStr = typeof row.date === 'string' 
      ? row.date 
      : new Date(row.date).toISOString().split('T')[0];
    
    entriesMap.set(dateStr, {
      date: dateStr,
      has_workout: row.has_workout,
      has_daily_exercise: row.has_daily_exercise || false,
      has_weights: row.has_weights || false,
      has_class: row.has_class || false,
    });
  });

  const entries = [];
  const currentDate = new Date(oneYearAgo);
  let totalWorkouts = 0;

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const entry = entriesMap.get(dateStr) || {
      date: dateStr,
      has_workout: false,
      has_daily_exercise: false,
      has_weights: false,
      has_class: false,
    };

    if (entry.has_weights) totalWorkouts++;
    if (entry.has_class) totalWorkouts++;
    if (entry.has_daily_exercise) totalWorkouts++;

    entries.push(entry);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    entries,
    total: totalWorkouts,
  };
}
