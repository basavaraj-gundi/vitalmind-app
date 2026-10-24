import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Dumbbell,
  Timer,
  Brain,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  Droplets,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Download,
  Upload,
  Settings,
  CheckCircle2,
  Activity,
  Share2,
  Copy,
  Volume2
} from 'lucide-react';

// ==========================================
// FIX #1: LOCAL TIMEZONE (IST) DATE HELPER
// Avoids UTC .toISOString() 5:30 AM rollover bug
// ==========================================
function getLocalYYYYMMDD(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================================
// FIX #2: HARDWARE AUDIO CHIME & HAPTIC VIBRATION
// Works offline with zero external MP3 files
// ==========================================
function triggerCompletionAlert() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([250, 120, 250, 120, 400]);
    }
  } catch (e) {
    console.warn('Vibration API unavailable:', e);
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
      gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.14 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 0.36);
    });
  } catch (e) {
    console.warn('Web Audio API alert error:', e);
  }
}

// ==========================================
// PERSISTENT LOCALSTORAGE HOOK
// ==========================================
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// ==========================================
// DEFAULT FOOD DATABASE (Indian & High-Protein Staples)
// ==========================================
const DEFAULT_FOODS = [
  { id: 'f1', name: 'Boiled Eggs (2 Whole)', cal: 155, protein: 12.6, carbs: 1.1, fat: 10.6, serving: '2 large' },
  { id: 'f2', name: 'Egg White Omelette (3 Whites + Veggies)', cal: 75, protein: 11, carbs: 3, fat: 1.5, serving: '1 omelette' },
  { id: 'f3', name: 'Paneer Bhurji / Grilled Paneer', cal: 265, protein: 18.3, carbs: 3.4, fat: 20.8, serving: '100g' },
  { id: 'f4', name: 'High-Protein Besan & Paneer Toastie (Breadless)', cal: 240, protein: 16, carbs: 14, fat: 12, serving: '1 griddle serving' },
  { id: 'f5', name: 'Veg / Egg Biryani', cal: 340, protein: 11, carbs: 46, fat: 12, serving: '1 medium bowl (250g)' },
  { id: 'f6', name: 'Mushroom Masala Curry', cal: 185, protein: 6.5, carbs: 12, fat: 13, serving: '1 bowl (200g)' },
  { id: 'f7', name: 'Whole Wheat Chapati / Roti', cal: 104, protein: 3.1, carbs: 20.4, fat: 1.2, serving: '1 piece (40g)' },
  { id: 'f8', name: 'Malabar Parotta', cal: 260, protein: 4.5, carbs: 36, fat: 11, serving: '1 piece (85g)' },
  { id: 'f9', name: 'Dal Tadka (Yellow Lentils)', cal: 180, protein: 9, carbs: 22, fat: 6, serving: '1 bowl (200g)' },
  { id: 'f10', name: 'Steamed White / Brown Rice', cal: 195, protein: 4, carbs: 42, fat: 0.5, serving: '1 bowl (150g)' },
  { id: 'f11', name: 'Rolled Oats with Skim Milk', cal: 220, protein: 9.5, carbs: 36, fat: 4, serving: '1 bowl (50g dry)' },
  { id: 'f12', name: 'Whey Protein Isolate Scoop', cal: 120, protein: 24, carbs: 2, fat: 1.5, serving: '1 scoop (30g)' },
  { id: 'f13', name: 'Roasted Chana / Peanuts Mix', cal: 170, protein: 7, carbs: 15, fat: 9, serving: '1 handful (40g)' },
  { id: 'f14', name: 'Masala Dosa with Sambar', cal: 310, protein: 7, carbs: 48, fat: 10, serving: '1 dosa' },
  { id: 'f15', name: 'Idli (2 Pieces) + Sambar', cal: 165, protein: 5.5, carbs: 32, fat: 1.5, serving: '2 idlis' },
  { id: 'f16', name: 'Banana (Medium / Yelakki)', cal: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: '1 medium' },
  { id: 'f17', name: 'Greek Yogurt / Thick Curd', cal: 98, protein: 10, carbs: 4, fat: 4, serving: '1 cup (150g)' },
  { id: 'f18', name: 'Black Coffee / Green Tea (Unsweetened)', cal: 5, protein: 0.3, carbs: 0.5, fat: 0, serving: '1 mug' }
];

// ==========================================
// HOME WORKOUT CATALOG (Weight & Distance Aware)
// ==========================================
const WORKOUT_CATALOG = [
  {
    id: 'pushup',
    name: 'Standard Pushups',
    category: 'Strength • Chest, Triceps & Core',
    type: 'reps',
    baseCalPerRepAt70kg: 0.48,
    defaultSets: 3,
    defaultReps: 15,
    steps: [
      'Place hands slightly wider than shoulder-width apart on the floor.',
      'Lock your core and glutes so your body forms a straight plank line from head to heels.',
      'Lower your chest toward the floor by angling elbows at 45 degrees (like an arrow, not a T).',
      'Press firmly through your palms to return to the starting lockout position.'
    ],
    mistakes: [
      'Flaring elbows out at 90 degrees (strains shoulders).',
      'Letting hips sag or piking hips up into the air.'
    ]
  },
  {
    id: 'pullup',
    name: 'Strict Pullups',
    category: 'Strength • Lats, Upper Back & Biceps',
    type: 'reps',
    baseCalPerRepAt70kg: 1.05,
    defaultSets: 3,
    defaultReps: 8,
    steps: [
      'Grip the overhead bar slightly wider than shoulder-width with an overhand (pronated) grip.',
      'Start from a dead hang, then depress your shoulder blades down and back (active hang).',
      'Drive your elbows down toward your ribs until your chin clears the bar.',
      'Lower yourself under strict 2-second control back to a full hang.'
    ],
    mistakes: [
      'Kipping or swinging legs for momentum instead of engaging the lats.',
      'Only doing half-reps without full arm extension at the bottom.'
    ]
  },
  {
    id: 'squats',
    name: 'Bodyweight Squats',
    category: 'Strength • Quads, Glutes & Hamstrings',
    type: 'reps',
    baseCalPerRepAt70kg: 0.45,
    defaultSets: 4,
    defaultReps: 20,
    steps: [
      'Stand with feet shoulder-width apart and toes turned slightly outward (10–15 degrees).',
      'Brace your core, keep your chest proud, and hinge your hips back and down.',
      'Lower until your thighs are at least parallel to the floor, tracking knees over toes.',
      'Drive through your mid-foot and heels to stand tall and squeeze glutes at the top.'
    ],
    mistakes: [
      'Letting knees cave inward (valgus collapse) on the way up.',
      'Lifting heels off the floor or rounding the lower back.'
    ]
  },
  {
    id: 'plank',
    name: 'Forearm Isometric Plank',
    category: 'Core Stability • Transverse Abdominis & Glutes',
    type: 'hold',
    met: 4.0,
    defaultHoldSec: 60,
    steps: [
      'Place forearms flat on the floor with elbows stacked directly beneath your shoulders.',
      'Extend legs behind you on the balls of your feet, hip-width apart.',
      'Tuck your tailbone slightly (posterior pelvic tilt) and brace your abs as if taking a punch.',
      'Keep your neck neutral by gazing at the floor between your hands and breathe steadily.'
    ],
    mistakes: [
      'Holding your breath or looking up at the ceiling.',
      'Letting the lower back arch as fatigue sets in.'
    ]
  },
  {
    id: 'burpees',
    name: 'Full Conditioning Burpees',
    category: 'HIIT • Full Body Explosive Conditioning',
    type: 'reps',
    baseCalPerRepAt70kg: 1.45,
    defaultSets: 3,
    defaultReps: 12,
    steps: [
      'Stand tall, then squat down and place both hands flat on the floor in front of your feet.',
      'Jump or step both feet back into a tight high-plank position.',
      'Perform one controlled pushup, touching your chest to the floor.',
      'Jump your feet back outside your hands and explosively jump up with hands overhead.'
    ],
    mistakes: [
      'Snaking the lower back up off the floor instead of keeping a rigid torso.',
      'Landing stiff-legged with heels off the ground when jumping feet forward.'
    ]
  },
  {
    id: 'running',
    name: 'Tempo Running',
    category: 'Cardio • High Aerobic & VO2 Max',
    type: 'cardio',
    met: 9.8,
    distanceFactor: 1.03, // kcal per kg per km
    defaultDurationMin: 20,
    defaultKm: 3.5,
    steps: [
      'Maintain a tall posture with a slight forward lean originating from the ankles, not the waist.',
      'Land softly on your mid-foot directly underneath your center of mass.',
      'Drive elbows straight back at a 90-degree angle without crossing your arms over your chest.',
      'Keep a rhythmic cadence (aim for ~170–180 steps per minute) with steady nasal/mouth breathing.'
    ],
    mistakes: [
      'Overstriding and slamming the heel far in front of the body.',
      'Hunching shoulders up toward your ears.'
    ]
  },
  {
    id: 'jogging',
    name: 'Steady Zone-2 Jogging',
    category: 'Cardio • Fat Oxidation & Endurance Base',
    type: 'cardio',
    met: 7.0,
    distanceFactor: 0.95, // kcal per kg per km
    defaultDurationMin: 30,
    defaultKm: 4.0,
    steps: [
      'Settle into a conversational pace where you can speak a full sentence without gasping.',
      'Keep steps light, short, and rhythmic to minimize joint impact.',
      'Relax your jaw, hands (imagine lightly holding a potato chip), and shoulders.',
      'Breathe deeply into your diaphragm (3 steps inhale, 3 steps exhale).'
    ],
    mistakes: [
      'Starting too fast in the first 5 minutes and spiking heart rate out of Zone 2.',
      'Bouncing excessively up and down instead of gliding forward.'
    ]
  },
  {
    id: 'walking',
    name: 'Brisk Power Walking',
    category: 'Cardio • Active Recovery & NEAT Burn',
    type: 'cardio',
    met: 4.3,
    distanceFactor: 0.68, // kcal per kg per km
    defaultDurationMin: 40,
    defaultKm: 3.8,
    steps: [
      'Keep chin parallel to the ground and eyes focused 15–20 feet ahead.',
      'Roll smoothly through each step from heel strike through mid-foot to a strong toe push-off.',
      'Swing arms naturally from the shoulders to increase calorie burn and momentum.',
      'Engage your core lightly to protect your lumbar spine on longer walks.'
    ],
    mistakes: [
      'Looking down at your phone screen (strains cervical spine).',
      'Taking overly long strides instead of increasing step frequency.'
    ]
  }
];

// ==========================================
// ANIMATED SVG BIOMECHANICS DEMONSTRATOR
// ==========================================
function ExerciseVisualizer({ exerciseId }) {
  return (
    <div className="relative w-full h-44 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes pushupBody {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(18px) rotate(6deg); }
        }
        @keyframes pullupBody {
          0%, 100% { transform: translateY(16px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes squatHips {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(22px); }
        }
        @keyframes plankPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes strideLeft {
          0%, 100% { transform: rotate(-22deg); }
          50% { transform: rotate(22deg); }
        }
        @keyframes strideRight {
          0%, 100% { transform: rotate(22deg); }
          50% { transform: rotate(-22deg); }
        }
        @keyframes burpeeJump {
          0%, 100% { transform: translateY(0px); }
          35% { transform: translateY(24px) scaleY(0.82); }
          70% { transform: translateY(-18px); }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      <div className="absolute bottom-6 left-8 right-8 h-0.5 bg-emerald-500/40 rounded-full" />

      {exerciseId === 'pushup' && (
        <svg viewBox="0 0 220 120" className="w-56 h-36 z-10">
          <g style={{ animation: 'pushupBody 2.2s ease-in-out infinite', transformOrigin: '170px 92px' }}>
            <circle cx="55" cy="52" r="10" className="fill-emerald-400" />
            <line x1="65" y1="56" x2="170" y2="88" className="stroke-emerald-400" strokeWidth="6" strokeLinecap="round" />
            <line x1="82" y1="62" x2="72" y2="95" className="stroke-cyan-400" strokeWidth="5" strokeLinecap="round" />
          </g>
          <circle cx="170" cy="92" r="4" className="fill-slate-400" />
        </svg>
      )}

      {exerciseId === 'pullup' && (
        <svg viewBox="0 0 200 130" className="w-52 h-36 z-10">
          <line x1="40" y1="18" x2="160" y2="18" className="stroke-slate-400" strokeWidth="5" strokeLinecap="round" />
          <g style={{ animation: 'pullupBody 2.4s ease-in-out infinite' }}>
            <circle cx="100" cy="42" r="10" className="fill-emerald-400" />
            <line x1="100" y1="52" x2="100" y2="92" className="stroke-emerald-400" strokeWidth="6" strokeLinecap="round" />
            <line x1="100" y1="58" x2="75" y2="20" className="stroke-cyan-400" strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="58" x2="125" y2="20" className="stroke-cyan-400" strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="92" x2="92" y2="118" className="stroke-emerald-500" strokeWidth="5" strokeLinecap="round" />
            <line x1="100" y1="92" x2="108" y2="118" className="stroke-emerald-500" strokeWidth="5" strokeLinecap="round" />
          </g>
        </svg>
      )}

      {exerciseId === 'squats' && (
        <svg viewBox="0 0 200 130" className="w-52 h-36 z-10">
          <g style={{ animation: 'squatHips 2.2s ease-in-out infinite' }}>
            <circle cx="100" cy="28" r="10" className="fill-emerald-400" />
            <line x1="100" y1="38" x2="90" y2="75" className="stroke-emerald-400" strokeWidth="6" strokeLinecap="round" />
            <line x1="100" y1="48" x2="128" y2="48" className="stroke-cyan-400" strokeWidth="4" strokeLinecap="round" />
            <line x1="90" y1="75" x2="112" y2="90" className="stroke-emerald-500" strokeWidth="5" strokeLinecap="round" />
          </g>
          <line x1="112" y1="90" x2="105" y2="112" className="stroke-slate-300" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )}

      {exerciseId === 'plank' && (
        <svg viewBox="0 0 220 120" className="w-56 h-36 z-10">
          <g style={{ animation: 'plankPulse 2s ease-in-out infinite' }}>
            <circle cx="52" cy="64" r="9" className="fill-emerald-400" />
            <line x1="62" y1="68" x2="168" y2="86" className="stroke-emerald-400" strokeWidth="6" strokeLinecap="round" />
            <line x1="75" y1="70" x2="75" y2="95" className="stroke-cyan-400" strokeWidth="5" strokeLinecap="round" />
            <line x1="75" y1="95" x2="55" y2="95" className="stroke-cyan-400" strokeWidth="4" strokeLinecap="round" />
            <circle cx="115" cy="77" r="14" className="fill-amber-400/20 stroke-amber-400" strokeDasharray="3 3" />
          </g>
        </svg>
      )}

      {exerciseId === 'burpees' && (
        <svg viewBox="0 0 200 130" className="w-52 h-36 z-10">
          <g style={{ animation: 'burpeeJump 1.8s ease-in-out infinite' }}>
            <circle cx="100" cy="36" r="10" className="fill-amber-400" />
            <line x1="100" y1="46" x2="100" y2="82" className="stroke-amber-400" strokeWidth="6" strokeLinecap="round" />
            <line x1="100" y1="54" x2="80" y2="22" className="stroke-cyan-400" strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="54" x2="120" y2="22" className="stroke-cyan-400" strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="82" x2="86" y2="110" className="stroke-amber-500" strokeWidth="5" strokeLinecap="round" />
            <line x1="100" y1="82" x2="114" y2="110" className="stroke-amber-500" strokeWidth="5" strokeLinecap="round" />
          </g>
        </svg>
      )}

      {(exerciseId === 'running' || exerciseId === 'jogging' || exerciseId === 'walking') && (
        <svg viewBox="0 0 200 130" className="w-52 h-36 z-10">
          <circle cx="105" cy="28" r="10" className="fill-emerald-400" />
          <line x1="105" y1="38" x2="98" y2="74" className="stroke-emerald-400" strokeWidth="6" strokeLinecap="round" />
          <g style={{ animation: `strideLeft ${exerciseId === 'running' ? '0.6s' : exerciseId === 'jogging' ? '0.9s' : '1.4s'} ease-in-out infinite`, transformOrigin: '98px 74px' }}>
            <line x1="98" y1="74" x2="82" y2="110" className="stroke-emerald-400" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g style={{ animation: `strideRight ${exerciseId === 'running' ? '0.6s' : exerciseId === 'jogging' ? '0.9s' : '1.4s'} ease-in-out infinite`, transformOrigin: '98px 74px' }}>
            <line x1="98" y1="74" x2="116" y2="110" className="stroke-cyan-400" strokeWidth="5" strokeLinecap="round" />
          </g>
        </svg>
      )}

      <span className="absolute top-2.5 right-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/90 text-emerald-400 border border-slate-700">
        Live Form Guide
      </span>
    </div>
  );
}

// ==========================================
// MAIN ANDROID APPLICATION (v1.1)
// ==========================================
export default function App() {
  const todayStr = getLocalYYYYMMDD();
  const [activeTab, setActiveTab] = useState('calories');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showDataModal, setShowDataModal] = useState(false);
  const [backupJsonPreview, setBackupJsonPreview] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // ------------------------------------------
  // 1. PERSISTENT STATE: CALORIES, MACROS & BODY WEIGHT
  // ------------------------------------------
  const [goals, setGoals] = useLocalStorage('vitalmind_goals_v1', {
    calories: 2100,
    protein: 130,
    carbs: 220,
    fat: 65,
    weightKg: 72
  });
  const [customFoods, setCustomFoods] = useLocalStorage('vitalmind_custom_foods_v1', []);
  const [dailyFoodLogs, setDailyFoodLogs] = useLocalStorage('vitalmind_food_logs_v1', {});
  const [dailyWaterLogs, setDailyWaterLogs] = useLocalStorage('vitalmind_water_v1', {});

  const [activeMealType, setActiveMealType] = useState('Breakfast');
  const [foodSearch, setFoodSearch] = useState('');
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', cal: '', protein: '', carbs: '', fat: '', serving: '1 serving' });

  // ------------------------------------------
  // 2. PERSISTENT STATE: WORKOUTS & BACKGROUND-SAFE STOPWATCH
  // ------------------------------------------
  const [workoutLogs, setWorkoutLogs] = useLocalStorage('vitalmind_workout_logs_v1', []);
  const [selectedExerciseId, setSelectedExerciseId] = useState('pushup');
  const [setsInput, setSetsInput] = useState(3);
  const [repsInput, setRepsInput] = useState(15);
  const [cardioMinInput, setCardioMinInput] = useState(20);
  const [cardioKmInput, setCardioKmInput] = useState(3.5);

  // Wall-clock timestamp stopwatch for Plank Hold
  const [holdStopwatchSec, setHoldStopwatchSec] = useState(0);
  const [holdRunning, setHoldRunning] = useState(false);
  const [holdStartTimestamp, setHoldStartTimestamp] = useState(null);

  // ------------------------------------------
  // 3. PERSISTENT STATE: POMODORO (Editable Durations + Wall-Clock Timer)
  // ------------------------------------------
  const [pomoSettings, setPomoSettings] = useLocalStorage('vitalmind_pomo_settings_v1', {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    completedSessions: 0
  });
  const [pomoTasks, setPomoTasks] = useLocalStorage('vitalmind_pomo_tasks_v1', [
    { id: 't1', text: 'Complete deep work block without checking notifications', done: false }
  ]);
  const [pomoMode, setPomoMode] = useState('focus');
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState((pomoSettings.focus || 25) * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoTargetEndMs, setPomoTargetEndMs] = useState(null);
  const [newPomoTask, setNewPomoTask] = useState('');
  const [showPomoConfig, setShowPomoConfig] = useState(false);

  // ------------------------------------------
  // 4. PERSISTENT STATE: CBT AVOID-AND-ESCAPE LOOP
  // ------------------------------------------
  const [cbtJournal, setCbtJournal] = useLocalStorage('vitalmind_cbt_journal_v1', []);
  const [cbtForm, setCbtForm] = useLocalStorage('vitalmind_cbt_draft_v1', {
    avoidedTask: '',
    triggerEmotion: 'Overwhelm / Ambiguity',
    escapeUrge: 'Scrolling Reels / Social',
    automaticThought: '',
    rationalReframe: '',
    microStep: '',
    anxietyBefore: 8,
    anxietyAfter: 4
  });
  const [microTimerSec, setMicroTimerSec] = useState(120);
  const [microTimerRunning, setMicroTimerRunning] = useState(false);
  const [microTargetEndMs, setMicroTargetEndMs] = useState(null);

  // ------------------------------------------
  // FIX #2: WALL-CLOCK TIMERS (Survive Android Screen Off / App Switch)
  // ------------------------------------------
  // Plank Stopwatch (Counts Up accurately via Date.now())
  useEffect(() => {
    if (!holdRunning || !holdStartTimestamp) return;
    const syncStopwatch = () => {
      const elapsed = Math.floor((Date.now() - holdStartTimestamp) / 1000);
      setHoldStopwatchSec(Math.max(0, elapsed));
    };
    syncStopwatch();
    const id = setInterval(syncStopwatch, 400);
    document.addEventListener('visibilitychange', syncStopwatch);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', syncStopwatch);
    };
  }, [holdRunning, holdStartTimestamp]);

  // Pomodoro Countdown (Counts Down accurately via Date.now())
  useEffect(() => {
    if (!pomoRunning || !pomoTargetEndMs) return;
    const syncPomo = () => {
      const remaining = Math.ceil((pomoTargetEndMs - Date.now()) / 1000);
      if (remaining <= 0) {
        setPomoSecondsLeft(0);
        setPomoRunning(false);
        setPomoTargetEndMs(null);
        triggerCompletionAlert();
        if (pomoMode === 'focus') {
          setPomoSettings((s) => ({ ...s, completedSessions: (s.completedSessions || 0) + 1 }));
          showToast('Focus session complete! Chime & vibration triggered.');
        } else {
          showToast('Break finished! Ready to focus.');
        }
      } else {
        setPomoSecondsLeft(remaining);
      }
    };
    syncPomo();
    const id = setInterval(syncPomo, 400);
    document.addEventListener('visibilitychange', syncPomo);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', syncPomo);
    };
  }, [pomoRunning, pomoTargetEndMs, pomoMode, setPomoSettings]);

  // CBT 2-Minute Micro-Exposure Countdown (Counts Down accurately via Date.now())
  useEffect(() => {
    if (!microTimerRunning || !microTargetEndMs) return;
    const syncMicro = () => {
      const remaining = Math.ceil((microTargetEndMs - Date.now()) / 1000);
      if (remaining <= 0) {
        setMicroTimerSec(0);
        setMicroTimerRunning(false);
        setMicroTargetEndMs(null);
        triggerCompletionAlert();
        showToast('2-Minute Micro-Exposure Complete! Rate your urge now.');
      } else {
        setMicroTimerSec(remaining);
      }
    };
    syncMicro();
    const id = setInterval(syncMicro, 400);
    document.addEventListener('visibilitychange', syncMicro);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', syncMicro);
    };
  }, [microTimerRunning, microTargetEndMs]);

  // Timer Start/Pause Toggles
  const toggleHoldTimer = () => {
    if (holdRunning) {
      setHoldRunning(false);
      setHoldStartTimestamp(null);
    } else {
      setHoldStartTimestamp(Date.now() - holdStopwatchSec * 1000);
      setHoldRunning(true);
    }
  };

  const togglePomoTimer = () => {
    if (pomoRunning) {
      setPomoRunning(false);
      setPomoTargetEndMs(null);
    } else {
      const secs = pomoSecondsLeft > 0 ? pomoSecondsLeft : (pomoSettings[pomoMode] || 25) * 60;
      setPomoTargetEndMs(Date.now() + secs * 1000);
      setPomoRunning(true);
    }
  };

  const toggleMicroTimer = () => {
    if (microTimerRunning) {
      setMicroTimerRunning(false);
      setMicroTargetEndMs(null);
    } else {
      const secs = microTimerSec > 0 ? microTimerSec : 120;
      setMicroTargetEndMs(Date.now() + secs * 1000);
      setMicroTimerRunning(true);
    }
  };

  // ------------------------------------------
  // COMPUTED DAILY NUTRITION & WEIGHT-BASED BURN
  // ------------------------------------------
  const userWeightKg = Number(goals.weightKg) > 25 ? Number(goals.weightKg) : 72;
  const allFoods = useMemo(() => [...customFoods, ...DEFAULT_FOODS], [customFoods]);
  const currentDayFoods = dailyFoodLogs[selectedDate] || [];
  const currentWaterGlasses = dailyWaterLogs[selectedDate] || 0;

  const currentDayWorkouts = useMemo(
    () => workoutLogs.filter((w) => w.date === selectedDate),
    [workoutLogs, selectedDate]
  );

  const totals = useMemo(() => {
    return currentDayFoods.reduce(
      (acc, item) => ({
        cal: acc.cal + Number(item.cal || 0),
        protein: acc.protein + Number(item.protein || 0),
        carbs: acc.carbs + Number(item.carbs || 0),
        fat: acc.fat + Number(item.fat || 0)
      }),
      { cal: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [currentDayFoods]);

  const burnedCaloriesToday = useMemo(() => {
    return Math.round(currentDayWorkouts.reduce((sum, w) => sum + Number(w.caloriesBurned || 0), 0));
  }, [currentDayWorkouts]);

  const filteredFoodCatalog = useMemo(() => {
    const q = foodSearch.trim().toLowerCase();
    if (!q) return allFoods;
    return allFoods.filter((f) => f.name.toLowerCase().includes(q));
  }, [allFoods, foodSearch]);

  // ------------------------------------------
  // HANDLERS: NUTRITION
  // ------------------------------------------
  const logFoodItem = (food) => {
    const entry = {
      ...food,
      logId: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      mealType: activeMealType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDailyFoodLogs((prev) => ({
      ...prev,
      [selectedDate]: [entry, ...(prev[selectedDate] || [])]
    }));
    showToast(`Added ${food.name} to ${activeMealType}`);
  };

  const removeLoggedFood = (logId) => {
    setDailyFoodLogs((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((item) => item.logId !== logId)
    }));
  };

  const handleCreateCustomFood = (e) => {
    e.preventDefault();
    if (!newFood.name || !newFood.cal) return;
    const created = {
      id: `custom_${Date.now()}`,
      name: newFood.name,
      cal: Number(newFood.cal),
      protein: Number(newFood.protein || 0),
      carbs: Number(newFood.carbs || 0),
      fat: Number(newFood.fat || 0),
      serving: newFood.serving || '1 serving'
    };
    setCustomFoods((prev) => [created, ...prev]);
    logFoodItem(created);
    setNewFood({ name: '', cal: '', protein: '', carbs: '', fat: '', serving: '1 serving' });
    setShowCustomFoodForm(false);
  };

  const updateWater = (delta) => {
    setDailyWaterLogs((prev) => {
      const current = prev[selectedDate] || 0;
      const next = Math.max(0, Math.min(16, current + delta));
      return { ...prev, [selectedDate]: next };
    });
  };

  // FIX #1: Safe Local Date Shifting
  const shiftDate = (daysDelta) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const localDate = new Date(y, m - 1, d + daysDelta);
    setSelectedDate(getLocalYYYYMMDD(localDate));
  };

  // ------------------------------------------
  // FIX #4: WEIGHT & DISTANCE AWARE WORKOUT BURN
  // ------------------------------------------
  const selectedExercise = WORKOUT_CATALOG.find((e) => e.id === selectedExerciseId) || WORKOUT_CATALOG[0];

  const handleSelectExercise = (ex) => {
    setSelectedExerciseId(ex.id);
    if (ex.type === 'reps') {
      setSetsInput(ex.defaultSets);
      setRepsInput(ex.defaultReps);
    } else if (ex.type === 'cardio') {
      setCardioMinInput(ex.defaultDurationMin);
      setCardioKmInput(ex.defaultKm);
    } else if (ex.type === 'hold') {
      setHoldRunning(false);
      setHoldStartTimestamp(null);
      setHoldStopwatchSec(ex.defaultHoldSec);
    }
  };

  const estimatedWorkoutBurn = useMemo(() => {
    const weightRatio = userWeightKg / 70;
    if (selectedExercise.type === 'reps') {
      const totalReps = Math.max(0, Number(setsInput) * Number(repsInput));
      return Math.round(totalReps * selectedExercise.baseCalPerRepAt70kg * weightRatio);
    } else if (selectedExercise.type === 'hold') {
      const secs = holdStopwatchSec > 0 ? holdStopwatchSec : 60;
      const hours = secs / 3600;
      return Math.max(4, Math.round(selectedExercise.met * userWeightKg * hours * 1.15));
    } else if (selectedExercise.type === 'cardio') {
      const mins = Math.max(1, Number(cardioMinInput));
      const km = Math.max(0, Number(cardioKmInput));
      // Blend distance-based mechanical work (km * kg * factor) with MET duration burn
      const distanceKcal = km > 0 ? km * userWeightKg * selectedExercise.distanceFactor : 0;
      const metKcal = selectedExercise.met * userWeightKg * (mins / 60);
      return Math.round(km > 0 ? distanceKcal * 0.65 + metKcal * 0.35 : metKcal);
    }
    return 0;
  }, [selectedExercise, setsInput, repsInput, holdStopwatchSec, cardioMinInput, cardioKmInput, userWeightKg]);

  const handleLogWorkoutSession = () => {
    let summary = '';
    const caloriesBurned = estimatedWorkoutBurn;

    if (selectedExercise.type === 'reps') {
      const totalReps = Number(setsInput) * Number(repsInput);
      summary = `${setsInput} sets × ${repsInput} reps (${totalReps} reps @ ${userWeightKg}kg)`;
    } else if (selectedExercise.type === 'hold') {
      const secs = holdStopwatchSec > 0 ? holdStopwatchSec : 60;
      summary = `${secs} sec hold (@ ${userWeightKg}kg)`;
    } else if (selectedExercise.type === 'cardio') {
      summary = `${cardioMinInput} mins • ${cardioKmInput} km (@ ${userWeightKg}kg)`;
    }

    const entry = {
      id: `wk_${Date.now()}`,
      date: selectedDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exerciseName: selectedExercise.name,
      summary,
      caloriesBurned
    };

    setWorkoutLogs((prev) => [entry, ...prev]);
    setHoldRunning(false);
    setHoldStartTimestamp(null);
    showToast(`Logged ${selectedExercise.name} (+${caloriesBurned} kcal burned)`);
  };

  // ------------------------------------------
  // HANDLERS: CBT AVOID-AND-ESCAPE LOOP
  // ------------------------------------------
  const handleSaveCbtEntry = (e) => {
    e.preventDefault();
    if (!cbtForm.avoidedTask.trim()) {
      showToast('Please enter the task you are avoiding first.');
      return;
    }
    const entry = {
      id: `cbt_${Date.now()}`,
      date: selectedDate,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...cbtForm
    };
    setCbtJournal((prev) => [entry, ...prev]);
    setCbtForm({
      avoidedTask: '',
      triggerEmotion: 'Overwhelm / Ambiguity',
      escapeUrge: 'Scrolling Reels / Social',
      automaticThought: '',
      rationalReframe: '',
      microStep: '',
      anxietyBefore: 8,
      anxietyAfter: 4
    });
    showToast('CBT Loop Reframe saved to device storage!');
  };

  // ------------------------------------------
  // FIX #3: WEBVIEW-SAFE BACKUP (Clipboard + Android Native Share)
  // ------------------------------------------
  const buildBackupJsonString = () => {
    const payload = {
      app: 'VitalMind',
      version: '1.1',
      exportedAt: new Date().toISOString(),
      goals,
      customFoods,
      dailyFoodLogs,
      dailyWaterLogs,
      workoutLogs,
      pomoSettings,
      pomoTasks,
      cbtJournal
    };
    return JSON.stringify(payload, null, 2);
  };

  const openBackupModal = () => {
    setBackupJsonPreview(buildBackupJsonString());
    setShowDataModal(true);
  };

  const copyBackupToClipboard = async () => {
    const jsonStr = buildBackupJsonString();
    setBackupJsonPreview(jsonStr);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
        showToast('Backup JSON