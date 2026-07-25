// Moteur de conseils : évalue les règles conditionnelles des bases de connaissances
// (coach + nutrition) sur les métriques calculées de l'athlète.
import { COACH } from './knowledge/coaching.js';
import { NUTRI } from './knowledge/nutrition.js';
import {
  currentFitness, acRatio, monotony, polarizationRatio, weeklyStats,
  workoutIntensity, hrZone, todayIso, daysBetween,
} from './metrics.js';

// Évaluation sûre d'une condition en pseudo-code (comparaisons, && ||, arithmétique).
const SAFE_COND = /^[\w\s.<>=!&|()'+\-*/]+$/;
export function evalCondition(cond, ctx) {
  if (!SAFE_COND.test(cond)) return false;
  const keys = Object.keys(ctx);
  try {
    const fn = new Function(...keys, `"use strict"; try { return !!(${cond}); } catch { return false; }`);
    return fn(...keys.map(k => ctx[k]));
  } catch {
    return false;
  }
}

// Contexte "entraînement" calculé depuis l'historique
export function coachContext(state) {
  const { workouts, profile, goal, plan } = state;
  const fit = currentFitness(workouts, profile);
  const weeks = weeklyStats(workouts, profile, 6);
  const thisWeek = weeks[weeks.length - 1];
  const pol = polarizationRatio(workouts, profile);
  const today = todayIso();

  // dernière sortie longue (> 75 min course/trail ou > 2 h vélo)
  let daysSinceLongRun = 999;
  let daysSinceRest = 0;
  let daysSinceRace = 999, lastRaceDurationH = 0;
  const workoutDays = new Set(workouts.map(w => w.date));
  for (let i = 0; i < 30; i++) {
    const d = new Date(today + 'T12:00:00'); d.setDate(d.getDate() - i);
    if (!workoutDays.has(d.toISOString().slice(0, 10))) { daysSinceRest = i; break; }
    daysSinceRest = i + 1;
  }
  for (const w of workouts) {
    const age = daysBetween(w.date, today);
    if (age < 0) continue;
    const isLong = ((w.sport !== 'bike' && w.durationMin >= 75) || (w.sport === 'bike' && w.durationMin >= 120));
    if (isLong && age < daysSinceLongRun) daysSinceLongRun = age;
    if (w.isRace && age < daysSinceRace) { daysSinceRace = age; lastRaceDurationH = (w.durationMin || 0) / 60; }
  }

  // % intensité haute sur 7 j
  let hi7 = 0, tot7 = 0;
  for (const w of workouts) {
    const age = daysBetween(w.date, today);
    if (age < 0 || age >= 7) continue;
    tot7 += w.durationMin || 0;
    if (hrZone(workoutIntensity(w, profile)) >= 4) hi7 += w.durationMin || 0;
  }

  const daysToRace = goal?.date ? daysBetween(today, goal.date) : 999;
  const currentPhase = plan?.weeks?.find(w => today >= w.monday && today < addDaysIso(w.monday, 7))?.phase || 'none';

  // D+ hebdo (trail)
  const weeklyDplus = thisWeek?.elevGain || 0;
  const weeklyDplusTarget = plan?.weeklyDplusTarget || (goal?.elevGain ? goal.elevGain * 0.8 : 0);

  const longest = Math.max(0, ...workouts.filter(w => daysBetween(w.date, today) < 7 && daysBetween(w.date, today) >= 0).map(w => w.durationMin || 0));

  return {
    tsb: fit.tsb,
    ctl: fit.ctl,
    rampCTL: fit.ctlDelta7,
    acRatio: acRatio(workouts, profile) ?? 1.0,
    monotony: monotony(workouts, profile) ?? 1.0,
    pctLowIntensity: pol == null ? 80 : Math.round(pol * 100),
    pctHighIntensity7d: tot7 ? Math.round(hi7 / tot7 * 100) : 0,
    daysToRace,
    daysSinceLongRun,
    daysSinceRest,
    daysSinceRace,
    lastRaceDurationH,
    goalDistanceKm: goal?.distanceKm ?? 0,
    goalType: goal?.sport === 'trail' ? 'trail' : (goal?.sport ?? 'none'),
    phase: currentPhase,
    weeklyDplus,
    weeklyDplusTarget,
    longRunPctOfWeek: thisWeek?.durationMin ? Math.round(longest / thisWeek.durationMin * 100) : 0,
    _fit: fit,
  };
}

function addDaysIso(iso, n) {
  const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const SEVERITY = {
  overload_acute: 'bad', acwr_high: 'bad', ramp_too_fast: 'bad', monotony_fatigue: 'bad',
};

export function coachAdvice(state, max = 4) {
  const ctx = coachContext(state);
  const hits = [];
  for (const rule of COACH.adviceRules) {
    if (evalCondition(rule.condition, ctx)) {
      const sev = rule.severity || SEVERITY[rule.id] ||
        (/réduis|risque|stop|urgent|blessure|fatigue très/i.test(rule.message) ? 'warn' : 'info');
      hits.push({ id: rule.id, message: rule.message, severity: sev === 'info' && /bravo|félicit|optimal|excellent/i.test(rule.message) ? 'good' : sev });
    }
  }
  // les alertes d'abord
  const order = { bad: 0, warn: 1, info: 2, good: 3 };
  hits.sort((a, b) => (order[a.severity] ?? 2) - (order[b.severity] ?? 2));
  return { advice: hits.slice(0, max), ctx };
}

// Conseils nutrition pour une séance donnée
export function nutritionAdvice(params, max = 5) {
  const ctx = {
    duration_h: params.durationH,
    intensity: params.intensity,
    temperature_c: params.tempC,
    sport: params.sport === 'run' ? 'running' : params.sport === 'bike' ? 'cycling' : 'trail',
    sodium_intake_planned: params.durationH >= 2,
    drinking_plain_water_only: false,
    target_carbs_g_per_h: params.targetCarbs || 0,
    gut_training_done: params.gutTrained ?? false,
    event_duration_h: params.durationH,
    days_to_event: params.daysToEvent ?? 999,
    is_race_day: params.isRaceDay ?? false,
    caffeine_user: params.caffeineUser ?? true,
    post_exercise: false,
    gi_distress: false,
    morning_session: params.morning ?? false,
    is_night: params.durationH >= 10,
  };
  const hits = [];
  for (const rule of NUTRI.adviceRules) {
    if (evalCondition(rule.condition, ctx)) hits.push({ id: rule.id, message: rule.message });
  }
  return hits.slice(0, max);
}

// Interprétation TSB (texte FR depuis la base coach si dispo)
export function tsbLabel(tsb) {
  if (tsb < -25) return { label: 'Fatigue élevée', cls: 'bad', text: 'Charge très supérieure à votre habitude. Priorité : récupération.' };
  if (tsb < -8) return { label: 'En charge', cls: 'warn', text: 'Zone d\'entraînement productif — normal en phase de développement, à ne pas prolonger plus de 2-3 semaines.' };
  if (tsb < 8) return { label: 'Équilibre', cls: 'info', text: 'Fraîcheur neutre : vous encaissez la charge actuelle.' };
  if (tsb < 22) return { label: 'Frais', cls: 'good', text: 'Fraîcheur optimale pour performer — fenêtre idéale pour une course ou un test.' };
  return { label: 'Très frais', cls: 'info', text: 'Beaucoup de fraîcheur : attention au désentraînement si cela dure.' };
}
