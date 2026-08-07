export interface SportExercise {
  id: string;
  name: string;
  category: string; // Muscle group or sport type
  equipment: string;
  isCustom?: boolean;
}

export const EXERCISE_CATEGORIES = [
  'Chest (Dada)',
  'Back (Punggung)',
  'Legs (Kaki)',
  'Shoulders (Bahu)',
  'Arms (Lengan)',
  'Core (Perut)',
  'Cardio',
  'Racket & Team Sports',
] as const;

export const CURATED_EXERCISES: SportExercise[] = [
  // --- CHEST ---
  { id: 'bench-press', name: 'Barbell Bench Press', category: 'Chest (Dada)', equipment: 'Barbell' },
  { id: 'incline-db-press', name: 'Incline Dumbbell Press', category: 'Chest (Dada)', equipment: 'Dumbbell' },
  { id: 'decline-bench-press', name: 'Decline Bench Press', category: 'Chest (Dada)', equipment: 'Barbell' },
  { id: 'dumbbell-fly', name: 'Dumbbell Chest Fly', category: 'Chest (Dada)', equipment: 'Dumbbell' },
  { id: 'cable-crossover', name: 'Cable Crossover / Fly', category: 'Chest (Dada)', equipment: 'Cable' },
  { id: 'chest-dips', name: 'Chest Dips', category: 'Chest (Dada)', equipment: 'Bodyweight' },
  { id: 'push-up', name: 'Push Up', category: 'Chest (Dada)', equipment: 'Bodyweight' },
  { id: 'pec-deck-fly', name: 'Pec Deck Machine Fly', category: 'Chest (Dada)', equipment: 'Machine' },

  // --- BACK ---
  { id: 'deadlift', name: 'Conventional Deadlift', category: 'Back (Punggung)', equipment: 'Barbell' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'Back (Punggung)', equipment: 'Cable' },
  { id: 'pull-up', name: 'Pull Up / Chin Up', category: 'Back (Punggung)', equipment: 'Bodyweight' },
  { id: 'barbell-row', name: 'Bent-Over Barbell Row', category: 'Back (Punggung)', equipment: 'Barbell' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', category: 'Back (Punggung)', equipment: 'Cable' },
  { id: 't-bar-row', name: 'T-Bar Row', category: 'Back (Punggung)', equipment: 'Barbell' },
  { id: 'single-arm-db-row', name: 'One-Arm Dumbbell Row', category: 'Back (Punggung)', equipment: 'Dumbbell' },
  { id: 'face-pull', name: 'Face Pull', category: 'Back (Punggung)', equipment: 'Cable' },

  // --- LEGS ---
  { id: 'barbell-squat', name: 'Barbell Back Squat', category: 'Legs (Kaki)', equipment: 'Barbell' },
  { id: 'front-squat', name: 'Front Squat', category: 'Legs (Kaki)', equipment: 'Barbell' },
  { id: 'leg-press', name: 'Leg Press', category: 'Legs (Kaki)', equipment: 'Machine' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift (RDL)', category: 'Legs (Kaki)', equipment: 'Barbell / DB' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'Legs (Kaki)', equipment: 'Dumbbell' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'Legs (Kaki)', equipment: 'Machine' },
  { id: 'hamstring-curl', name: 'Lying Hamstring Curl', category: 'Legs (Kaki)', equipment: 'Machine' },
  { id: 'calf-raise', name: 'Standing Calf Raise', category: 'Legs (Kaki)', equipment: 'Machine / DB' },
  { id: 'hip-thrust', name: 'Barbell Hip Thrust', category: 'Legs (Kaki)', equipment: 'Barbell' },

  // --- SHOULDERS ---
  { id: 'overhead-press', name: 'Overhead Shoulder Press (OHP)', category: 'Shoulders (Bahu)', equipment: 'Barbell' },
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'Shoulders (Bahu)', equipment: 'Dumbbell' },
  { id: 'lateral-raise', name: 'Dumbbell Lateral Raise', category: 'Shoulders (Bahu)', equipment: 'Dumbbell' },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', category: 'Shoulders (Bahu)', equipment: 'Cable' },
  { id: 'front-raise', name: 'Front Dumbbell Raise', category: 'Shoulders (Bahu)', equipment: 'Dumbbell' },
  { id: 'reverse-fly', name: 'Rear Delt Reverse Fly', category: 'Shoulders (Bahu)', equipment: 'Dumbbell / Machine' },
  { id: 'arnold-press', name: 'Arnold Press', category: 'Shoulders (Bahu)', equipment: 'Dumbbell' },
  { id: 'upright-row', name: 'Upright Row', category: 'Shoulders (Bahu)', equipment: 'Barbell / Cable' },

  // --- ARMS ---
  { id: 'barbell-curl', name: 'Barbell Bicep Curl', category: 'Arms (Lengan)', equipment: 'Barbell' },
  { id: 'dumbbell-curl', name: 'Dumbbell Bicep Curl', category: 'Arms (Lengan)', equipment: 'Dumbbell' },
  { id: 'hammer-curl', name: 'Dumbbell Hammer Curl', category: 'Arms (Lengan)', equipment: 'Dumbbell' },
  { id: 'preacher-curl', name: 'Preacher Curl', category: 'Arms (Lengan)', equipment: 'EZ Bar / Machine' },
  { id: 'tricep-pushdown', name: 'Tricep Rope Pushdown', category: 'Arms (Lengan)', equipment: 'Cable' },
  { id: 'skull-crusher', name: 'Skull Crusher (Lying Tricep Ext)', category: 'Arms (Lengan)', equipment: 'EZ Bar' },
  { id: 'overhead-tricep-ext', name: 'Overhead Tricep Extension', category: 'Arms (Lengan)', equipment: 'Dumbbell / Cable' },
  { id: 'tricep-dips', name: 'Parallel Bar Dips', category: 'Arms (Lengan)', equipment: 'Bodyweight' },

  // --- CORE ---
  { id: 'plank', name: 'Standard Plank', category: 'Core (Perut)', equipment: 'Bodyweight' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', category: 'Core (Perut)', equipment: 'Bodyweight' },
  { id: 'cable-woodchopper', name: 'Cable Woodchopper', category: 'Core (Perut)', equipment: 'Cable' },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', category: 'Core (Perut)', equipment: 'Ab Wheel' },
  { id: 'russian-twist', name: 'Russian Twist', category: 'Core (Perut)', equipment: 'Weight Plate' },
  { id: 'crunches', name: 'Abdominal Crunches', category: 'Core (Perut)', equipment: 'Bodyweight' },

  // --- CARDIO & ATHLETICS ---
  { id: 'running-outdoor', name: 'Outdoor Running / Lari Luar', category: 'Cardio', equipment: 'Shoes' },
  { id: 'treadmill', name: 'Treadmill Running / Walking', category: 'Cardio', equipment: 'Treadmill' },
  { id: 'cycling-outdoor', name: 'Outdoor Cycling / Sepeda', category: 'Cardio', equipment: 'Bicycle' },
  { id: 'stationary-bike', name: 'Stationary Spin Bike', category: 'Cardio', equipment: 'Bike Machine' },
  { id: 'swimming', name: 'Swimming / Renang', category: 'Cardio', equipment: 'Pool' },
  { id: 'jump-rope', name: 'Jump Rope / Skipping', category: 'Cardio', equipment: 'Rope' },
  { id: 'rowing-machine', name: 'Rowing Machine (Ergometer)', category: 'Cardio', equipment: 'Rowing Machine' },
  { id: 'hiit-circuit', name: 'HIIT Circuit Workout', category: 'Cardio', equipment: 'Mixed' },

  // --- SPORTS (INDONESIA & GLOBAL POPULAR) ---
  { id: 'badminton', name: 'Badminton / Bulutangkis', category: 'Racket & Team Sports', equipment: 'Racket' },
  { id: 'futsal', name: 'Futsal', category: 'Racket & Team Sports', equipment: 'Ball' },
  { id: 'football', name: 'Sepak Bola / Soccer', category: 'Racket & Team Sports', equipment: 'Ball' },
  { id: 'basketball', name: 'Basket / Basketball', category: 'Racket & Team Sports', equipment: 'Ball' },
  { id: 'tennis', name: 'Tenis Lapangan', category: 'Racket & Team Sports', equipment: 'Racket' },
  { id: 'padel', name: 'Padel Tennis', category: 'Racket & Team Sports', equipment: 'Racket' },
  { id: 'table-tennis', name: 'Tenis Meja / Ping Pong', category: 'Racket & Team Sports', equipment: 'Paddle' },
  { id: 'volleyball', name: 'Voli / Volleyball', category: 'Racket & Team Sports', equipment: 'Ball' },
];
