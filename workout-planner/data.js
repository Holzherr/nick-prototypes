// Seed schedule for the workout-planner prototype.
// Workouts are Tue + Thu, week numbers cycle W1 → W4. "Today" anchors at 2026-05-19.

const STANDARD_WARMUP = `Cardio of choice: 3-5 mins
spiderman lunge w rotation: 10 each side
Eccentric push up: 8 reps
Heel elevated goblet squat: 10 reps`;

const TEMPLATES = {
  strengthA: {
    name: 'Strength',
    warmup: STANDARD_WARMUP,
    exercises: [
      { label: 'A',  type: 'single',   name: 'ISSA Exercise Library Barbell Back Squat', search: 'barbell back squat exercise tutorial' },
      { label: 'B',  type: 'single',   name: 'Single Leg Dumbbell RDL',                  search: 'single leg dumbbell rdl tutorial' },
      { label: 'C',  type: 'single',   name: 'Barbell Bench Press',                      search: 'barbell bench press tutorial' },
      { label: 'D',  type: 'single',   name: 'Narrow Grip Lat Pull Down',                search: 'close grip lat pulldown tutorial' },
      { label: 'E1', type: 'superset', name: 'Kettlebell Side Bend',                     search: 'kettlebell side bend tutorial' },
      { label: 'E2', type: 'superset', name: 'Chest Supported Lat Raise',                search: 'chest supported lateral raise tutorial' },
    ],
  },
  strengthB: {
    name: 'Strength 1',
    warmup: STANDARD_WARMUP,
    exercises: [
      { label: 'A',  type: 'single',   name: 'ISSA Exercise Library Barbell Deadlift',   search: 'barbell deadlift tutorial' },
      { label: 'B',  type: 'single',   name: 'Dumbbell Bulgarian Split Squat',           search: 'bulgarian split squat tutorial' },
      { label: 'C',  type: 'single',   name: 'Standing Overhead Press',                  search: 'standing overhead press tutorial' },
      { label: 'D',  type: 'single',   name: 'Chest Supported Row',                      search: 'chest supported row tutorial' },
      { label: 'E1', type: 'superset', name: 'Cable Face Pull',                          search: 'cable face pull tutorial' },
      { label: 'E2', type: 'superset', name: 'Hanging Knee Raise',                       search: 'hanging knee raise tutorial' },
    ],
  },
};

// Instructions vary by week: W1 lighter / higher reps; intensity climbs to W4.
const WEEK_PRESCRIPTIONS = {
  1: { A: '1x6 /6rpe\n1x8 /6rpe\n1x10 /6.5rpe',        B: '3x10 each side',  C: '3x10 /6rpe',    D: '3x12 /7rpe',  E1: '2x12 each side', E2: '2x15 /7rpe' },
  2: { A: '1x6 /6rpe\n1x8 /6rpe\n1x10 /6.5rpe', B: '3x8 each side', C: '3x8 /7rpe', D: '3x10 /7rpe', E1: '2x10 each side', E2: '2x15 /8rpe' },
  3: { A: '1x6 /7rpe\n1x6 /7rpe\n1x6 /7.5rpe',  B: '3x6 each side', C: '3x6 /7.5rpe', D: '3x8 /7rpe', E1: '2x10 each side', E2: '2x12 /8rpe' },
  4: { A: '1x7 /7rpe\n1x5 /7rpe\n1x3 /8/9rpe',  B: '3x5 each side', C: '3x5 /8rpe', D: '3x6 /8rpe', E1: '2x10 each side', E2: '2x12 /8.5rpe' },
};

// Helper to build structured set arrays.
function S(weight, reps, rpe) { return { weight, reps, rpe: rpe ?? null }; }

// Past results — structured per-set, telling a coherent training story:
// W3 (Apr 28/30) → W4 (May 5/7) [peak week 1] → W1 (May 12/14) [deload + new block] → W2 today.
// Numbers climb week-over-week on the same lift, deload dips on W1, then push back up.
const PAST_RESULTS = {
  // ----- Block 1, W3 ----------------------------------------------------
  '2026-04-28': {
    'ISSA Exercise Library Barbell Back Squat': [ S(45, 6, 7), S(47.5, 6, 7), S(50, 6, 7.5) ],
    'Single Leg Dumbbell RDL':                  [ S(14, 6, 7), S(14, 6, 7), S(14, 6, 7.5) ],
    'Barbell Bench Press':                      [ S(40, 6, 7), S(42.5, 6, 7), S(42.5, 6, 7.5) ],
    'Narrow Grip Lat Pull Down':                [ S(45, 8, 7), S(47.5, 8, 7), S(47.5, 8, 7) ],
    'Kettlebell Side Bend':                     [ S(12, 10, null), S(12, 10, null) ],
    'Chest Supported Lat Raise':                [ S(5, 12, 8),  S(5, 12, 8) ],
  },
  '2026-04-30': {
    'ISSA Exercise Library Barbell Deadlift':   [ S(60, 6, 7), S(65, 6, 7), S(70, 6, 7.5) ],
    'Dumbbell Bulgarian Split Squat':           [ S(14, 6, 7), S(14, 6, 7), S(14, 6, 7.5) ],
    'Standing Overhead Press':                  [ S(22.5, 6, 7), S(25, 6, 7), S(25, 6, 7.5) ],
    'Chest Supported Row':                      [ S(20, 6, 7), S(22.5, 6, 7), S(22.5, 6, 7.5) ],
    'Cable Face Pull':                          [ S(10, 10, null), S(10, 10, null) ],
    'Hanging Knee Raise':                       [ S(0, 10, null), S(0, 10, null) ],
  },

  // ----- Block 1, W4 (peak) ---------------------------------------------
  '2026-05-05': {
    'ISSA Exercise Library Barbell Back Squat': [ S(47.5, 7, 7), S(52.5, 5, 7), S(55, 3, 8.5) ],
    'Single Leg Dumbbell RDL':                  [ S(16, 5, 7.5), S(16, 5, 7.5), S(16, 5, 8) ],
    'Barbell Bench Press':                      [ S(42.5, 5, 7.5), S(45, 5, 8), S(47.5, 5, 8.5) ],
    'Narrow Grip Lat Pull Down':                [ S(47.5, 6, 7.5), S(50, 6, 7.5), S(52.5, 6, 8) ],
    'Kettlebell Side Bend':                     [ S(14, 10, null), S(14, 10, null) ],
    'Chest Supported Lat Raise':                [ S(7, 12, 8.5), S(7, 12, 8.5) ],
  },
  '2026-05-07': {
    'ISSA Exercise Library Barbell Deadlift':   [ S(65, 7, 7.5), S(70, 5, 7.5), S(72.5, 3, 8.5) ],
    'Dumbbell Bulgarian Split Squat':           [ S(16, 5, 7.5), S(16, 5, 7.5), S(16, 5, 8) ],
    'Standing Overhead Press':                  [ S(25, 5, 7.5), S(27.5, 5, 8), S(27.5, 5, 8.5) ],
    'Chest Supported Row':                      [ S(22.5, 5, 7.5), S(22.5, 5, 8), S(25, 5, 8) ],
    'Cable Face Pull':                          [ S(11, 10, null), S(11, 10, null) ],
    'Hanging Knee Raise':                       [ S(0, 12, null), S(0, 10, null) ],
  },

  // ----- Block 2, W1 (deload / new block opens lighter) -----------------
  '2026-05-12': {
    'ISSA Exercise Library Barbell Back Squat': [ S(47.5, 6, 6), S(45, 8, 6), S(40, 10, 6.5) ],
    'Single Leg Dumbbell RDL':                  [ S(14, 10, 6), S(14, 10, 6), S(14, 10, 6.5) ],
    'Barbell Bench Press':                      [ S(40, 10, 6), S(40, 10, 6.5), S(40, 10, 6.5) ],
    'Narrow Grip Lat Pull Down':                [ S(45, 12, 7), S(45, 12, 7), S(45, 12, 7) ],
    'Kettlebell Side Bend':                     [ S(12, 12, null), S(12, 12, null) ],
    'Chest Supported Lat Raise':                [ S(5, 15, 7), S(5, 15, 7) ],
  },
  '2026-05-14': {
    'ISSA Exercise Library Barbell Deadlift':   [ S(60, 6, 6), S(65, 8, 6), S(67.5, 10, 6.5) ],
    'Dumbbell Bulgarian Split Squat':           [ S(14, 10, 6), S(14, 10, 6), S(12, 10, 6.5) ],
    'Standing Overhead Press':                  [ S(22.5, 10, 6), S(25, 10, 6), S(25, 10, 6.5) ],
    'Chest Supported Row':                      [ S(20, 10, 6), S(22.5, 10, 6), S(22.5, 10, 6.5) ],
    'Cable Face Pull':                          [ S(10, 12, null), S(10, 12, null) ],
    'Hanging Knee Raise':                       [ S(0, 10, null), S(0, 10, null) ],
  },
};

// Optional seed goals — leave empty; user adds via Goals view.
const SEED_GOALS = {
  // Example shape (uncomment to seed):
  // 'ISSA Exercise Library Barbell Back Squat': { targetWeight: 80, targetReps: 5, note: 'Bodyweight squat × 5' },
};

// Build the schedule.
// Today is 2026-05-19 (Tue) = W2. We seed 6 weeks back + 6 weeks forward.
// All date math runs in UTC to avoid timezone drift on ISO formatting.
function dateISO(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDaysUTC(d, n) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));
}
const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatLong(d) {
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
function formatShort(d) {
  return `${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function buildSchedule() {
  // Anchor: Tue 2026-05-19 (UTC).
  const today = new Date(Date.UTC(2026, 4, 19));
  const start = addDaysUTC(today, -7 * 6); // 6 weeks back
  const weeks = 13;
  const out = [];
  for (let w = 0; w < weeks; w++) {
    const tue = addDaysUTC(start, w * 7);
    const thu = addDaysUTC(tue, 2);
    // Anchor w=6 → W2. Cycle is 1..4.
    const wn = (((w - 5) % 4) + 4) % 4 + 1;
    out.push(buildWorkout(tue, TEMPLATES.strengthA, wn));
    out.push(buildWorkout(thu, TEMPLATES.strengthB, wn));
  }
  return out;
}

function buildWorkout(date, template, weekNum) {
  const iso = dateISO(date);
  const today = '2026-05-19';
  const isPast = iso < today;
  const prescription = WEEK_PRESCRIPTIONS[weekNum];
  const exercises = template.exercises.map(ex => ({
    ...ex,
    instructions: prescription[ex.label] || '3x10',
    results: (PAST_RESULTS[iso] && PAST_RESULTS[iso][ex.name]) || null, // array of {weight,reps,rpe} or null
  }));
  return {
    id: `${iso}-${template.name.replace(/\s+/g, '-').toLowerCase()}`,
    date: iso,
    weekday: WEEKDAYS[date.getUTCDay()],
    longDate: formatLong(date),
    shortDate: formatShort(date),
    name: `${template.name} W${weekNum}`,
    weekNum,
    warmup: template.warmup,
    exercises,
    completed: isPast, // past sessions auto-marked complete
  };
}

window.SEED_WORKOUTS = buildSchedule();
window.SEED_GOALS = SEED_GOALS;
window.HABIT_FIELDS = [
  { key: 'calories', label: 'Calories',     unit: '',     color: 'emerald', placeholder: '2400' },
  { key: 'protein',  label: 'Protein (g)',  unit: 'g',    color: 'emerald', placeholder: '180' },
  { key: 'carbs',    label: 'Carbs (g)',    unit: 'g',    color: 'emerald', placeholder: '260' },
  { key: 'fat',      label: 'Fat (g)',      unit: 'g',    color: 'emerald', placeholder: '80'  },
  { key: 'weight',   label: 'Weight',       unit: 'kg',   color: 'sky',     placeholder: '78.5' },
  { key: 'sleep',    label: 'Sleep (hr)',   unit: 'hr',   color: 'sky',     placeholder: '7.5' },
  { key: 'steps',    label: 'Steps',        unit: '',     color: 'sky',     placeholder: '8500' },
  { key: 'energy',   label: 'Energy',       unit: '/10',  color: 'pink',    placeholder: '7' },
  { key: 'hunger',   label: 'Hunger',       unit: '/10',  color: 'pink',    placeholder: '5' },
  { key: 'stress',   label: 'Stress',       unit: '/10',  color: 'pink',    placeholder: '3' },
];
