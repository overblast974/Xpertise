// Calculateur de nutrition d'effort : glucides/h, hydratation, sodium, caféine,
// plan produits heure par heure — basé sur la base de connaissances nutrition.
import { NUTRI } from './knowledge/nutrition.js';

export function durationKey(h) {
  if (h < 1) return 'lt1h';
  if (h < 2) return '1to2h';
  if (h < 3) return '2to3h';
  if (h < 6) return '3hplus';
  return 'ultra6hplus';
}

export function tempKey(c) {
  if (c < 15) return 'cool';
  if (c < 25) return 'temperate';
  if (c <= 32) return 'hot';
  return 'veryHot';
}

// Recommandation complète pour un effort donné
export function computeNutrition({ durationH, intensity = 'moderate', tempC = 20, sport = 'run', weightKg = 70 }) {
  const dKey = durationKey(durationH);
  const durRule = NUTRI.carbRules.byDuration.find(r => r.durationKey === dKey)
    || NUTRI.carbRules.byDuration[NUTRI.carbRules.byDuration.length - 1];
  const intens = durRule.byIntensity?.[intensity];
  let carbsPerH = intens?.gPerHour ?? durRule.carbsPerHour?.max ?? 60;
  const carbsNote = intens?.note || durRule.displayText;

  const tKey = tempKey(tempC);
  const hydRule = NUTRI.hydrationRules.byTemperature.find(r => r.tempKey === tKey)
    || NUTRI.hydrationRules.byTemperature[1];
  let fluidMin = hydRule.fluidMlPerHour?.min ?? 400;
  let fluidMax = hydRule.fluidMlPerHour?.max ?? 700;
  // la course tolère moins de volume gastrique que le vélo
  if (sport !== 'bike') { fluidMax = Math.round(fluidMax * 0.9); }

  const sodiumPerH = durationH >= 2
    ? { min: tempC >= 25 ? 600 : 300, max: tempC >= 25 ? 1000 : 600 }
    : null;

  const needRatio = carbsPerH > 60;
  const ratio = carbsPerH > 90
    ? NUTRI.carbRules.glucoseFructoseRatio?.highIntake || '1:0.8'
    : NUTRI.carbRules.glucoseFructoseRatio?.standard || '2:1';

  const caffeine = durationH >= 1 ? {
    doseMg: Math.round(weightKg * 3),
    maxMg: Math.round(weightKg * 6),
    text: NUTRI.caffeine.timing?.displayText || '',
    redose: durationH >= 2.5 ? NUTRI.caffeine.timing?.duringLong : null,
  } : null;

  const totalCarbs = Math.round(carbsPerH * durationH);
  const totalFluid = Math.round((fluidMin + fluidMax) / 2 * durationH);

  return {
    dKey, durLabel: durRule.durationLabel,
    carbsPerH, carbsNote, totalCarbs,
    needRatio, ratio,
    gutTraining: carbsPerH >= 90 ? NUTRI.carbRules.gutTraining?.displayText : null,
    fluidMin, fluidMax, totalFluid,
    hydText: hydRule.displayText,
    tempLabel: hydRule.tempLabel,
    sodiumPerH,
    sodiumText: NUTRI.hydrationRules.sodium?.mgPerHour?.recommendedText,
    caffeine,
    timeline: pickTemplate(durationH, sport),
    hourlyPlan: carbsPerH > 0 ? buildHourlyPlan(carbsPerH, sport, durationH) : null,
  };
}

// Choisit le modèle de timeline le plus adapté
function pickTemplate(durationH, sport) {
  const nutriSport = sport === 'run' ? 'running' : sport === 'bike' ? 'cycling' : 'trail';
  const t = NUTRI.timingTemplates;
  const byKey = k => t.find(x => x.key === k);
  if (durationH < 1) return byKey('shortLt1h');
  if (durationH < 2) return byKey('medium1to2h');
  if (durationH >= 8) return byKey('ultra8hplus');
  if (nutriSport === 'trail' && durationH >= 4) return byKey('trailLong4to8h');
  if (nutriSport === 'cycling' && durationH >= 3) return byKey('cyclo3to5h');
  if (nutriSport === 'running' && durationH >= 2.8 && durationH <= 5) return byKey('marathon') || byKey('long2to4h');
  return byKey('long2to4h');
}

// Compose un exemple de ravitaillement horaire à partir de la table d'équivalences
function buildHourlyPlan(carbsPerH, sport, durationH) {
  const items = Object.fromEntries(NUTRI.productEquivalents.items.map(i => [i.id, i]));
  const combo = [];
  let carbs = 0;

  // socle : boisson iso au bidon (surtout vélo), sinon gels + solide
  if (sport === 'bike' || durationH >= 3) {
    const iso = items.isoDrink;
    if (iso) { combo.push({ qty: 1, item: iso, note: '1 bidon de 500 ml' }); carbs += iso.carbsG; }
  }
  const gel = items.gel;
  while (carbs < carbsPerH - 12 && gel && combo.filter(c => c.item.id === 'gel').length < 3) {
    const existing = combo.find(c => c.item.id === 'gel');
    if (existing) { existing.qty++; } else combo.push({ qty: 1, item: gel, note: '' });
    carbs += gel.carbsG;
  }
  if (carbs < carbsPerH - 8) {
    const solid = durationH >= 3 ? (items.bar || items.banana) : (items.fruitPaste || items.banana);
    if (solid) { combo.push({ qty: 1, item: solid, note: '' }); carbs += solid.carbsG; }
  }
  return { combo, totalCarbs: carbs, note: NUTRI.productEquivalents.planningNote };
}

export function recoveryAdvice(weightKg = 70) {
  const r = NUTRI.recovery;
  return {
    window: r.window?.displayText,
    carbs: r.carbs?.displayText,
    carbsG: Math.round((r.carbs?.gPerKgPerHour?.min ?? 1) * weightKg),
    protein: r.protein?.displayText,
    rehydration: r.rehydration?.displayText,
    examples: r.practicalExamples || [],
  };
}

export function racedayAdvice(weightKg = 70) {
  const r = NUTRI.racedayRules;
  return {
    carbLoad: r.carbLoad?.jMinus3ToJMinus1,
    carbLoadTotal: `${Math.round(8 * weightKg)}-${Math.round(12 * weightKg)} g/jour pour ${weightKg} kg`,
    breakfast: r.breakfast,
    breakfastG: `${Math.round(2 * weightKg)}-${Math.round(3 * weightKg)} g de glucides`,
    mistakes: r.classicMistakes || [],
  };
}
