// Stockage local (localStorage) + pub/sub minimal.
const KEY = 'xpertise-v1';

const defaults = {
  profile: {
    name: '',
    weightKg: 70,
    hrMax: 190,
    hrRest: 55,
    vma: null,        // km/h
    ftp: null,        // watts
    birthYear: null,
    weeklyHours: 6,
  },
  workouts: [],       // {id, sport, date, title, durationMin, distanceKm, elevGain, avgHr, rpe, notes, source, series?}
  goal: null,         // {sport, type, distanceKm, elevGain, targetTimeMin, date, sessionsPerWeek}
  plan: null,         // plan généré
  settings: { onboarded: false },
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaults);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaults),
      ...parsed,
      profile: { ...defaults.profile, ...(parsed.profile || {}) },
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return structuredClone(defaults);
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Stockage plein — séries détaillées allégées', e);
    // en cas de quota dépassé, on retire les séries détaillées les plus anciennes
    const w = [...state.workouts].sort((a, b) => a.date.localeCompare(b.date));
    for (const wo of w) {
      if (wo.series) { delete wo.series; break; }
    }
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }
  listeners.forEach(fn => fn(state));
}

export const db = {
  get: () => state,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  setProfile(patch) { state.profile = { ...state.profile, ...patch }; persist(); },
  setSettings(patch) { state.settings = { ...state.settings, ...patch }; persist(); },

  addWorkout(wo) {
    wo.id = wo.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
    state.workouts.push(wo);
    state.workouts.sort((a, b) => b.date.localeCompare(a.date));
    persist();
    return wo.id;
  },
  updateWorkout(id, patch) {
    const i = state.workouts.findIndex(w => w.id === id);
    if (i >= 0) { state.workouts[i] = { ...state.workouts[i], ...patch }; persist(); }
  },
  deleteWorkout(id) {
    state.workouts = state.workouts.filter(w => w.id !== id);
    persist();
  },

  setGoal(goal) { state.goal = goal; persist(); },
  setPlan(plan) { state.plan = plan; persist(); },
  toggleSessionDone(weekIdx, sessIdx) {
    const s = state.plan?.weeks?.[weekIdx]?.sessions?.[sessIdx];
    if (s) { s.done = !s.done; persist(); }
  },

  exportJson() { return JSON.stringify(state, null, 2); },
  importJson(json) {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.workouts)) {
      throw new Error('Fichier de sauvegarde invalide');
    }
    state = { ...structuredClone(defaults), ...parsed, profile: { ...defaults.profile, ...(parsed.profile || {}) } };
    persist();
  },
  reset() { state = structuredClone(defaults); persist(); },
};
