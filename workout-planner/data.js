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
  1: { A: '3x10 /6rpe',        B: '3x10 each side',  C: '3x10 /6rpe',    D: '3x12 /7rpe',  E1: '2x12 each side', E2: '2x15 /7rpe' },
  2: { A: '1x6 /6rpe\n1x8 /6rpe\n1x10 /6.5rpe', B: '3x8 each side', C: '3x8 /7rpe', D: '3x10 /7rpe', E1: '2x10 each side', E2: '2x15 /8rpe' },
  3: { A: '1x6 /7rpe\n1x6 /7rpe\n1x6 /7.5rpe',  B: '3x6 each side', C: '3x6 /7.5rpe', D: '3x8 /7rpe', E1: '2x10 each side', E2: '2x12 /8rpe' },
  4: { A: '1x7 /7rpe\n1x5 /7rpe\n1x3 /8/9rpe',  B: '3x5 each side', C: '3x5 /8rpe', D: '3x6 /8rpe', E1: '2x10 each side', E2: '2x12 /8.5rpe' },
};

// Past results (logged history) for a few exercises across past sessions.
// Shape: { 'YYYY-MM-DD': { 'Exercise Name': '47.5,52.5,55' } }
const PAST_RESULTS = {
  '2026-04-28': {
    'ISSA Exercise Library Barbell Back Squat': '45,50,52.5',
    'Single Leg Dumbbell RDL':                  '14,14,14',
    'Barbell Bench Press':                      '40,42.5,45',
    'Narrow Grip Lat Pull Down':                '45,47.5,50',
    'Kettlebell Side Bend':                     '12,12',
    'Chest Supported Lat Raise':                '6,6',
  },
  '2026-04-30': {
    'ISSA Exercise Library Barbell Deadlift':   '60,65,70',
    'Dumbbell Bulgarian Split Squat':           '14,14,14',
    'Standing Overhead Press':                  '22.5,25,25',
    'Chest Supported Row':                      '20,22.5,22.5',
    'Cable Face Pull':                          '10,10',
    'Hanging Knee Raise':                       'BW x10, BW x10',
  },
  '2026-05-05': {
    'ISSA Exercise Library Barbell Back Squat': '47.5,52.5,55',
    'Single Leg Dumbbell RDL':                  '16,16,16',
    'Barbell Bench Press':                      '42.5,45,47.5',
    'Narrow Grip Lat Pull Down':                '47.5,50,52.5',
    'Kettlebell Side Bend':                     '14,14',
    'Chest Supported Lat Raise':                '7,7',
  },
  '2026-05-07': {
    'ISSA Exercise Library Barbell Deadlift':   '65,70,72.5',
    'Dumbbell Bulgarian Split Squat':           '16,16,16',
    'Standing Overhead Press':                  '25,27.5,27.5',
    'Chest Supported Row':                      '22.5,22.5,25',
    'Cable Face Pull':                          '11,11',
    'Hanging Knee Raise':                       'BW x12, BW x10',
  },
  '2026-05-12': {
    'ISSA Exercise Library Barbell Back Squat': '47.5,45,40',
    'Single Leg Dumbbell RDL':                  '14,14,14',
    'Barbell Bench Press':                      '40,40,40',
    'Narrow Grip Lat Pull Down':                '45,45,45',
    'Kettlebell Side Bend':                     '12,12',
    'Chest Supported Lat Raise':                '5,5',
  },
  '2026-05-14': {
    'ISSA Exercise Library Barbell Deadlift':   '60,65,67.5',
    'Dumbbell Bulgarian Split Squat':           '14,14,12',
    'Standing Overhead Press':                  '22.5,25,25',
    'Chest Supported Row':                      '20,22.5,22.5',
    'Cable Face Pull':                          '10,10',
    'Hanging Knee Raise':                       'BW x10, BW x10',
  },
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
    results: (PAST_RESULTS[iso] && PAST_RESULTS[iso][ex.name]) || '',
  }));
  return {
    id: `${iso}-${template.name.replace(/\s+/g, '-').toLowerCase()}`,
    date: iso,
    weekday: WEEKDAYS[date.getUTCDay()],
    longDate: formatLong(date),
    shortDate: formatShort(date),
    name: `${template.name} W${weekNum}`,
    warmup: template.warmup,
    exercises,
    completed: isPast, // past sessions auto-marked complete
  };
}

window.SEED_WORKOUTS = buildSchedule();
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
