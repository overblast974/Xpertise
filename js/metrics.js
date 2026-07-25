// Métriques d'entraînement : charge (TRIMP), CTL/ATL/TSB, prédictions de performance.

// ---------- Formatage ----------
export const fmt = {
  dur(min) {
    if (min == null || isNaN(min)) return '—';
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`;
  },
  durSec(totalSec) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.round(totalSec % 60);
    return h > 0 ? `${h}h${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}` : `${m}'${String(s).padStart(2, '0')}`;
  },
  km(km) { return km == null ? '—' : (km >= 100 ? Math.round(km) : +km.toFixed(1)) + ' km'; },
  pace(minPerKm) {
    if (!minPerKm || !isFinite(minPerKm)) return '—';
    const m = Math.floor(minPerKm), s = Math.round((minPerKm - m) * 60);
    return `${m}'${String(s).padStart(2, '0')}/km`;
  },
  speed(kmh) { return !kmh || !isFinite(kmh) ? '—' : kmh.toFixed(1) + ' km/h'; },
  date(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  },
  dateShort(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  },
};

export const todayIso = () => new Date().toISOString().slice(0, 10);
export function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
export function daysBetween(a, b) {
  return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
}
export function mondayOf(iso) {
  const d = new Date(iso + 'T12:00:00');
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

// ---------- Charge d'une séance ----------
// TRIMP-like : durée × facteur d'intensité². Si FC dispo → Banister, sinon RPE (Foster).
export function workoutLoad(wo, profile) {
  const dur = wo.durationMin || 0;
  if (wo.avgHr && profile.hrMax && profile.hrRest && profile.hrMax > profile.hrRest) {
    const hrr = Math.min(1, Math.max(0, (wo.avgHr - profile.hrRest) / (profile.hrMax - profile.hrRest)));
    const k = 1.92; // homme par défaut (Banister)
    return Math.round(dur * hrr * 0.64 * Math.exp(k * hrr));
  }
  if (wo.rpe) return Math.round(dur * wo.rpe); // Foster session-RPE
  return Math.round(dur * 5); // défaut : intensité modérée
}

// Intensité relative (0..1) pour classer la séance en zone
export function workoutIntensity(wo, profile) {
  if (wo.avgHr && profile.hrMax) return wo.avgHr / profile.hrMax;
  if (wo.rpe) return 0.5 + wo.rpe * 0.045;
  return 0.7;
}

export function hrZone(pctHrMax) {
  if (pctHrMax < 0.6) return 1;
  if (pctHrMax < 0.7) return 2;
  if (pctHrMax < 0.8) return 3;
  if (pctHrMax < 0.9) return 4;
  return 5;
}

// ---------- Série CTL / ATL / TSB ----------
// CTL : moyenne exponentielle 42 j ; ATL : 7 j ; TSB = CTL - ATL (veille).
export function fitnessSeries(workouts, profile, days = 120) {
  const end = todayIso();
  const start = addDays(end, -days + 1);
  const loadByDay = new Map();
  for (const wo of workouts) {
    if (wo.date < start || wo.date > end) continue;
    loadByDay.set(wo.date, (loadByDay.get(wo.date) || 0) + workoutLoad(wo, profile));
  }
  // amorçage avec les séances antérieures à la fenêtre
  let ctl = 0, atl = 0;
  const prior = workouts.filter(w => w.date < start).sort((a, b) => a.date.localeCompare(b.date));
  if (prior.length) {
    let cursor = prior[0].date;
    const priorLoads = new Map();
    for (const wo of prior) priorLoads.set(wo.date, (priorLoads.get(wo.date) || 0) + workoutLoad(wo, profile));
    while (cursor < start) {
      const l = priorLoads.get(cursor) || 0;
      ctl += (l - ctl) / 42;
      atl += (l - atl) / 7;
      cursor = addDays(cursor, 1);
    }
  }
  const out = [];
  let cursor = start;
  while (cursor <= end) {
    const l = loadByDay.get(cursor) || 0;
    const tsb = ctl - atl; // forme du jour = fitness - fatigue d'hier
    ctl += (l - ctl) / 42;
    atl += (l - atl) / 7;
    out.push({ date: cursor, load: l, ctl: +ctl.toFixed(1), atl: +atl.toFixed(1), tsb: +tsb.toFixed(1) });
    cursor = addDays(cursor, 1);
  }
  return out;
}

export function currentFitness(workouts, profile) {
  const s = fitnessSeries(workouts, profile, 120);
  const last = s[s.length - 1] || { ctl: 0, atl: 0, tsb: 0 };
  const weekAgo = s[s.length - 8] || last;
  return { ...last, ctlDelta7: +(last.ctl - weekAgo.ctl).toFixed(1) };
}

// Ratio charge aiguë / chronique (7j / 28j, moyennes simples)
export function acRatio(workouts, profile) {
  const end = todayIso();
  let acute = 0, chronic = 0;
  for (const wo of workouts) {
    const d = daysBetween(wo.date, end);
    if (d < 0 || d >= 28) continue;
    const l = workoutLoad(wo, profile);
    chronic += l;
    if (d < 7) acute += l;
  }
  const chronicWeekly = chronic / 4;
  if (chronicWeekly < 30) return null; // pas assez d'historique
  return +(acute / chronicWeekly).toFixed(2);
}

// Monotonie (Foster) sur 7 jours : moyenne quotidienne / écart-type
export function monotony(workouts, profile) {
  const end = todayIso();
  const daily = Array(7).fill(0);
  for (const wo of workouts) {
    const d = daysBetween(wo.date, end);
    if (d >= 0 && d < 7) daily[d] += workoutLoad(wo, profile);
  }
  const mean = daily.reduce((a, b) => a + b, 0) / 7;
  if (mean === 0) return null;
  const sd = Math.sqrt(daily.reduce((a, b) => a + (b - mean) ** 2, 0) / 7);
  return sd === 0 ? 5 : +(mean / sd).toFixed(2);
}

// ---------- Agrégats hebdo ----------
export function weeklyStats(workouts, profile, nWeeks = 12) {
  const weeks = new Map();
  const thisMonday = mondayOf(todayIso());
  for (let i = 0; i < nWeeks; i++) {
    weeks.set(addDays(thisMonday, -7 * i), { load: 0, durationMin: 0, distanceKm: 0, elevGain: 0, count: 0, z12Min: 0, z45Min: 0 });
  }
  for (const wo of workouts) {
    const wk = mondayOf(wo.date);
    const agg = weeks.get(wk);
    if (!agg) continue;
    agg.load += workoutLoad(wo, profile);
    agg.durationMin += wo.durationMin || 0;
    agg.distanceKm += wo.distanceKm || 0;
    agg.elevGain += wo.elevGain || 0;
    agg.count++;
    const z = hrZone(workoutIntensity(wo, profile));
    if (z <= 2) agg.z12Min += wo.durationMin || 0;
    if (z >= 4) agg.z45Min += wo.durationMin || 0;
  }
  return [...weeks.entries()]
    .map(([monday, v]) => ({ monday, ...v }))
    .sort((a, b) => a.monday.localeCompare(b.monday));
}

// Part du temps passé en basse intensité (fenêtre 28 j)
export function polarizationRatio(workouts, profile) {
  const end = todayIso();
  let low = 0, tot = 0;
  for (const wo of workouts) {
    const d = daysBetween(wo.date, end);
    if (d < 0 || d >= 28) continue;
    const z = hrZone(workoutIntensity(wo, profile));
    tot += wo.durationMin || 0;
    if (z <= 2) low += wo.durationMin || 0;
  }
  return tot < 60 ? null : low / tot;
}

// ---------- Prédiction de performance ----------
// Riegel : T2 = T1 × (D2/D1)^k
export function riegel(t1Min, d1Km, d2Km, k = 1.06) {
  return t1Min * Math.pow(d2Km / d1Km, k);
}

// % de VMA soutenable selon la durée d'effort (min)
export function sustainablePct(tMin) {
  if (tMin <= 6) return 1.0;
  if (tMin <= 12) return 0.95;
  if (tMin <= 30) return 0.92;
  if (tMin <= 45) return 0.88;
  if (tMin <= 75) return 0.85;
  if (tMin <= 150) return 0.80;
  return 0.75;
}

// VMA estimée depuis une perf (modèle % VMA soutenable selon durée)
export function estimateVmaFromPerf(distanceKm, timeMin) {
  const speed = distanceKm / (timeMin / 60);
  return speed / sustainablePct(timeMin);
}

// Temps théorique sur une distance depuis la VMA (itératif : le %VMA dépend de la durée)
export function timeFromVma(vma, distKm) {
  let t = (distKm / (vma * 0.88)) * 60;
  for (let i = 0; i < 8; i++) t = (distKm / (vma * sustainablePct(t))) * 60;
  return t;
}

// Meilleure perf de référence : la course/sortie la plus "rapide" pondérée
export function bestRunningRef(workouts) {
  const runs = workouts.filter(w =>
    (w.sport === 'run' || w.sport === 'trail') &&
    w.distanceKm >= 3 && w.durationMin >= 9 &&
    (w.elevGain || 0) / w.distanceKm < 25 // quasi plat pour servir de référence route
  );
  if (!runs.length) return null;
  let best = null, bestScore = -1;
  for (const w of runs) {
    const vma = estimateVmaFromPerf(w.distanceKm, w.durationMin);
    if (vma > bestScore && vma < 26) { bestScore = vma; best = w; }
  }
  return best ? { workout: best, vmaEst: bestScore } : null;
}

// ---------- Estimation de la FC max ----------
// Croise les formules les plus validées (Tanaka 2001, Gellish 2007, Nes/HUNT 2013 —
// la classique 220-âge de Fox est la moins précise et n'est PAS utilisée)
// avec les données réelles : pic de FC observé dans les fichiers importés et
// FC moyenne des courses (en compétition 30-90 min, FC moy ≈ 92-95 % de FCmax).
export function estimateHrMax(workouts, birthYear) {
  const age = birthYear ? new Date().getFullYear() - birthYear : null;
  const formulas = age ? [
    { name: 'Tanaka (2001)', detail: '208 − 0,7 × âge', value: Math.round(208 - 0.7 * age) },
    { name: 'Gellish (2007)', detail: '207 − 0,7 × âge', value: Math.round(207 - 0.7 * age) },
    { name: 'Nes / HUNT (2013)', detail: '211 − 0,64 × âge', value: Math.round(211 - 0.64 * age) },
  ] : [];
  const formulaAvg = formulas.length
    ? Math.round(formulas.reduce((a, f) => a + f.value, 0) / formulas.length)
    : null;

  // pic réel enregistré (séries FC des imports Garmin)
  let seriesMax = null, seriesRef = null;
  // FC moyenne de course la plus haute → FCmax déduite (avg ≈ 93 % de max)
  let raceDerived = null, raceRef = null;
  for (const w of workouts) {
    if (w.series?.hr?.length) {
      const m = Math.max(...w.series.hr);
      if (m > 100 && m < 230 && m > (seriesMax || 0)) { seriesMax = m; seriesRef = w; }
    }
    if (w.isRace && w.avgHr && w.durationMin >= 25 && w.durationMin <= 100) {
      const est = Math.round(w.avgHr / 0.93);
      if (est < 230 && est > (raceDerived || 0)) { raceDerived = est; raceRef = w; }
    }
  }

  // synthèse : les mesures terrain sont des bornes basses de la vraie FCmax,
  // on retient donc la plus haute des sources disponibles
  const candidates = [
    formulaAvg && { value: formulaAvg, source: 'formules (moyenne des 3)' },
    seriesMax && { value: seriesMax, source: 'pic observé dans vos séances' },
    raceDerived && { value: raceDerived, source: 'déduite de votre FC moyenne en course' },
  ].filter(Boolean);
  if (!candidates.length) return null;
  const best = candidates.reduce((a, c) => c.value > a.value ? c : a);

  return {
    age, formulas, formulaAvg,
    seriesMax, seriesRef,
    raceDerived, raceRef,
    best: best.value,
    bestSource: best.source,
    confidence: (seriesMax || raceDerived) ? 'bonne (données réelles à l\'appui)' : 'moyenne (formules seules, écart-type ±10 bpm)',
  };
}

// Référence de performance unifiée pour TOUTES les projections.
// Priorité : VMA du profil (test enregistré) > meilleure sortie détectée.
export function perfReference(workouts, profile) {
  const best = bestRunningRef(workouts);
  if (profile?.vma) {
    return {
      vma: profile.vma,
      source: 'profile',
      basisLabel: `VMA ${profile.vma} km/h (test enregistré au profil)`,
      refDistKm: 10,
      refTimeMin: timeFromVma(profile.vma, 10),
      workoutEst: best ? best.vmaEst : null, // pour comparaison profil vs sorties
    };
  }
  if (best) {
    return {
      vma: best.vmaEst,
      source: 'workout',
      basisLabel: `${best.workout.distanceKm.toFixed(1)} km en ${fmt.dur(best.workout.durationMin)} (VMA estimée ${best.vmaEst.toFixed(1)} km/h)`,
      refDistKm: best.workout.distanceKm,
      refTimeMin: best.workout.durationMin,
      workout: best.workout,
      workoutEst: best.vmaEst,
    };
  }
  return null;
}

// Table de prédictions route à partir d'une référence
export function predictionTable(refDistKm, refTimeMin, kRoad = 1.06) {
  const targets = [
    { label: '5 km', km: 5 },
    { label: '10 km', km: 10 },
    { label: 'Semi (21,1 km)', km: 21.0975 },
    { label: 'Marathon (42,2 km)', km: 42.195 },
    { label: '50 km', km: 50 },
  ];
  return targets.map(t => {
    const k = t.km > 42.3 ? kRoad + 0.04 : kRoad; // dérive ultra
    const time = riegel(refTimeMin, refDistKm, t.km, k);
    return { ...t, timeMin: time, pace: time / t.km };
  });
}

// Correction trail : temps plat équivalent → temps avec D+ (100 m D+ ≈ +1 km effort, modulé)
export function trailTime(flatTimeMin, distanceKm, elevGain, level = 'intermediate') {
  const kmEffortPerHm = { beginner: 0.012, intermediate: 0.010, advanced: 0.0085, elite: 0.0075 }[level] || 0.01;
  const equivKm = distanceKm + elevGain * kmEffortPerHm;
  const technicalFactor = elevGain / Math.max(1, distanceKm) > 40 ? 1.05 : 1.0;
  return flatTimeMin * (equivKm / distanceKm) * technicalFactor;
}

// Extrapolation de la progression : régression linéaire sur la VMA estimée des 90 derniers jours
export function progressionTrend(workouts) {
  const end = todayIso();
  const pts = [];
  for (const w of workouts) {
    if ((w.sport !== 'run' && w.sport !== 'trail') || !w.distanceKm || !w.durationMin) continue;
    if (w.distanceKm < 3 || (w.elevGain || 0) / w.distanceKm > 25) continue;
    const age = daysBetween(w.date, end);
    if (age < 0 || age > 90) continue;
    const vma = estimateVmaFromPerf(w.distanceKm, w.durationMin);
    if (vma > 8 && vma < 26) pts.push({ x: -age, y: vma });
  }
  if (pts.length < 4) return null;
  const n = pts.length;
  const sx = pts.reduce((a, p) => a + p.x, 0), sy = pts.reduce((a, p) => a + p.y, 0);
  const sxx = pts.reduce((a, p) => a + p.x * p.x, 0), sxy = pts.reduce((a, p) => a + p.x * p.y, 0);
  const denom = n * sxx - sx * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const slope = (n * sxy - sx * sy) / denom;         // km/h par jour
  const intercept = (sy - slope * sx) / n;            // VMA estimée aujourd'hui
  return {
    current: intercept,
    perMonth: slope * 30,
    in8Weeks: intercept + slope * 56,
    points: pts.length,
  };
}
