// Générateur de plan d'entraînement personnalisé.
// S'appuie sur les règles de périodisation de la base de connaissances coach
// (phases base/build/spécifique/affûtage, 80/20, décharge 1 sem/4, placement hebdo).
import { COACH } from './knowledge/coaching.js';
import { riegel, trailTime, estimateVmaFromPerf, bestRunningRef, weeklyStats, mondayOf, addDays, daysBetween, todayIso, fmt } from './metrics.js';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function sessionsByHours(hours) {
  const grid = COACH.planRules.sessionsPerWeek;
  for (const g of grid) {
    const [lo, hi] = g.availableHoursPerWeek;
    if (hours >= lo && hours < (hi || 99)) return g;
  }
  return grid[grid.length - 1];
}

function goalKind(goal) {
  if (goal.sport === 'bike') return 'granFondo';
  if (goal.sport === 'trail') return goal.distanceKm >= 60 ? 'trail_ultra' : 'trail';
  if (goal.distanceKm >= 40) return 'marathon';
  if (goal.distanceKm >= 20) return 'semi';
  return '10k';
}

function taperWeeks(kind) {
  return { '10k': 1, semi: 2, marathon: 2, trail: 2, trail_ultra: 3, granFondo: 2 }[kind] || 2;
}

const LIB = Object.fromEntries(COACH.sessionTypes.map(s => [s.id, s]));

function pick(id, durationMin, extra = '') {
  const s = LIB[id] || {};
  return {
    typeId: id,
    name: s.name || id,
    zone: s.targetZone || '',
    durationMin: Math.round(durationMin / 5) * 5,
    detail: (extra ? extra + ' — ' : '') + (s.description || ''),
    benefit: s.physiologicalBenefit || '',
    done: false,
  };
}

// Sélection des séances d'une semaine selon sport, phase et nombre de séances
function weekSessions({ sport, phase, nSessions, quality, hours, kind, weekInPhase, deload, isRaceWeek, goal }) {
  const totalMin = hours * 60;
  const sessions = [];
  const isTrail = sport === 'trail';
  const isBike = sport === 'bike';

  // --- Sortie longue (dimanche) ---
  let longMin;
  const longCapMin = { '10k': 75, semi: 105, marathon: 165, trail: 210, trail_ultra: 280, granFondo: 300 }[kind] || 120;
  const baseLong = isBike ? totalMin * 0.4 : totalMin * 0.32;
  longMin = Math.min(longCapMin, baseLong * (phase === 'base' ? 0.8 : phase === 'build' ? 0.95 : 1.0) + weekInPhase * 8);
  if (deload) longMin *= 0.65;

  // --- Qualité selon phase ---
  const qualityIds = (() => {
    if (isBike) {
      if (phase === 'base') return ['bike_force', 'bike_sweet_spot'];
      if (phase === 'build') return ['bike_pma', 'bike_sweet_spot'];
      if (phase === 'specific') return ['bike_threshold', 'bike_sweet_spot'];
      return ['bike_sweet_spot'];
    }
    if (isTrail) {
      if (phase === 'base') return ['run_hills', 'run_tempo'];
      if (phase === 'build') return ['run_vma_long', 'trail_vert'];
      if (phase === 'specific') return ['trail_vert', 'run_tempo'];
      return ['run_fartlek'];
    }
    if (phase === 'base') return ['run_vma_short', 'run_tempo'];
    if (phase === 'build') return kind === '10k' ? ['run_vma_long', 'run_threshold'] : ['run_threshold', 'run_vma_long'];
    if (phase === 'specific') return ['run_race_pace', 'run_threshold'];
    return ['run_race_pace'];
  })();

  const easyId = isBike ? 'bike_endurance' : 'run_easy';
  const recovId = isBike ? 'bike_recovery' : 'run_recovery';
  const longId = isBike ? 'bike_long' : (isTrail ? 'trail_long' : 'run_long');

  if (isRaceWeek) {
    sessions.push({ day: 'Mar', ...pick(easyId, 40, 'Footing léger + 4 lignes droites') });
    sessions.push({ day: 'Jeu', ...pick(qualityIds[0], 30, 'Rappel course : 3 x 3 min à allure objectif, récup 2 min') });
    sessions.push({ day: 'Sam', ...pick(recovId, 20, 'Déblocage : 15-20 min très facile + 3 accélérations') });
    sessions.push({ day: 'Dim', typeId: 'race', name: '🏁 OBJECTIF — Jour J', zone: 'Allure course', durationMin: goal.targetTimeMin || 0, detail: 'Départ prudent, alimentation dès 20-30 min (voir onglet Nutrition), négatif split si possible.', benefit: '', done: false });
    return sessions;
  }

  // budget restant après sortie longue
  let remaining = totalMin - longMin;
  const nQuality = deload ? 1 : Math.min(quality, 2);

  // Mardi : qualité 1
  const q1Min = Math.min(isBike ? 90 : 70, Math.max(45, remaining * 0.3));
  sessions.push({ day: 'Mar', ...pick(qualityIds[0], q1Min, deload ? 'Version allégée (décharge) : moitié du volume d\'intervalles' : '') });
  remaining -= q1Min;

  // Jeudi : qualité 2 ou endurance
  if (nSessions >= 4) {
    if (nQuality >= 2) {
      const q2Min = Math.min(isBike ? 90 : 65, Math.max(40, remaining * 0.35));
      sessions.push({ day: 'Jeu', ...pick(qualityIds[1] || easyId, q2Min) });
      remaining -= q2Min;
    } else {
      const eMin = Math.max(35, remaining * 0.3);
      sessions.push({ day: 'Jeu', ...pick(easyId, Math.min(eMin, 75)) });
      remaining -= eMin;
    }
  }

  // Mercredi/Vendredi : endurance / récup selon volume
  if (nSessions >= 5) {
    const eMin = Math.max(35, Math.min(70, remaining * 0.5));
    sessions.push({ day: 'Mer', ...pick(easyId, eMin) });
    remaining -= eMin;
  }
  if (nSessions >= 6) {
    sessions.push({ day: 'Ven', ...pick(recovId, Math.max(25, Math.min(45, remaining * 0.5))) });
  }
  if (nSessions >= 7) {
    sessions.push({ day: 'Lun', ...pick('strength_training', 35) });
  }

  // Samedi (trail : rando-course D+ en spécifique)
  if (isTrail && (phase === 'build' || phase === 'specific') && nSessions >= 5) {
    sessions.push({ day: 'Sam', ...pick('trail_downhill', 60) });
  }

  // Dimanche : sortie longue
  let longExtra = '';
  if (phase === 'specific' && (kind === 'marathon' || kind === 'semi')) longExtra = `Inclure 2-3 blocs de 15-20 min à allure ${kind === 'marathon' ? 'marathon' : 'semi'}`;
  if (isTrail) longExtra = 'Sur terrain proche du profil de course, bâtons si autorisés, tester la nutrition de course';
  if (isBike && phase === 'specific') longExtra = 'Inclure 2 x 20 min sweet spot sur le profil le plus proche de l\'objectif';
  sessions.push({ day: 'Dim', ...pick(longId, longMin, longExtra) });

  const order = { Lun: 0, Mar: 1, Mer: 2, Jeu: 3, Ven: 4, Sam: 5, Dim: 6 };
  sessions.sort((a, b) => order[a.day] - order[b.day]);
  return sessions;
}

export function generatePlan(goal, profile, workouts) {
  const today = todayIso();
  const raceMonday = mondayOf(goal.date);
  const startMonday = mondayOf(addDays(today, 7)); // début lundi prochain
  let nWeeks = Math.round(daysBetween(startMonday, raceMonday) / 7) + 1;
  if (nWeeks < 4) nWeeks = Math.max(2, nWeeks);
  if (nWeeks > 24) nWeeks = 24;

  const kind = goalKind(goal);
  const nTaper = Math.min(taperWeeks(kind), Math.max(1, Math.floor(nWeeks / 4)));
  const remaining = nWeeks - nTaper;
  const nBase = Math.max(1, Math.round(remaining * 0.38));
  const nBuild = Math.max(1, Math.round(remaining * 0.30));
  const nSpec = Math.max(1, remaining - nBase - nBuild);

  const phases = [
    ...Array(nBase).fill('base'),
    ...Array(nBuild).fill('build'),
    ...Array(nSpec).fill('specific'),
    ...Array(nTaper).fill('taper'),
  ];

  // volume de départ : moyenne 4 dernières semaines, sinon heures dispo du profil
  const recent = weeklyStats(workouts, profile, 4);
  const recentAvgH = recent.reduce((a, w) => a + w.durationMin, 0) / 4 / 60;
  const availH = goal.weeklyHours || profile.weeklyHours || 6;
  let startH = Math.max(2.5, Math.min(availH * 0.85, recentAvgH > 1 ? recentAvgH * 1.05 : availH * 0.7));
  const peakH = availH;

  const grid = sessionsByHours(availH);
  const weeks = [];
  let curH = startH;
  let weekInPhase = 0, lastPhase = '';

  for (let i = 0; i < nWeeks; i++) {
    const phase = phases[i];
    if (phase !== lastPhase) { weekInPhase = 0; lastPhase = phase; } else weekInPhase++;
    const monday = addDays(startMonday, i * 7);
    const isRaceWeek = i === nWeeks - 1;
    const deload = !isRaceWeek && phase !== 'taper' && (i + 1) % 4 === 0;

    // progression du volume
    let h = curH;
    if (phase === 'taper') {
      const taperIdx = i - (nWeeks - nTaper);
      h = peakH * (isRaceWeek ? 0.35 : taperIdx === 0 ? 0.65 : 0.5);
    } else if (deload) {
      h = curH * 0.62;
    } else {
      curH = Math.min(peakH, curH * 1.07);
      h = curH;
    }

    const sessions = weekSessions({
      sport: goal.sport, phase, nSessions: grid.sessions, quality: grid.qualitySessions,
      hours: h, kind, weekInPhase, deload, isRaceWeek, goal,
    });

    // cible D+ hebdo pour le trail (rampe vers ~90-110 % du D+ course en spécifique)
    let dplusTarget = null;
    if (goal.sport === 'trail' && goal.elevGain) {
      const factor = phase === 'base' ? 0.4 + weekInPhase * 0.05
        : phase === 'build' ? 0.6 + weekInPhase * 0.08
        : phase === 'specific' ? Math.min(1.1, 0.85 + weekInPhase * 0.08)
        : 0.3;
      dplusTarget = Math.round(Math.min(goal.elevGain * 1.1, goal.elevGain * factor * (deload ? 0.6 : 1)) / 50) * 50;
    }

    weeks.push({
      monday, phase, deload, isRaceWeek,
      targetHours: +h.toFixed(1),
      targetDplus: dplusTarget,
      sessions,
    });
  }

  // Prédiction de temps pour l'objectif
  const prediction = predictGoalTime(goal, profile, workouts);

  return {
    createdAt: today,
    goal, kind,
    startMonday,
    nWeeks,
    phaseCounts: { base: nBase, build: nBuild, specific: nSpec, taper: nTaper },
    weeklyDplusTarget: goal.sport === 'trail' && goal.elevGain ? Math.round(goal.elevGain * 0.9) : null,
    prediction,
    weeks,
  };
}

export function predictGoalTime(goal, profile, workouts) {
  const ref = bestRunningRef(workouts);
  if (goal.sport === 'bike') {
    if (!profile.ftp || !profile.weightKg) return null;
    const wkg = profile.ftp / profile.weightKg;
    // vitesse plate approx + pénalité D+ (vitesse ascensionnelle ≈ wkg*340 m/h à IF 0.75)
    const flatKmh = 22 + wkg * 3.2;
    const climbH = (goal.elevGain || 0) / Math.max(200, wkg * 340);
    const timeH = goal.distanceKm / flatKmh + climbH;
    return { timeMin: timeH * 60, basis: `FTP ${profile.ftp} W (${wkg.toFixed(1)} w/kg)` };
  }
  if (!ref) return null;
  const k = goal.sport === 'trail'
    ? (goal.elevGain / Math.max(1, goal.distanceKm) > 35 ? 1.10 : 1.08)
    : 1.06;
  const flat = riegel(ref.workout.durationMin, ref.workout.distanceKm, goal.distanceKm, k);
  let timeMin = flat;
  if (goal.sport === 'trail' && goal.elevGain) {
    const vma = ref.vmaEst;
    const level = vma >= 19 ? 'elite' : vma >= 17 ? 'advanced' : vma >= 14.5 ? 'intermediate' : 'beginner';
    timeMin = trailTime(flat, goal.distanceKm, goal.elevGain, level);
  }
  return {
    timeMin,
    basis: `réf. ${fmt.km(ref.workout.distanceKm)} en ${fmt.dur(ref.workout.durationMin)} (VMA est. ${ref.vmaEst.toFixed(1)} km/h)`,
  };
}

export const PHASE_LABEL = {
  base: { name: 'Base', cls: 'ph-base', desc: 'Fondation aérobie : volume facile majoritaire.' },
  build: { name: 'Développement', cls: 'ph-build', desc: 'Montée en intensité : VO2max puis seuil.' },
  specific: { name: 'Spécifique', cls: 'ph-peak', desc: 'Allure et profil de course.' },
  taper: { name: 'Affûtage', cls: 'ph-taper', desc: 'Volume réduit, intensité maintenue, fraîcheur.' },
};
export { DAYS };
