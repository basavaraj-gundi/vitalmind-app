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
  Activity
} from 'lucide-react';

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
// HOME WORKOUT CATALOG (8 Requested Exercises)
// ==========================================
const WORKOUT_CATALOG = [
  {
    id: 'pushup',
    name: 'Standard Pushups',
    category: 'Strength • Chest, Triceps & Core',
    type: 'reps',
    calPerUnit: 0.5, // per rep
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
    calPerUnit: 1.0, // per rep
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
    calPerUnit: 0.45, // per rep
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
    calPerUnit: 0.08, // per second
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
    calPerUnit: 1.4, // per rep
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
    calPerUnit: 11.5, // per minute
    defaultDurationMin: 20,
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
    calPerUnit: 8.0, // per minute
    defaultDurationMin: 30,
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
    calPerUnit: 4.8, // per minute
    defaultDurationMin: 40,
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

      {/* Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      {/* Floor Line */}
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
          {/* Pullup Bar */}
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
// MAIN ANDROID APPLICATION
// ==========================================
export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState('calories');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showDataModal, setShowDataModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  // ------------------------------------------
  // 1. PERSISTENT STATE: CALORIES & NUTRITION
  // ------------------------------------------
  const [goals, setGoals] = useLocalStorage('vitalmind_goals_v1', {
    calories: 2100,
    protein: 130,
    carbs: 220,
    fat: 65
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
  // 2. PERSISTENT STATE: WORKOUTS
  // ------------------------------------------
  const [workoutLogs, setWorkoutLogs] = useLocalStorage('vitalmind_workout_logs_v1', []);
  const [selectedExerciseId, setSelectedExerciseId] = useState('pushup');
  const [setsInput, setSetsInput] = useState(3);
  const [repsInput, setRepsInput] = useState(15);
  const [cardioMinInput, setCardioMinInput] = useState(20);
  const [cardioKmInput, setCardioKmInput] = useState(3.0);
  const [holdStopwatchSec, setHoldStopwatchSec] = useState(0);
  const [holdRunning, setHoldRunning] = useState(false);

  // ------------------------------------------
  // 3. PERSISTENT STATE: POMODORO
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
  const [pomoMode, setPomoMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState(pomoSettings.focus * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [newPomoTask, setNewPomoTask] = useState('');

  // ------------------------------------------
  // 4. PERSISTENT STATE: CBT AVOID-AND-ESCAPE LOOP
  // ------------------------------------------
  const [cbtJournal, setCbtJournal] = useLocalStorage('vitalmind_cbt_journal_v1', []);
  const [cbtForm, setCbtForm] = useState({
    avoidedTask: '',
    triggerEmotion: 'Overwhelm / Fear of Imperfection',
    escapeUrge: 'Scrolling phone / Switching to easy low-priority tasks',
    automaticThought: '',
    rationalReframe: '',
    microStep: '',
    anxietyBefore: 8,
    anxietyAfter: 4
  });
  const [microTimerSec, setMicroTimerSec] = useState(120);
  const [microTimerRunning, setMicroTimerRunning] = useState(false);

  // ------------------------------------------
  // TIMERS (Plank Stopwatch, Pomodoro, CBT 2-Min Starter)
  // ------------------------------------------
  useEffect(() => {
    if (!holdRunning) return;
    const id = setInterval(() => setHoldStopwatchSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [holdRunning]);

  useEffect(() => {
    if (!pomoRunning) return;
    const id = setInterval(() => {
      setPomoSecondsLeft((prev) => {
        if (prev <= 1) {
          setPomoRunning(false);
          if (pomoMode === 'focus') {
            setPomoSettings((s) => ({ ...s, completedSessions: (s.completedSessions || 0) + 1 }));
            showToast('Focus session complete! Saved to your stats.');
          } else {
            showToast('Break finished! Ready to focus.');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pomoRunning, pomoMode, setPomoSettings]);

  useEffect(() => {
    if (!microTimerRunning) return;
    const id = setInterval(() => {
      setMicroTimerSec((prev) => {
        if (prev <= 1) {
          setMicroTimerRunning(false);
          showToast('2-Minute Micro-Exposure Complete! Notice how the friction dropped.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [microTimerRunning]);

  // ------------------------------------------
  // COMPUTED DAILY NUTRITION & BURN
  // ------------------------------------------
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

  const shiftDate = (daysDelta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + daysDelta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // ------------------------------------------
  // HANDLERS: WORKOUTS
  // ------------------------------------------
  const selectedExercise = WORKOUT_CATALOG.find((e) => e.id === selectedExerciseId) || WORKOUT_CATALOG[0];

  const handleSelectExercise = (ex) => {
    setSelectedExerciseId(ex.id);
    if (ex.type === 'reps') {
      setSetsInput(ex.defaultSets);
      setRepsInput(ex.defaultReps);
    } else if (ex.type === 'cardio') {
      setCardioMinInput(ex.defaultDurationMin);
    } else if (ex.type === 'hold') {
      setHoldRunning(false);
      setHoldStopwatchSec(ex.defaultHoldSec);
    }
  };

  const handleLogWorkoutSession = () => {
    let summary = '';
    let caloriesBurned = 0;

    if (selectedExercise.type === 'reps') {
      const totalReps = Number(setsInput) * Number(repsInput);
      caloriesBurned = Math.round(totalReps * selectedExercise.calPerUnit);
      summary = `${setsInput} sets × ${repsInput} reps (${totalReps} total reps)`;
    } else if (selectedExercise.type === 'hold') {
      const secs = holdStopwatchSec > 0 ? holdStopwatchSec : 60;
      caloriesBurned = Math.max(5, Math.round(secs * selectedExercise.calPerUnit));
      summary = `${secs} sec isometric hold`;
    } else if (selectedExercise.type === 'cardio') {
      caloriesBurned = Math.round(Number(cardioMinInput) * selectedExercise.calPerUnit);
      summary = `${cardioMinInput} mins • ${cardioKmInput} km`;
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
      triggerEmotion: 'Overwhelm / Fear of Imperfection',
      escapeUrge: 'Scrolling phone / Switching to easy low-priority tasks',
      automaticThought: '',
      rationalReframe: '',
      microStep: '',
      anxietyBefore: 8,
      anxietyAfter: 4
    });
    showToast('CBT Loop Reframe saved to your Pixel storage!');
  };

  // ------------------------------------------
  // HANDLERS: BACKUP EXPORT / IMPORT
  // ------------------------------------------
  const exportBackupJson = () => {
    const payload = {
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
    const jsonString = JSON.stringify(payload, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonString);
      showToast('Backup JSON copied to clipboard!');
    }
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitalmind-backup-${todayStr}.json`;
    a.click();
  };

  const handleImportBackup = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.customFoods) setCustomFoods(parsed.customFoods);
      if (parsed.dailyFoodLogs) setDailyFoodLogs(parsed.dailyFoodLogs);
      if (parsed.dailyWaterLogs) setDailyWaterLogs(parsed.dailyWaterLogs);
      if (parsed.workoutLogs) setWorkoutLogs(parsed.workoutLogs);
      if (parsed.pomoSettings) setPomoSettings(parsed.pomoSettings);
      if (parsed.pomoTasks) setPomoTasks(parsed.pomoTasks);
      if (parsed.cbtJournal) setCbtJournal(parsed.cbtJournal);
      setImportJsonText('');
      setShowDataModal(false);
      showToast('All data restored to local storage!');
    } catch {
      showToast('Invalid JSON format. Please check your backup text.');
    }
  };

  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const calorieProgressPct = Math.min(100, Math.round((totals.cal / (goals.calories || 2000)) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center select-none font-sans">
      <div className="w-full max-w-md min-h-screen bg-slate-950 flex flex-col justify-between pb-24 border-x border-slate-900 relative">
        
        {/* TOP ANDROID APP BAR */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Activity className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-white">VitalMind</h1>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Auto-Saved
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Pixel 7 Personal Wellness & CBT OS</p>
            </div>
          </div>

          {/* Date Selector & Backup Button */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-1.5 py-1 text-xs">
              <button onClick={() => shiftDate(-1)} className="p-1 text-slate-400 hover:text-white">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-medium text-slate-200">
                {selectedDate === todayStr ? 'Today' : selectedDate.slice(5)}
              </span>
              <button onClick={() => shiftDate(1)} className="p-1 text-slate-400 hover:text-white">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowDataModal(true)}
              title="Backup & Restore Data"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-semibold text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 px-4 pt-4 space-y-5">

          {/* ==========================================
              TAB 1: CALORIE & MACRO TRACKER
             ========================================== */}
          {activeTab === 'calories' && (
            <div className="space-y-4">
              {/* Calorie & Macro Dashboard Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Net Calorie Budget
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-extrabold text-white">{totals.cal}</span>
                      <span className="text-xs text-slate-400">/ {goals.calories} kcal</span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-0.5">
                      {Math.max(0, goals.calories + burnedCaloriesToday - totals.cal)} kcal remaining (incl. +{burnedCaloriesToday} burned)
                    </p>
                  </div>

                  <button
                    onClick={() => setShowGoalEditor(!showGoalEditor)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5" /> Targets
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${calorieProgressPct}%` }}
                  />
                </div>

                {/* Editable Targets Drawer */}
                {showGoalEditor && (
                  <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Daily Calories</label>
                      <input
                        type="number"
                        value={goals.calories}
                        onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Protein Goal (g)</label>
                      <input
                        type="number"
                        value={goals.protein}
                        onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Carbs Goal (g)</label>
                      <input
                        type="number"
                        value={goals.carbs}
                        onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Fats Goal (g)</label>
                      <input
                        type="number"
                        value={goals.fat}
                        onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Macros Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Protein</span>
                      <span className="text-emerald-400 font-bold">{totals.protein.toFixed(0)}/{goals.protein}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400"
                        style={{ width: `${Math.min(100, (totals.protein / goals.protein) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Carbs</span>
                      <span className="text-cyan-400 font-bold">{totals.carbs.toFixed(0)}/{goals.carbs}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400"
                        style={{ width: `${Math.min(100, (totals.carbs / goals.carbs) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Fats</span>
                      <span className="text-amber-400 font-bold">{totals.fat.toFixed(0)}/{goals.fat}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${Math.min(100, (totals.fat / goals.fat) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Water Hydration Bar */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Hydration Tracker</h3>
                    <p className="text-xs text-slate-400">{currentWaterGlasses} / 8 glasses ({currentWaterGlasses * 250} ml)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateWater(-1)}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateWater(1)}
                    className="px-3 h-8 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                  >
                    +1 Glass
                  </button>
                </div>
              </div>

              {/* Meal Selector Tabs */}
              <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
                  <button
                    key={meal}
                    onClick={() => setActiveMealType(meal)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeMealType === meal
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>

              {/* Food Search & Custom Food Adder */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`Search food to log in ${activeMealType}...`}
                      value={foodSearch}
                      onChange={(e) => setFoodSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowCustomFoodForm(!showCustomFoodForm)}
                    className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Custom
                  </button>
                </div>

                {/* Custom Food Drawer */}
                {showCustomFoodForm && (
                  <form onSubmit={handleCreateCustomFood} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                    <div className="font-semibold text-emerald-400">Create Custom Dish (Saved Permanently)</div>
                    <input
                      type="text"
                      placeholder="Dish name (e.g., Paneer Sandwich Griddle)"
                      required
                      value={newFood.name}
                      onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="number"
                        placeholder="Kcal*"
                        required
                        value={newFood.cal}
                        onChange={(e) => setNewFood({ ...newFood, cal: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white"
                      />
                      <input
                        type="number"
                        placeholder="Prot (g)"
                        value={newFood.protein}
                        onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white"
                      />
                      <input
                        type="number"
                        placeholder="Carb (g)"
                        value={newFood.carbs}
                        onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white"
                      />
                      <input
                        type="number"
                        placeholder="Fat (g)"
                        value={newFood.fat}
                        onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                    >
                      Save & Log to {activeMealType}
                    </button>
                  </form>
                )}

                {/* Quick Add Food List */}
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {filteredFoodCatalog.map((food) => (
                    <div
                      key={food.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-100">{food.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {food.serving} • <span className="text-emerald-400">{food.protein}g P</span> • {food.carbs}g C • {food.fat}g F
                        </div>
                      </div>
                      <button
                        onClick={() => logFoodItem(food)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> {food.cal}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Logged Meals */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Logged Meals ({selectedDate === todayStr ? 'Today' : selectedDate})
                </h3>
                {currentDayFoods.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No food logged for this date yet. Tap any dish above to add!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentDayFoods.map((item) => (
                      <div
                        key={item.logId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                              {item.mealType}
                            </span>
                            <span className="text-xs font-semibold text-white">{item.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.cal} kcal • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                          </div>
                        </div>
                        <button
                          onClick={() => removeLoggedFood(item.logId)}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: HOME WORKOUT GUIDE & LOGGER
             ========================================== */}
          {activeTab === 'workout' && (
            <div className="space-y-4">
              {/* Horizontal Exercise Selector Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                {WORKOUT_CATALOG.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectExercise(ex)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap border transition-all ${
                      selectedExercise.id === ex.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>

              {/* Active Exercise Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-4">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400">{selectedExercise.category}</span>
                  <h2 className="text-lg font-bold text-white">{selectedExercise.name}</h2>
                </div>

                {/* Live Animated SVG Biomechanics Visual */}
                <ExerciseVisualizer exerciseId={selectedExercise.id} />

                {/* Step-by-Step Execution Cues */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Step-by-Step Execution
                  </h3>
                  <div className="space-y-1.5">
                    {selectedExercise.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Mistakes to Avoid */}
                <div className="p-3 rounded-2xl bg-rose-950/25 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <AlertCircle className="w-4 h-4" /> Form Mistakes to Avoid
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                    {selectedExercise.mistakes.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>

                {/* Tailored Session Logger Controls */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white">Log Session to History</div>

                  {selectedExercise.type === 'reps' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Sets</label>
                        <input
                          type="number"
                          min="1"
                          value={setsInput}
                          onChange={(e) => setSetsInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Reps per Set</label>
                        <input
                          type="number"
                          min="1"
                          value={repsInput}
                          onChange={(e) => setRepsInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white"
                        />
                      </div>
                    </div>
                  )}

                  {selectedExercise.type === 'hold' && (
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Isometric Hold Timer</span>
                        <span className="text-2xl font-mono font-bold text-emerald-400">
                          {formatTimer(holdStopwatchSec)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setHoldRunning(!holdRunning)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                        >
                          {holdRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {holdRunning ? 'Pause' : 'Start'}
                        </button>
                        <button
                          onClick={() => {
                            setHoldRunning(false);
                            setHoldStopwatchSec(0);
                          }}
                          className="p-2 rounded-xl bg-slate-800 text-slate-300"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedExercise.type === 'cardio' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Duration (Minutes)</label>
                        <input
                          type="number"
                          min="1"
                          value={cardioMinInput}
                          onChange={(e) => setCardioMinInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Distance (km)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={cardioKmInput}
                          onChange={(e) => setCardioKmInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleLogWorkoutSession}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" /> Save Completed Session
                  </button>
                </div>
              </div>

              {/* Saved Workout History */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Saved Workout Sessions ({workoutLogs.length})
                </h3>
                {workoutLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    No workout sessions logged yet. Complete a set above!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {workoutLogs.slice(0, 10).map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{w.exerciseName}</div>
                          <div className="text-[11px] text-slate-400">
                            {w.date} at {w.time} • {w.summary}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400">+{w.caloriesBurned} kcal</span>
                          <button
                            onClick={() => setWorkoutLogs((prev) => prev.filter((item) => item.id !== w.id))}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: POMODORO DEEP FOCUS TIMER
             ========================================== */}
          {activeTab === 'pomodoro' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 text-center space-y-5">
                {/* Mode Switcher */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  {[
                    { id: 'focus', label: `Focus (${pomoSettings.focus}m)`, mins: pomoSettings.focus },
                    { id: 'shortBreak', label: `Short (${pomoSettings.shortBreak}m)`, mins: pomoSettings.shortBreak },
                    { id: 'longBreak', label: `Long (${pomoSettings.longBreak}m)`, mins: pomoSettings.longBreak }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setPomoRunning(false);
                        setPomoMode(m.id);
                        setPomoSecondsLeft(m.mins * 60);
                      }}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        pomoMode === m.id
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Big Digital Timer Display */}
                <div className="py-6">
                  <div className="text-6xl font-mono font-extrabold tracking-tight text-white">
                    {formatTimer(pomoSecondsLeft)}
                  </div>
                  <p className="text-xs text-emerald-400 mt-2 font-medium">
                    Completed Focus Blocks Saved: {pomoSettings.completedSessions || 0}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPomoRunning(!pomoRunning)}
                    className="px-8 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60"
                  >
                    {pomoRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {pomoRunning ? 'Pause Timer' : 'Start Timer'}
                  </button>
                  <button
                    onClick={() => {
                      setPomoRunning(false);
                      setPomoSecondsLeft((pomoSettings[pomoMode] || 25) * 60);
                    }}
                    className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Persistent Focus Tasks Checklist */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Focus Session Target Tasks
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPomoTask.trim()) return;
                    setPomoTasks((prev) => [
                      { id: `pt_${Date.now()}`, text: newPomoTask.trim(), done: false },
                      ...prev
                    ]);
                    setNewPomoTask('');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Add a specific focus task..."
                    value={newPomoTask}
                    onChange={(e) => setNewPomoTask(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-1.5">
                  {pomoTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <button
                        onClick={() =>
                          setPomoTasks((prev) =>
                            prev.map((item) => (item.id === t.id ? { ...item, done: !item.done } : item))
                          )
                        }
                        className="flex items-center gap-2.5 text-left flex-1"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            t.done ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                          }`}
                        >
                          {t.done && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs ${t.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {t.text}
                        </span>
                      </button>
                      <button
                        onClick={() => setPomoTasks((prev) => prev.filter((item) => item.id !== t.id))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: CBT AVOID-AND-ESCAPE LOOP BREAKER
             ========================================== */}
          {activeTab === 'cbt' && (
            <div className="space-y-4">
              {/* Explainer Banner */}
              <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Behavioral Activation & CBT Loop Breaker
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Why the loop happens:</strong> Uncertain or demanding tasks trigger discomfort → your brain seeks immediate relief via distraction (escape) → temporary relief reinforces future avoidance. Break it by shrinking the entry action to <strong>2 minutes</strong>.
                </p>
              </div>

              {/* 2-Minute Micro-Exposure Starter */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                    2-Minute Friction Breaker
                  </span>
                  <div className="text-2xl font-mono font-extrabold text-white mt-0.5">
                    {formatTimer(microTimerSec)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Commit to working for just 120 seconds—permission to stop after.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMicroTimerRunning(!microTimerRunning)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    {microTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {microTimerRunning ? 'Pause' : 'Start 2m'}
                  </button>
                  <button
                    onClick={() => {
                      setMicroTimerRunning(false);
                      setMicroTimerSec(120);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive 4-Step CBT Worksheet */}
              <form onSubmit={handleSaveCbtEntry} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3.5 text-xs">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Dissect & Reframe Current Avoidance
                </h3>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    1. What specific task are you avoiding right now?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Writing the API test script / Starting workout"
                    value={cbtForm.avoidedTask}
                    onChange={(e) => setCbtForm({ ...cbtForm, avoidedTask: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-400 block mb-1">Discomfort Trigger</label>
                    <select
                      value={cbtForm.triggerEmotion}
                      onChange={(e) => setCbtForm({ ...cbtForm, triggerEmotion: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                    >
                      <option>Overwhelm / Ambiguity</option>
                      <option>Fear of Imperfection</option>
                      <option>Mental Fatigue / Boredom</option>
                      <option>Fear of Failing / Judgment</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Usual Escape Behavior</label>
                    <select
                      value={cbtForm.escapeUrge}
                      onChange={(e) => setCbtForm({ ...cbtForm, escapeUrge: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                    >
                      <option>Scrolling Reels / Social</option>
                      <option>Pseudo-work / Tidying up</option>
                      <option>Snacking / Daydreaming</option>
                      <option>Researching instead of doing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    2. All-or-Nothing Thought ("I must finish it all perfectly...")
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., It's too huge and I don't feel ready yet"
                    value={cbtForm.automaticThought}
                    onChange={(e) => setCbtForm({ ...cbtForm, automaticThought: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-emerald-400 font-semibold block mb-1">
                    3. Grounded CBT Reframe (Action precedes motivation)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., I don't need to finish it; I just need a rough 2-minute draft."
                    value={cbtForm.rationalReframe}
                    onChange={(e) => setCbtForm({ ...cbtForm, rationalReframe: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-cyan-400 font-semibold block mb-1">
                    4. Your Tiny 2-Minute First Step
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Open the file and write 3 bullet lines only"
                    value={cbtForm.microStep}
                    onChange={(e) => setCbtForm({ ...cbtForm, microStep: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Urge Before</span>
                      <span className="text-rose-400 font-bold">{cbtForm.anxietyBefore}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={cbtForm.anxietyBefore}
                      onChange={(e) => setCbtForm({ ...cbtForm, anxietyBefore: Number(e.target.value) })}
                      className="w-full accent-rose-500"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Urge After 2m</span>
                      <span className="text-emerald-400 font-bold">{cbtForm.anxietyAfter}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={cbtForm.anxietyAfter}
                      onChange={(e) => setCbtForm({ ...cbtForm, anxietyAfter: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-400"
                >
                  Save Reframe to CBT Journal
                </button>
              </form>

              {/* Saved CBT Journal Entries */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Saved Loop-Breaker Wins ({cbtJournal.length})
                </h3>
                {cbtJournal.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Your saved CBT reframes will appear here permanently.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {cbtJournal.map((entry) => (
                      <div key={entry.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{entry.avoidedTask}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                              Urge {entry.anxietyBefore} → {entry.anxietyAfter}
                            </span>
                            <button
                              onClick={() => setCbtJournal((prev) => prev.filter((i) => i.id !== entry.id))}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {entry.rationalReframe && (
                          <p className="text-emerald-300/90">
                            <strong>Reframe:</strong> {entry.rationalReframe}
                          </p>
                        )}
                        {entry.microStep && (
                          <p className="text-cyan-300/90">
                            <strong>2-Min Step:</strong> {entry.microStep}
                          </p>
                        )}
                        <div className="text-[10px] text-slate-500">
                          {entry.date} at {entry.timestamp} • Trigger: {entry.triggerEmotion}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* BACKUP / RESTORE JSON MODAL */}
        {showDataModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Pixel 7 Storage & JSON Backup</h3>
                <button onClick={() => setShowDataModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                All logs are automatically saved to your phone's local storage. You can also export a JSON backup file before reinstalling a new APK version.
              </p>
              <button
                onClick={exportBackupJson}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download / Copy Backup JSON
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">Restore from Backup JSON:</label>
                <textarea
                  rows="3"
                  placeholder="Paste backup JSON here..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
                <button
                  onClick={handleImportBackup}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" /> Restore Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANDROID MATERIAL 3 BOTTOM NAVIGATION BAR */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-3 py-2 grid grid-cols-4 gap-1 z-40">
          {[
            { id: 'calories', label: 'Calories', icon: Flame },
            { id: 'workout', label: 'Workouts', icon: Dumbbell },
            { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
            { id: 'cbt', label: 'CBT Loop', icon: Brain }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center py-1 rounded-2xl transition-all"
              >
                <div
                  className={`px-4 py-1 rounded-full transition-all ${
                    isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] mt-1 font-medium ${
                    isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}