// Écran analyse : charge, polarisation, zones personnalisées, prédictions, niveau.
import { db } from '../db.js';
import { COACH } from '../knowledge/coaching.js';
import { fmt, weeklyStats, bestRunningRef, predictionTable, progressionTrend, acRatio, monotony, polarizationRatio, trailTime } from '../metrics.js';
import { weeklyBars, donut } from '../charts.js';
import { coachAdvice } from '../advice.js';
import { esc } from '../ui.js';

export function renderAnalysis(root) {
  const state = db.get();
  const { workouts, profile } = state;
  const weeks = weeklyStats(workouts, profile, 12);
  const pol = polarizationRatio(workouts, profile);
  const ac = acRatio(workouts, profile);
  const mono = monotony(workouts, profile);
  const ref = bestRunningRef(workouts);
  const trend = progressionTrend(workouts);
  const { advice } = coachAdvice(state, 8);

  root.innerHTML = `
    <div class="section-title" style="margin-top:4px">Analyse d'entraînement</div>

    <div class="cards-3">
      <div class="card">
        <div class="stat"><span class="l">Ratio charge aiguë:chronique</span>
        <span class="v">${ac ?? '—'}</span>
        <span class="d">${acLabel(ac)}</span></div>
        <div class="meter mt8"><i style="width:${ac ? Math.min(100, ac / 2 * 100) : 0}%"></i></div>
        <p class="muted mt8 small">Zone sûre : 0,8 – 1,3. Au-delà de 1,5 : risque de blessure nettement accru.</p>
      </div>
      <div class="card">
        <div class="stat"><span class="l">Monotonie (Foster)</span>
        <span class="v">${mono ?? '—'}</span>
        <span class="d">${monoLabel(mono)}</span></div>
        <p class="muted mt8 small">&lt; 1,5 : bonne variété. &gt; 2 : trop de jours identiques — alternez dur/facile et gardez un vrai jour de repos.</p>
      </div>
      <div class="card">
        <div class="stat"><span class="l">Polarisation (28 j)</span>
        <span class="v">${pol == null ? '—' : Math.round(pol * 100) + '<small>% facile</small>'}</span>
        <span class="d">${polLabel(pol)}</span></div>
        <div class="meter mt8"><i style="width:${pol == null ? 0 : pol * 100}%"></i></div>
        <p class="muted mt8 small">${esc(COACH.planRules.intensityDistribution.textFr || 'Objectif : ~80 % du temps en Z1-Z2.')}</p>
      </div>
    </div>

    <div class="section-title">Charge hebdomadaire (TRIMP)</div>
    <div class="card"><div class="chart-wrap">${weeklyBars(weeks, 'load', { color: '#7c5cff' })}</div></div>

    <div class="cards-2 mt12">
      <div class="card"><h3>Distance / semaine</h3><div class="chart-wrap">${weeklyBars(weeks.slice(-8), 'distanceKm', { color: '#22d3ee', unit: ' km' })}</div></div>
      <div class="card"><h3>D+ / semaine</h3><div class="chart-wrap">${weeklyBars(weeks.slice(-8), 'elevGain', { color: '#a3e635', unit: ' m' })}</div></div>
    </div>

    ${advice.length ? `<div class="section-title">Lecture du coach</div>
    <div class="grid">${advice.map(a => `
      <div class="advice ${a.severity}"><span class="a-ico">${a.severity === 'bad' ? '🛑' : a.severity === 'warn' ? '⚠️' : a.severity === 'good' ? '✅' : '💡'}</span><span>${esc(a.message)}</span></div>`).join('')}</div>` : ''}

    <div class="section-title">Extrapolation de performance</div>
    ${ref ? `
    <div class="card glow">
      <p class="muted">Référence : <b style="color:var(--txt)">${esc(ref.workout.title || 'séance')}</b> — ${fmt.km(ref.workout.distanceKm)} en ${fmt.dur(ref.workout.durationMin)} → VMA estimée <b style="color:var(--txt)">${ref.vmaEst.toFixed(1)} km/h</b>${levelBadge(ref.vmaEst)}</p>
      ${trend ? `<p class="muted mt8">Tendance sur 90 j (${trend.points} séances) : <b class="${trend.perMonth >= 0 ? 'up' : 'down'}">${trend.perMonth >= 0 ? '+' : ''}${trend.perMonth.toFixed(2)} km/h de VMA par mois</b> → dans 8 semaines : <b style="color:var(--txt)">${trend.in8Weeks.toFixed(1)} km/h</b></p>` : ''}
      <div class="tbl-wrap mt12"><table class="tbl">
        <tr><th>Distance</th><th>Temps prédit</th><th>Allure</th></tr>
        ${predictionTable(ref.workout.distanceKm, ref.workout.durationMin).map(p =>
          `<tr><td>${p.label}</td><td><b>${fmt.durSec(p.timeMin * 60)}</b></td><td>${fmt.pace(p.pace)}</td></tr>`).join('')}
      </table></div>
      <p class="muted mt8 small">Modèle de Riegel (k = 1,06 route, majoré au-delà du marathon). En trail, comptez ${esc(dplusCost())} par 100 m de D+ selon votre niveau.</p>
    </div>` : `<div class="card"><p class="muted">Ajoutez au moins une sortie route/plat ≥ 3 km soutenue (ou une course 🏁) pour activer l'extrapolation de performance.</p></div>`}

    <div class="section-title">Mes zones personnalisées</div>
    <div class="cards-2">
      <div class="card">
        <h3>♥ Zones cardio (FCmax ${profile.hrMax})</h3>
        ${COACH.zones.heartRate.zones.map((z, i) => zoneRow(z, i, pctToBpm(z, profile))).join('')}
      </div>
      <div class="card">
        <h3>🏃 Zones d'allure ${profile.vma ? `(VMA ${profile.vma} km/h)` : ''}</h3>
        ${profile.vma || ref
          ? COACH.zones.runningPace.zones.map((z, i) => zoneRow(z, i, pctVmaToPace(z, profile.vma || ref.vmaEst))).join('')
          : '<p class="muted">Renseignez votre VMA dans le profil (ou ajoutez une perf de référence).</p>'}
      </div>
      ${profile.ftp ? `<div class="card">
        <h3>🚴 Zones puissance (FTP ${profile.ftp} W)</h3>
        ${COACH.zones.cyclingPower.zones.slice(0, 6).map((z, i) => zoneRow(z, Math.min(i, 4), pctFtpToW(z, profile.ftp))).join('')}
      </div>` : ''}
    </div>

    <div class="section-title">Grilles de niveau</div>
    <div class="card">
      <div class="tbl-wrap"><table class="tbl">
        <tr><th>Niveau</th><th>VMA (H)</th><th>Marathon</th><th>FTP w/kg (H)</th><th>V. ascensionnelle</th></tr>
        ${levelGridRows(profile, ref)}
      </table></div>
      <p class="muted mt8 small">${esc(COACH.levelGrids.verticalSpeed.commentFr || '')}</p>
    </div>
  `;
}

function acLabel(ac) {
  if (ac == null) return 'pas assez d\'historique';
  if (ac > 1.5) return '🛑 zone à risque';
  if (ac > 1.3) return '⚠️ limite haute';
  if (ac < 0.8) return 'sous-charge';
  return '✅ zone optimale';
}
function monoLabel(m) {
  if (m == null) return 'pas assez de données';
  if (m > 2.5) return '🛑 très monotone';
  if (m > 2) return '⚠️ monotone';
  return '✅ bonne variété';
}
function polLabel(p) {
  if (p == null) return 'pas assez de données';
  const pct = p * 100;
  if (pct < 70) return '⚠️ trop d\'intensité';
  if (pct > 95) return 'très (trop ?) facile';
  return '✅ conforme au 80/20';
}

function zoneRow(z, i, computed) {
  const num = Math.min(5, i + 1);
  return `<div class="zone-row">
    <span class="zone-chip z${num}">${esc(z.id || 'Z' + num)}</span>
    <div style="flex:1;min-width:0">
      <div style="font-weight:700;font-size:13px">${esc(z.name)}</div>
      <div class="muted small">${esc(z.purpose || z.description || '').slice(0, 90)}</div>
    </div>
    <div style="text-align:right;font-weight:700;font-size:12.5px;white-space:nowrap">${computed}</div>
  </div>`;
}

function rangeOf(z) {
  // tolère plusieurs formats de la base : pctHrMax:[a,b] / {min,max} / pct:[a,b]
  const r = z.pctHRmax || z.pctHrMax || z.pctHRMax || z.pctVma || z.pctVMA || z.pctFtp || z.pctFTP || z.pct || z.range;
  if (Array.isArray(r)) return r;
  if (r && typeof r === 'object') return [r.min, r.max];
  return null;
}

function pctToBpm(z, profile) {
  const r = rangeOf(z);
  if (!r) return '';
  const [a, b] = r;
  const lo = Math.round(profile.hrMax * a / 100), hi = b ? Math.round(profile.hrMax * b / 100) : null;
  return hi ? `${lo}–${hi} bpm` : `> ${lo} bpm`;
}
function pctVmaToPace(z, vma) {
  const r = rangeOf(z);
  if (!r || !vma) return '';
  const [a, b] = r;
  const paceAt = pct => fmt.pace(60 / (vma * pct / 100)).replace('/km', '');
  return b ? `${paceAt(b)}–${paceAt(a)} /km` : `< ${paceAt(a)} /km`;
}
function pctFtpToW(z, ftp) {
  const r = rangeOf(z);
  if (!r) return '';
  const [a, b] = r;
  return b ? `${Math.round(ftp * a / 100)}–${Math.round(ftp * b / 100)} W` : `> ${Math.round(ftp * a / 100)} W`;
}

function levelBadge(vma) {
  const men = COACH.levelGrids.vma?.men || [];
  let lvl = null;
  for (const l of men) {
    const r = l.range || l.vmaKmh || [l.min, l.max];
    const [a, b] = Array.isArray(r) ? r : [r?.min, r?.max];
    if (a != null && vma >= a && (b == null || vma < b)) lvl = l.level || l.name;
  }
  return lvl ? ` <span class="badge accent">${esc(lvl)}</span>` : '';
}

function dplusCost() {
  const by = COACH.performanceModels.trailElevationCorrection?.timePerHundredMetersDplus?.byLevel || [];
  if (!by.length) return '3 à 6 min';
  return `${by[by.length - 1].minutesPer100mDplus} à ${by[0].minutesPer100mDplus} min`;
}

function levelGridRows() {
  const g = COACH.levelGrids;
  const n = Math.max(g.vma?.men?.length || 0, g.marathonPace?.levels?.length || 0);
  let rows = '';
  for (let i = 0; i < n; i++) {
    const vma = g.vma?.men?.[i], mar = g.marathonPace?.levels?.[i], ftp = g.ftpWkg?.men?.[i], vs = g.verticalSpeed?.levels?.[i];
    const cell = o => {
      if (!o) return '—';
      if (o.finishTime) return esc(o.finishTime);
      const v = o.value ?? o.range ?? o.vmaKmh ?? o.wkg ?? o.paceMinPerKm ?? o.pace ?? o.time ?? o.speed ?? o.mPerHour;
      if (Array.isArray(v)) return v.join('–');
      if (v && typeof v === 'object') return `${v.min ?? ''}–${v.max ?? ''}`;
      return esc(String(v ?? o.textFr ?? '—'));
    };
    rows += `<tr><td><b>${esc(vma?.level || mar?.level || 'Niv. ' + (i + 1))}</b></td><td>${cell(vma)}</td><td>${cell(mar)}</td><td>${cell(ftp)}</td><td>${cell(vs)}</td></tr>`;
  }
  return rows;
}
