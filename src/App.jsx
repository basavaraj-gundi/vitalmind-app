import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame, Dumbbell, Timer, Brain, Plus, Trash2, Check, X, Search,
  Droplets, Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  AlertCircle, ShieldCheck, Sparkles, Download, Upload, Settings,
  CheckCircle2, Activity, Share2, Copy, Volume2
} from 'lucide-react';

function getLocalYYYYMMDD(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function triggerCompletionAlert() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([250, 120, 250, 120, 400]);
    }
  } catch (e) {}

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
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
  } catch (e) {}
}

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {}
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

const DEFAULT_FOODS = [
  { id: 'f1', name: 'Boiled Eggs (2 Whole)', cal: 155, protein: 12.6, carbs: 1.1, fat: 10.6, serving: '2 large' },
  { id: 'f2', name: 'Egg White Omelette (3 Whites)', cal: 75, protein: 11, carbs: 3, fat: 1.5, serving: '1 omelette' },
  { id: 'f3', name: 'Paneer Bhurji / Grilled Paneer', cal: 265, protein: 18.3, carbs: 3.4, fat: 20.8, serving: '100g' },
  { id: 'f4', name: 'Besan & Paneer Toastie (Breadless)', cal: 240, protein: 16, carbs: 14, fat: 12, serving: '1 serving' },
  { id: 'f5', name: 'Veg / Egg Biryani', cal: 340, protein: 11, carbs: 46, fat: 12, serving: '1 bowl (250g)' },
  { id: 'f6', name: 'Mushroom Masala Curry', cal: 185, protein: 6.5, carbs: 12, fat: 13, serving: '1 bowl (200g)' },
  { id: 'f7', name: 'Whole Wheat Chapati / Roti', cal: 104, protein: 3.1, carbs: 20.4, fat: 1.2, serving: '1 piece' },
  { id: 'f8', name: 'Malabar Parotta', cal: 260, protein: 4.5, carbs: 36, fat: 11, serving: '1 piece' },
  { id: 'f9', name: 'Dal Tadka (Yellow Lentils)', cal: 180, protein: 9, carbs: 22, fat: 6, serving: '1 bowl' },
  { id: 'f10', name: 'Steamed White / Brown Rice', cal: 195, protein: 4, carbs: 42, fat: 0.5, serving: '1 bowl' },
  { id: 'f11', name: 'Rolled Oats with Milk', cal: 220, protein: 9.5, carbs: 36, fat: 4, serving: '1 bowl' },
  { id: 'f12', name: 'Whey Protein Isolate Scoop', cal: 120, protein: 24, carbs: 2, fat: 1.5, serving: '1 scoop' },
  { id: 'f13', name: 'Roasted Chana / Peanuts Mix', cal: 170, protein: 7, carbs: 15, fat: 9, serving: '40g' },
  { id: 'f14', name: 'Masala Dosa with Sambar', cal: 310, protein: 7, carbs: 48, fat: 10, serving: '1 dosa' },
  { id: 'f15', name: 'Idli (2 Pieces) + Sambar', cal: 165, protein: 5.5, carbs: 32, fat: 1.5, serving: '2 idlis' },
  { id: 'f16', name: 'Banana (Medium / Yelakki)', cal: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: '1 medium' },
  { id: 'f17', name: 'Greek Yogurt / Thick Curd', cal: 98, protein: 10, carbs: 4, fat: 4, serving: '1 cup' },
  { id: 'f18', name: 'Black Coffee / Green Tea', cal: 5, protein: 0.3, carbs: 0.5, fat: 0, serving: '1 mug' }
];

const WORKOUT_CATALOG = [
  {
    id: 'pushup', name: 'Standard Pushups', category: 'Strength • Chest, Triceps & Core',
    type: 'reps', baseCalPerRepAt70kg: 0.48, defaultSets: 3, defaultReps: 15,
    steps: [
      'Place hands slightly wider than shoulder-width apart on the floor.',
      'Lock your core and glutes so your body forms a straight line.',
      'Lower your chest toward the floor by angling elbows at 45 degrees.',
      'Press firmly through your palms to return to the starting lockout.'
    ],
    mistakes: ['Flaring elbows out at 90 degrees.', 'Letting hips sag or piking up.']
  },
  {
    id: 'pullup', name: 'Strict Pullups', category: 'Strength • Lats, Upper Back & Biceps',
    type: 'reps', baseCalPerRepAt70kg: 1.05, defaultSets: 3, defaultReps: 8,
    steps: [
      'Grip the overhead bar slightly wider than shoulder-width.',
      'Start from a dead hang, then pull shoulder blades down and back.',
      'Drive elbows down toward your ribs until your chin clears the bar.',
      'Lower yourself under strict 2-second control back to a full hang.'
    ],
    mistakes: ['Kipping or swinging legs for momentum.', 'Doing half-reps without full extension.']
  },
  {
    id: 'squats', name: 'Bodyweight Squats', category: 'Strength • Quads, Glutes & Hamstrings',
    type: 'reps', baseCalPerRepAt70kg: 0.45, defaultSets: 4, defaultReps: 20,
    steps: [
      'Stand with feet shoulder-width apart and toes turned slightly out.',
      'Brace your core, keep chest proud, and hinge hips back and down.',
      'Lower until thighs are parallel to the floor, tracking knees over toes.',
      'Drive through mid-foot and heels to stand tall.'
    ],
    mistakes: ['Letting knees cave inward.', 'Lifting heels off the floor.']
  },
  {
    id: 'plank', name: 'Forearm Isometric Plank', category: 'Core Stability • Abs & Glutes',
    type: 'hold', met: 4.0, defaultHoldSec: 60,
    steps: [
      'Place forearms flat on the floor with elbows directly beneath shoulders.',
      'Extend legs behind you on the balls of your feet, hip-width apart.',
      'Tuck your tailbone slightly and brace your abs.',
      'Keep your neck neutral and breathe steadily.'
    ],
    mistakes: ['Holding your breath.', 'Letting the lower back arch downward.']
  },
  {
    id: 'burpees', name: 'Full Conditioning Burpees', category: 'HIIT • Full Body Conditioning',
    type: 'reps', baseCalPerRepAt70kg: 1.45, defaultSets: 3, defaultReps: 12,
    steps: [
      'Squat down and place both hands flat on the floor in front of feet.',
      'Jump or step both feet back into a tight high-plank position.',
      'Perform one controlled pushup, touching chest to the floor.',
      'Jump feet back outside hands and explosively jump up overhead.'
    ],
    mistakes: ['Snaking the lower back up off the floor.', 'Landing stiff-legged on toes.']
  },
  {
    id: 'running', name: 'Tempo Running', category: 'Cardio • High Aerobic & VO2 Max',
    type: 'cardio', met: 9.8, distanceFactor: 1.03, defaultDurationMin: 20, defaultKm: 3.5,
    steps: [
      'Maintain a tall posture with a slight forward lean from the ankles.',
      'Land softly on your mid-foot directly underneath your center of mass.',
      'Drive elbows straight back at 90 degrees without crossing your chest.',
      'Keep a rhythmic cadence with steady breathing.'
    ],
    mistakes: ['Overstriding with a heavy heel strike.', 'Hunching shoulders up.']
  },
  {
    id: 'jogging', name: 'Steady Zone-2 Jogging', category: 'Cardio • Endurance Base',
    type: 'cardio', met: 7.0, distanceFactor: 0.95, defaultDurationMin: 30, defaultKm: 4.0,
    steps: [
      'Settle into a conversational pace where you can speak a full sentence.',
      'Keep steps light, short, and rhythmic to minimize joint impact.',
      'Relax your jaw, hands, and shoulders.',
      'Breathe deeply into your diaphragm (3 steps inhale, 3 steps exhale).'
    ],
    mistakes: ['Starting too fast in the first 5 minutes.', 'Bouncing vertically.']
  },
  {
    id: 'walking', name: 'Brisk Power Walking', category: 'Cardio • Active Recovery & NEAT',
    type: 'cardio', met: 4.3, distanceFactor: 0.68, defaultDurationMin: 40, defaultKm: 3.8,
    steps: [
      'Keep chin parallel to the ground and eyes focused 15-20 feet ahead.',
      'Roll smoothly from heel strike through mid-foot to toe push-off.',
      'Swing arms naturally from the shoulders for momentum.',
      'Engage your core lightly to protect your lower spine.'
    ],
    mistakes: ['Looking down at your phone screen.', 'Taking overly long strides.']
  }
];

function ExerciseVisualizer({ exerciseId }) {
  return (
    <div className="relative w-full h-40 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
      <div className="absolute bottom-5 left-8 right-8 h-0.5 bg-emerald-500/40 rounded-full" />
      <Dumbbell className="w-12 h-12 text-emerald-400 animate-bounce" />
      <span className="absolute top-2.5 right-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/90 text-emerald-400 border border-slate-700">
        {exerciseId.toUpperCase()} GUIDE
      </span>
    </div>
  );
}

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

  const [goals, setGoals] = useLocalStorage('vitalmind_goals_v1', {
    calories: 2100, protein: 130, carbs: 220, fat: 65, weightKg: 72
  });
  const [customFoods, setCustomFoods] = useLocalStorage('vitalmind_custom_foods_v1', []);
  const [dailyFoodLogs, setDailyFoodLogs] = useLocalStorage('vitalmind_food_logs_v1', {});
  const [dailyWaterLogs, setDailyWaterLogs] = useLocalStorage('vitalmind_water_v1', {});

  const [activeMealType, setActiveMealType] = useState('Breakfast');
  const [foodSearch, setFoodSearch] = useState('');
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', cal: '', protein: '', carbs: '', fat: '', serving: '1 serving' });

  const [workoutLogs, setWorkoutLogs] = useLocalStorage('vitalmind_workout_logs_v1', []);
  const [selectedExerciseId, setSelectedExerciseId] = useState('pushup');
  const [setsInput, setSetsInput] = useState(3);
  const [repsInput, setRepsInput] = useState(15);
  const [cardioMinInput, setCardioMinInput] = useState(20);
  const [cardioKmInput, setCardioKmInput] = useState(3.5);

  const [holdStopwatchSec, setHoldStopwatchSec] = useState(0);
  const [holdRunning, setHoldRunning] = useState(false);
  const [holdStartTimestamp, setHoldStartTimestamp] = useState(null);

  const [pomoSettings, setPomoSettings] = useLocalStorage('vitalmind_pomo_settings_v1', {
    focus: 25, shortBreak: 5, longBreak: 15, completedSessions: 0
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

  const [cbtJournal, setCbtJournal] = useLocalStorage('vitalmind_cbt_journal_v1', []);
  const [cbtForm, setCbtForm] = useLocalStorage('vitalmind_cbt_draft_v1', {
    avoidedTask: '', triggerEmotion: 'Overwhelm / Ambiguity',
    escapeUrge: 'Scrolling Reels / Social', automaticThought: '',
    rationalReframe: '', microStep: '', anxietyBefore: 8, anxietyAfter: 4
  });
  const [microTimerSec, setMicroTimerSec] = useState(120);
  const [microTimerRunning, setMicroTimerRunning] = useState(false);
  const [microTargetEndMs, setMicroTargetEndMs] = useState(null);

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
          showToast('Focus session complete!');
        } else {
          showToast('Break finished!');
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

  useEffect(() => {
    if (!microTimerRunning || !microTargetEndMs) return;
    const syncMicro = () => {
      const remaining = Math.ceil((microTargetEndMs - Date.now()) / 1000);
      if (remaining <= 0) {
        setMicroTimerSec(0);
        setMicroTimerRunning(false);
        setMicroTargetEndMs(null);
        triggerCompletionAlert();
        showToast('2-Minute Micro-Exposure Complete!');
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
    showToast(`Added ${food.name}`);
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
    const [y, m, d] = selectedDate.split('-').map(Number);
    const localDate = new Date(y, m - 1, d + daysDelta);
    setSelectedDate(getLocalYYYYMMDD(localDate));
  };

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
      summary = `${setsInput}x${repsInput} (${totalReps} reps @ ${userWeightKg}kg)`;
    } else if (selectedExercise.type === 'hold') {
      const secs = holdStopwatchSec > 0 ? holdStopwatchSec : 60;
      summary = `${secs}s hold (@ ${userWeightKg}kg)`;
    } else if (selectedExercise.type === 'cardio') {
      summary = `${cardioMinInput}m • ${cardioKmInput}km (@ ${userWeightKg}kg)`;
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
    showToast(`Logged ${selectedExercise.name} (+${caloriesBurned} kcal)`);
  };

  const handleSaveCbtEntry = (e) => {
    e.preventDefault();
    if (!cbtForm.avoidedTask.trim()) {
      showToast('Enter the avoided task first.');
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
      avoidedTask: '', triggerEmotion: 'Overwhelm / Ambiguity',
      escapeUrge: 'Scrolling Reels / Social', automaticThought: '',
      rationalReframe: '', microStep: '', anxietyBefore: 8, anxietyAfter: 4
    });
    showToast('CBT Reframe saved!');
  };

  const buildBackupJsonString = () => {
    const payload = {
      app: 'VitalMind', version: '1.1', exportedAt: new Date().toISOString(),
      goals, customFoods, dailyFoodLogs, dailyWaterLogs, workoutLogs, pomoSettings, pomoTasks, cbtJournal
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
        showToast('Backup JSON copied to clipboard!');
        return;
      }
    } catch {}
    const textarea = document.createElement('textarea');
    textarea.value = jsonStr;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Backup JSON copied!');
  };

  const shareBackupNatively = async () => {
    const jsonStr = buildBackupJsonString();
    setBackupJsonPreview(jsonStr);
    if (navigator.share) {
      try {
        await navigator.share({ title: `VitalMind Backup (${todayStr})`, text: jsonStr });
        showToast('Shared backup!');
        return;
      } catch {}
    } else {
      await copyBackupToClipboard();
    }
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
      showToast('All data restored!');
    } catch {
      showToast('Invalid JSON format.');
    }
  };

  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const calorieProgressPct = Math.min(100, Math.round((totals.cal / (goals.calories || 2100)) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center select-none font-sans">
      <div className="w-full max-w-md min-h-screen bg-slate-950 flex flex-col justify-between pb-24 border-x border-slate-900 relative">
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-white">VitalMind</h1>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  v1.1 IST
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Personal Nutrition, Fitness & CBT OS</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-1.5 py-1 text-xs">
              <button onClick={() => shiftDate(-1)} className="p-1 text-slate-400 hover:text-white">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setSelectedDate(todayStr)} className="px-1.5 font-medium text-slate-200">
                {selectedDate === todayStr ? 'Today' : selectedDate.slice(5)}
              </button>
              <button onClick={() => shiftDate(1)} className="p-1 text-slate-400 hover:text-white">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button onClick={openBackupModal} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-semibold text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 px-4 pt-4 space-y-5">
          {activeTab === 'calories' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Net Calorie Budget ({selectedDate === todayStr ? 'Today' : selectedDate})
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-extrabold text-white">{totals.cal}</span>
                      <span className="text-xs text-slate-400">/ {goals.calories} kcal</span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-0.5">
                      {Math.max(0, goals.calories + burnedCaloriesToday - totals.cal)} kcal left (+{burnedCaloriesToday} burned @ {userWeightKg}kg)
                    </p>
                  </div>
                  <button onClick={() => setShowGoalEditor(!showGoalEditor)} className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 flex items-center gap-1 border border-slate-700">
                    <Settings className="w-3.5 h-3.5" /> Targets
                  </button>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${calorieProgressPct}%` }} />
                </div>

                {showGoalEditor && (
                  <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Daily Calories</label>
                      <input type="number" value={goals.calories} onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
                    </div>
                    <div>
                      <label className="text-emerald-400 font-semibold block mb-1">Your Weight (kg)</label>
                      <input type="number" value={goals.weightKg || 72} onChange={(e) => setGoals({ ...goals, weightKg: Number(e.target.value) })} className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-2.5 py-1.5 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Protein (g)</label>
                      <input type="number" value={goals.protein} onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Carbs (g)</label>
                      <input type="number" value={goals.carbs} onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Protein</span>
                      <span className="text-emerald-400 font-bold">{totals.protein.toFixed(0)}/{goals.protein}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (totals.protein / goals.protein) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Carbs</span>
                      <span className="text-cyan-400 font-bold">{totals.carbs.toFixed(0)}/{goals.carbs}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (totals.carbs / goals.carbs) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Fats</span>
                      <span className="text-amber-400 font-bold">{totals.fat.toFixed(0)}/{goals.fat}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (totals.fat / goals.fat) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400"><Droplets className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Hydration Tracker</h3>
                    <p className="text-xs text-slate-400">{currentWaterGlasses} / 8 glasses ({currentWaterGlasses * 250} ml)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateWater(-1)} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold">-</button>
                  <button onClick={() => updateWater(1)} className="px-3 h-8 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">+1 Glass</button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
                  <button key={meal} onClick={() => setActiveMealType(meal)} className={`py-2 rounded-xl text-xs font-semibold ${activeMealType === meal ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>
                    {meal}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder={`Search food for ${activeMealType}...`} value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white" />
                  </div>
                  <button onClick={() => setShowCustomFoodForm(!showCustomFoodForm)} className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Custom
                  </button>
                </div>

                {showCustomFoodForm && (
                  <form onSubmit={handleCreateCustomFood} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                    <input type="text" placeholder="Dish name" required value={newFood.name} onChange={(e) => setNewFood({ ...newFood, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white" />
                    <div className="grid grid-cols-4 gap-2">
                      <input type="number" placeholder="Kcal*" required value={newFood.cal} onChange={(e) => setNewFood({ ...newFood, cal: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white" />
                      <input type="number" placeholder="Prot" value={newFood.protein} onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white" />
                      <input type="number" placeholder="Carb" value={newFood.carbs} onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white" />
                      <input type="number" placeholder="Fat" value={newFood.fat} onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })} className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white" />
                    </div>
                    <button type="submit" className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">Save & Log</button>
                  </form>
                )}

                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {filteredFoodCatalog.map((food) => (
                    <div key={food.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div>
                        <div className="text-xs font-semibold text-slate-100">{food.name}</div>
                        <div className="text-[11px] text-slate-400">{food.serving} • <span className="text-emerald-400">{food.protein}g P</span> • {food.carbs}g C • {food.fat}g F</div>
                      </div>
                      <button onClick={() => logFoodItem(food)} className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> {food.cal}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Logged Meals ({selectedDate})</h3>
                {currentDayFoods.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No meals logged for this date yet.</p>
                ) : (
                  <div className="space-y-2">
                    {currentDayFoods.map((item) => (
                      <div key={item.logId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 mr-1.5">{item.mealType}</span>
                          <span className="text-xs font-semibold text-white">{item.name}</span>
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.cal} kcal • P:{item.protein}g • C:{item.carbs}g • F:{item.fat}g</div>
                        </div>
                        <button onClick={() => removeLoggedFood(item.logId)} className="p-1.5 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'workout' && (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1.5">
                {WORKOUT_CATALOG.map((ex) => (
                  <button key={ex.id} onClick={() => handleSelectExercise(ex)} className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap border ${selectedExercise.id === ex.id ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
                    {ex.name}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400">{selectedExercise.category}</span>
                    <h2 className="text-lg font-bold text-white">{selectedExercise.name}</h2>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{userWeightKg} kg</span>
                </div>

                <ExerciseVisualizer exerciseId={selectedExercise.id} />

                <div className="space-y-1.5">
                  {selectedExercise.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">{i + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Log Session</span>
                    <span className="text-amber-400 font-bold">Est. Burn: +{estimatedWorkoutBurn} kcal</span>
                  </div>

                  {selectedExercise.type === 'reps' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Sets</label>
                        <input type="number" min="1" value={setsInput} onChange={(e) => setSetsInput(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white" />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Reps</label>
                        <input type="number" min="1" value={repsInput} onChange={(e) => setRepsInput(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white" />
                      </div>
                    </div>
                  )}

                  {selectedExercise.type === 'hold' && (
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-2xl font-mono font-bold text-emerald-400">{formatTimer(holdStopwatchSec)}</span>
                      <div className="flex gap-2">
                        <button onClick={toggleHoldTimer} className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">{holdRunning ? 'Pause' : 'Start'}</button>
                        <button onClick={() => { setHoldRunning(false); setHoldStartTimestamp(null); setHoldStopwatchSec(0); }} className="p-2 rounded-xl bg-slate-800 text-slate-300"><RotateCcw className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}

                  {selectedExercise.type === 'cardio' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Minutes</label>
                        <input type="number" min="1" value={cardioMinInput} onChange={(e) => setCardioMinInput(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white" />
                      </div>
                      <div>
                        <label className="text-[11px] text-emerald-400 font-semibold block mb-1">Distance (km)</label>
                        <input type="number" step="0.1" min="0.1" value={cardioKmInput} onChange={(e) => setCardioKmInput(e.target.value)} className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-bold text-white" />
                      </div>
                    </div>
                  )}

                  <button onClick={handleLogWorkoutSession} className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> Save Session (+{estimatedWorkoutBurn} kcal)
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Saved Workouts ({workoutLogs.length})</h3>
                {workoutLogs.slice(0, 15).map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">{w.exerciseName}</div>
                      <div className="text-[11px] text-slate-400">{w.date} • {w.summary}</div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">+{w.caloriesBurned} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pomodoro' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 text-center space-y-5">
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  {[
                    { id: 'focus', label: `Focus (${pomoSettings.focus}m)`, mins: pomoSettings.focus },
                    { id: 'shortBreak', label: `Short (${pomoSettings.shortBreak}m)`, mins: pomoSettings.shortBreak },
                    { id: 'longBreak', label: `Long (${pomoSettings.longBreak}m)`, mins: pomoSettings.longBreak }
                  ].map((m) => (
                    <button key={m.id} onClick={() => { setPomoRunning(false); setPomoTargetEndMs(null); setPomoMode(m.id); setPomoSecondsLeft(m.mins * 60); }} className={`py-2 rounded-xl text-xs font-semibold ${pomoMode === m.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="py-5">
                  <div className="text-6xl font-mono font-extrabold text-white">{formatTimer(pomoSecondsLeft)}</div>
                  <p className="text-xs text-emerald-400 mt-2">Completed Sessions: {pomoSettings.completedSessions || 0}</p>
                </div>

                <div className="flex items-center justify-center gap-2.5">
                  <button onClick={togglePomoTimer} className="px-7 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center gap-2">
                    {pomoRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {pomoRunning ? 'Pause' : 'Start'}
                  </button>
                  <button onClick={() => { setPomoRunning(false); setPomoTargetEndMs(null); setPomoSecondsLeft((pomoSettings[pomoMode] || 25) * 60); }} className="p-3 rounded-2xl bg-slate-800 text-slate-300"><RotateCcw className="w-5 h-5" /></button>
                  <button onClick={() => setShowPomoConfig(!showPomoConfig)} className="p-3 rounded-2xl bg-slate-800 text-slate-300"><Settings className="w-5 h-5" /></button>
                  <button onClick={triggerCompletionAlert} className="p-3 rounded-2xl bg-slate-800 text-slate-300"><Volume2 className="w-5 h-5" /></button>
                </div>

                {showPomoConfig && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-3 gap-2.5 text-xs text-left">
                    <div>
                      <label className="text-slate-400 block mb-1">Focus (m)</label>
                      <input type="number" min="1" value={pomoSettings.focus} onChange={(e) => { const v = Math.max(1, Number(e.target.value)); setPomoSettings({ ...pomoSettings, focus: v }); if (pomoMode === 'focus' && !pomoRunning) setPomoSecondsLeft(v * 60); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Short (m)</label>
                      <input type="number" min="1" value={pomoSettings.shortBreak} onChange={(e) => { const v = Math.max(1, Number(e.target.value)); setPomoSettings({ ...pomoSettings, shortBreak: v }); if (pomoMode === 'shortBreak' && !pomoRunning) setPomoSecondsLeft(v * 60); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Long (m)</label>
                      <input type="number" min="1" value={pomoSettings.longBreak} onChange={(e) => { const v = Math.max(1, Number(e.target.value)); setPomoSettings({ ...pomoSettings, longBreak: v }); if (pomoMode === 'longBreak' && !pomoRunning) setPomoSecondsLeft(v * 60); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cbt' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-400 font-bold uppercase block">2-Minute Friction Breaker</span>
                  <div className="text-2xl font-mono font-extrabold text-white mt-0.5">{formatTimer(microTimerSec)}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={toggleMicroTimer} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">{microTimerRunning ? 'Pause' : 'Start 2m'}</button>
                  <button onClick={() => { setMicroTimerRunning(false); setMicroTargetEndMs(null); setMicroTimerSec(120); }} className="p-2.5 rounded-xl bg-slate-800 text-slate-300"><RotateCcw className="w-4 h-4" /></button>
                </div>
              </div>

              <form onSubmit={handleSaveCbtEntry} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3 text-xs">
                <input type="text" placeholder="1. Task you are avoiding right now..." value={cbtForm.avoidedTask} onChange={(e) => setCbtForm({ ...cbtForm, avoidedTask: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                <input type="text" placeholder="2. Automatic all-or-nothing thought..." value={cbtForm.automaticThought} onChange={(e) => setCbtForm({ ...cbtForm, automaticThought: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                <input type="text" placeholder="3. Grounded CBT Reframe..." value={cbtForm.rationalReframe} onChange={(e) => setCbtForm({ ...cbtForm, rationalReframe: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                <input type="text" placeholder="4. Tiny 2-minute micro-step..." value={cbtForm.microStep} onChange={(e) => setCbtForm({ ...cbtForm, microStep: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold">Save Reframe to CBT Journal</button>
              </form>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase text-slate-400">Saved Loop-Breaker Wins ({cbtJournal.length})</h3>
                {cbtJournal.map((entry) => (
                  <div key={entry.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-white">{entry.avoidedTask}</div>
                    <div className="text-emerald-300">{entry.rationalReframe}</div>
                    <div className="text-[10px] text-slate-500">{entry.date} • {entry.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {showDataModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Backup & Restore</h3>
                <button onClick={() => setShowDataModal(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={copyBackupToClipboard} className="py-2.5 px-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"><Copy className="w-4 h-4" /> Copy JSON</button>
                <button onClick={shareBackupNatively} className="py-2.5 px-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"><Share2 className="w-4 h-4" /> Share Backup</button>
              </div>
              <textarea rows="3" readOnly value={backupJsonPreview} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-[10px] font-mono text-emerald-300" />
              <textarea rows="3" placeholder="Paste backup JSON here to restore..." value={importJsonText} onChange={(e) => setImportJsonText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white" />
              <button onClick={handleImportBackup} className="w-full py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs">Restore Data Now</button>
            </div>
          </div>
        )}

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-950/95 border-t border-slate-800 px-3 py-2 grid grid-cols-4 gap-1 z-40">
          {[
            { id: 'calories', label: 'Calories', icon: Flame },
            { id: 'workout', label: 'Workouts', icon: Dumbbell },
            { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
            { id: 'cbt', label: 'CBT Loop', icon: Brain }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex flex-col items-center justify-center py-1 rounded-2xl">
                <div className={`px-4 py-1 rounded-full ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}><Icon className="w-5 h-5" /></div>
                <span className={`text-[11px] mt-1 ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}