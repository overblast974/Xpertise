// Écran analyse : charge, polarisation, zones personnalisées, prédictions, niveau.
import { db } from '../db.js';
import { COACH } from '../knowledge/coaching.js';
import { fmt, weeklyStats, perfReference, predictionTable, progressionTrend, acRatio, monotony, polarizationRatio, trailTime, estimateHrMax } from '../metrics.js';
import { weeklyBars, donut } from '../charts.js';
import { coachAdvice } from '../advice.js';
import { esc, infoBtn, toast } from '../ui.js';

export function renderAnalysis(root) {
  const state = db.get();
  const { workouts, profile } = state;
  const weeks = weeklyStats(workouts, profile, 12);
  const pol = polarizationRatio(workouts, profile);
  const ac = acRatio(workouts, profile);
  const mono = monotony(workouts, profile);
  const pref = perfReference(workouts, profile);
  const trend = progressionTrend(workouts);
  const { advice } = coachAdvice(state, 8);

  root.innerHTML = `
    <div class="section-title" style="margin-top:4px">Analyse d'entraînement</div>

    <div class="cards-3">
      <div class="card">
        <div class="stat"><span class="l">Ratio charge aiguë:chronique${infoBtn('acwr')}</span>
        <span class="v">${ac ?? '—'}</span>
        <span class="d">${acLabel(ac)}</span></div>
        <div class="meter mt8"><i style="width:${ac ? Math.min(100, ac / 2 * 100) : 0}%"></i></div>
        <p class="muted mt8 small">Zone sûre : 0,8 – 1,3. Au-delà de 1,5 : risque de blessure nettement accru.</p>
      </div>
      <div class="card">
        <div class="stat"><span class="l">Monotonie (Foster)${infoBtn('monotony')}</span>
        <span class="v">${mono ?? '—'}</span>
        <span class="d">${monoLabel(mono)}</span></div>
        <p class="muted mt8 small">&lt; 1,5 : bonne variété. &gt; 2 : trop de jours identiques — alternez dur/facile et gardez un vrai jour de repos.</p>
      </div>
      <div class="card">
        <div class="stat"><span class="l">Polarisation (28 j)${infoBtn('polarization')}</span>
        <span class="v">${pol == null ? '—' : Math.round(pol * 100) + '<small>% facile</small>'}</span>
        <span class="d">${polLabel(pol)}</span></div>
        <div class="meter mt8"><i style="width:${pol == null ? 0 : pol * 100}%"></i></div>
        <p class="muted mt8 small">${esc(COACH.planRules.intensityDistribution.textFr || 'Objectif : ~80 % du temps en Z1-Z2.')}</p>
      </div>
    </div>

    <div class="section-title">Charge hebdomadaire (TRIMP) ${infoBtn('weekload')}</div>
    <div class="card"><div class="chart-wrap">${weeklyBars(weeks, 'load', { color: '#7c5cff' })}</div></div>

    <div class="cards-2 mt12">
      <div class="card"><h3>Distance / semaine</h3><div class="chart-wrap">${weeklyBars(weeks.slice(-8), 'distanceKm', { color: '#22d3ee', unit: ' km' })}</div></div>
      <div class="card"><h3><span>D+ / semaine${infoBtn('dplus')}</span></h3><div class="chart-wrap">${weeklyBars(weeks.slice(-8), 'elevGain', { color: '#a3e635', unit: ' m' })}</div></div>
    </div>

    ${advice.length ? `<div class="section-title">Lecture du coach</div>
    <div class="grid">${advice.map(a => `
      <div class="advice ${a.severity}"><span class="a-ico">${a.severity === 'bad' ? '🛑' : a.severity === 'warn' ? '⚠️' : a.severity === 'good' ? '✅' : '💡'}</span><span>${esc(a.message)}</span></div>`).join('')}</div>` : ''}

    <div class="section-title">Extrapolation de performance ${infoBtn('prediction')}</div>
    ${pref ? `
    <div class="card glow">
      <p class="muted">${pref.source === 'profile'
        ? `Référence : <b style="color:var(--txt)">VMA du profil ${pref.vma.toFixed(1)} km/h</b> <span class="badge good">test enregistré</span>`
        : `Référence : <b style="color:var(--txt)">${esc(pref.workout?.title || 'meilleure sortie')}</b> — ${fmt.km(pref.refDistKm)} en ${fmt.dur(pref.refTimeMin)} → VMA estimée <b style="color:var(--txt)">${pref.vma.toFixed(1)} km/h</b>`}
       · VO2max ≈ <b style="color:var(--txt)">${Math.round(pref.vma * 3.5)}</b> ml/min/kg${levelBadge(pref.vma)} ${infoBtn('vma')}</p>
      ${pref.source === 'profile' && pref.workoutEst && Math.abs(pref.workoutEst - pref.vma) > 0.5
        ? `<p class="muted mt8 small">ℹ️ Vos sorties récentes suggèrent ~${pref.workoutEst.toFixed(1)} km/h : ${pref.workoutEst > pref.vma ? 'vous valez peut-être mieux que votre dernier test — re-testez !' : 'l\'écart est normal, un test à fond reste la référence.'}</p>` : ''}
      ${trend ? `<p class="muted mt8">Tendance sur 90 j (${trend.points} séances) ${infoBtn('trend')} : <b class="${trend.perMonth >= 0 ? 'up' : 'down'}">${trend.perMonth >= 0 ? '+' : ''}${trend.perMonth.toFixed(2)} km/h de VMA par mois</b> → dans 8 semaines : <b style="color:var(--txt)">${(pref.vma + trend.perMonth * 1.87).toFixed(1)} km/h</b></p>` : ''}
      <div class="tbl-wrap mt12"><table class="tbl">
        <tr><th>Distance</th><th>Temps prédit</th><th>Allure</th></tr>
        ${predictionTable(pref.refDistKm, pref.refTimeMin).map(p =>
          `<tr><td>${p.label}</td><td><b>${fmt.durSec(p.timeMin * 60)}</b></td><td>${fmt.pace(p.pace)}</td></tr>`).join('')}
      </table></div>
      <p class="muted mt8 small">Modèle de Riegel (k = 1,06 route, majoré au-delà du marathon)${pref.source === 'profile' ? ', appliqué à un 10 km théorique déduit de votre VMA' : ''}. En trail, comptez ${esc(dplusCost())} par 100 m de D+ selon votre niveau.</p>
    </div>` : `<div class="card"><p class="muted">Renseignez votre VMA (Tests de terrain ci-dessous ou Profil), ou ajoutez une sortie route/plat ≥ 3 km soutenue (ou une course 🏁) pour activer l'extrapolation.</p></div>`}

    <div class="section-title">Mes zones personnalisées ${infoBtn('zones')}</div>
    <div class="cards-2">
      <div class="card">
        <h3><span>♥ Zones cardio (FCmax ${profile.hrMax}) ${infoBtn('hrmax')}</span></h3>
        ${COACH.zones.heartRate.zones.map((z, i) => zoneRow(z, i, pctToBpm(z, profile))).join('')}
      </div>
      <div class="card">
        <h3>🏃 Zones d'allure ${pref ? `(VMA ${pref.vma.toFixed(1)}${pref.source === 'profile' ? '' : ' est.'})` : ''}</h3>
        ${pref
          ? COACH.zones.runningPace.zones.map((z, i) => zoneRow(z, i, pctVmaToPace(z, pref.vma))).join('')
          : '<p class="muted">Renseignez votre VMA dans le profil (ou ajoutez une perf de référence).</p>'}
      </div>
      ${profile.ftp ? `<div class="card">
        <h3>🚴 Zones puissance (FTP ${profile.ftp} W)</h3>
        ${COACH.zones.cyclingPower.zones.slice(0, 6).map((z, i) => zoneRow(z, Math.min(i, 4), pctFtpToW(z, profile.ftp))).join('')}
      </div>` : ''}
    </div>

    <div class="section-title">🧪 Tests de terrain ${infoBtn('vma')}</div>
    <p class="muted" style="margin:0 2px 10px">Les estimations automatiques sont pratiques, mais rien ne remplace un vrai test. Faites-les reposé (TSB &gt; 0), échauffé 15-20 min, sur terrain plat ou piste, sans vent fort. Re-testez toutes les 6-8 semaines pour objectiver la progression.</p>
    <div class="cards-2">
      <div class="card glow">
        <h3>🏃 Demi-Cooper (6 min) — le + simple</h3>
        <p class="muted small">Courez la <b>plus grande distance possible en 6 minutes</b>, départ lancé, allure régulière (piste ou GPS). VMA = distance (m) ÷ 100.</p>
        <div class="f-row mt12">
          <label class="f">Distance en 6 min (m)<input type="number" id="t-halfcooper" min="600" max="2600" placeholder="1600"></label>
          <div class="stat" style="justify-content:center"><span class="l">Résultat</span><span class="v" id="t-halfcooper-out" style="font-size:19px">—</span></div>
        </div>
        <button class="btn sm mt8" id="t-halfcooper-save" disabled>Enregistrer comme VMA</button>
      </div>
      <div class="card">
        <h3>🏃 Cooper (12 min) — VO2max</h3>
        <p class="muted small">Plus grande distance possible en <b>12 minutes</b>. VO2max = (distance − 505) ÷ 44,7 (formule de Cooper). Plus dur mentalement mais bon reflet de l'endurance aérobie.</p>
        <div class="f-row mt12">
          <label class="f">Distance en 12 min (m)<input type="number" id="t-cooper" min="1200" max="5200" placeholder="3000"></label>
          <div class="stat" style="justify-content:center"><span class="l">Résultat</span><span class="v" id="t-cooper-out" style="font-size:19px">—</span></div>
        </div>
        <button class="btn sm mt8" id="t-cooper-save" disabled>Enregistrer comme VMA</button>
      </div>
      <div class="card">
        <h3>🚴 FTP — test 20 minutes</h3>
        <p class="muted small">Après échauffement + 5 min à fond pour "vider" l'anaérobie : <b>20 min au maximum soutenable régulier</b>. FTP = puissance moyenne × 0,95.</p>
        <div class="f-row mt12">
          <label class="f">Puissance moy. 20 min (W)<input type="number" id="t-ftp" min="80" max="550" placeholder="250"></label>
          <div class="stat" style="justify-content:center"><span class="l">Résultat</span><span class="v" id="t-ftp-out" style="font-size:19px">—</span></div>
        </div>
        <button class="btn sm mt8" id="t-ftp-save" disabled>Enregistrer comme FTP</button>
      </div>
      <div class="card glow">
        <h3><span>❤️ FC max — estimation multi-sources ${infoBtn('hrmax')}</span></h3>
        <p class="muted small">Moyenne des 3 formules les plus validées (Tanaka, Gellish, Nes/HUNT — pas la « 220−âge », trop imprécise), croisée avec vos données réelles : pic de FC de vos séances importées et FC moyenne de vos courses.</p>
        <label class="f mt12" style="max-width:220px">Année de naissance<input type="number" id="t-hrmax-year" min="1930" max="2015" value="${profile.birthYear || ''}" placeholder="1997"></label>
        <div id="t-hrmax-out" class="mt12"></div>
        <button class="btn sm mt8" id="t-hrmax-save" disabled>Enregistrer comme FC max</button>
      </div>
      <div class="card">
        <h3>📋 Autres protocoles fiables</h3>
        <p class="muted small">
        <b>Vameval</b> (piste, plots tous les 20 m, +0,5 km/h/min) : le test de référence des clubs — la vitesse du dernier palier complété = VMA.<br><br>
        <b>Test 5 min à fond</b> (GPS) : vitesse moyenne ≈ 95-100 % de la VMA.<br><br>
        <b>FCmax</b> : après échauffement, 3 × 3 min en côte à intensité croissante, la dernière à fond — la FC en haut de la 3ᵉ ≈ FCmax. Mettez-la à jour dans le Profil, toutes vos zones en dépendent.<br><br>
        <b>Vitesse ascensionnelle</b> (trail) : montée régulière de 20-30 min à fond contrôlé → D+ ÷ temps (m/h), à comparer à la grille ci-dessous.</p>
      </div>
    </div>

    <div class="section-title">Grilles de niveau</div>
    <div class="card">
      <div class="tbl-wrap"><table class="tbl">
        <tr><th>Niveau</th><th>VMA (H)</th><th>Marathon</th><th>FTP w/kg (H)</th><th>V. ascensionnelle</th></tr>
        ${levelGridRows()}
      </table></div>
      <p class="muted mt8 small">${esc(COACH.levelGrids.verticalSpeed.commentFr || '')}</p>
    </div>
  `;

  wireFieldTests(root);
}

// Calculateurs des tests de terrain : résultat en direct + enregistrement au profil
function wireFieldTests(root) {
  const bind = (inputId, outId, saveId, compute, save) => {
    const input = root.querySelector('#' + inputId);
    const out = root.querySelector('#' + outId);
    const btn = root.querySelector('#' + saveId);
    if (!input) return;
    let result = null;
    input.addEventListener('input', () => {
      result = compute(+input.value);
      out.innerHTML = result ? result.label : '—';
      btn.disabled = !result;
    });
    btn.addEventListener('click', () => {
      if (!result) return;
      save(result);
      window.dispatchEvent(new Event('xp:refresh'));
    });
  };

  bind('t-halfcooper', 't-halfcooper-out', 't-halfcooper-save',
    m => {
      if (!m || m < 600 || m > 2600) return null;
      const vma = m / 100;
      return { vma, label: `${vma.toFixed(1)} <small>km/h</small><br><span class="muted small">VO2max ≈ ${Math.round(vma * 3.5)} ml/min/kg</span>` };
    },
    r => { db.setProfile({ vma: +r.vma.toFixed(1) }); toast(`VMA ${r.vma.toFixed(1)} km/h enregistrée ✔`); });

  bind('t-cooper', 't-cooper-out', 't-cooper-save',
    m => {
      if (!m || m < 1200 || m > 5200) return null;
      const vo2 = (m - 504.9) / 44.73;
      const vma = vo2 / 3.5;
      return { vma, label: `VO2max ${Math.round(vo2)}<br><span class="muted small">VMA ≈ ${vma.toFixed(1)} km/h</span>` };
    },
    r => { db.setProfile({ vma: +r.vma.toFixed(1) }); toast(`VMA ${r.vma.toFixed(1)} km/h enregistrée ✔`); });

  wireHrMaxEstimator(root);

  bind('t-ftp', 't-ftp-out', 't-ftp-save',
    w => {
      if (!w || w < 80 || w > 550) return null;
      const ftp = Math.round(w * 0.95);
      const kg = db.get().profile.weightKg;
      return { ftp, label: `${ftp} <small>W</small>${kg ? `<br><span class="muted small">${(ftp / kg).toFixed(1)} w/kg</span>` : ''}` };
    },
    r => { db.setProfile({ ftp: r.ftp }); toast(`FTP ${r.ftp} W enregistrée ✔`); });
}

// Estimateur FC max : formules validées + données réelles des séances
function wireHrMaxEstimator(root) {
  const yearInput = root.querySelector('#t-hrmax-year');
  const out = root.querySelector('#t-hrmax-out');
  const btn = root.querySelector('#t-hrmax-save');
  if (!yearInput) return;
  let est = null;

  const render = () => {
    const year = +yearInput.value || null;
    const { workouts, profile } = db.get();
    est = estimateHrMax(workouts, year && year > 1930 && year < 2016 ? year : null);
    if (!est) {
      out.innerHTML = '<p class="muted small">Renseignez votre année de naissance et/ou importez des séances avec cardio pour obtenir une estimation.</p>';
      btn.disabled = true;
      return;
    }
    const rows = [];
    for (const f of est.formulas) rows.push(`<div class="row spread small" style="padding:4px 0;border-bottom:1px solid var(--line)"><span class="muted">${esc(f.name)} <span style="opacity:.6">(${esc(f.detail)})</span></span><b>${f.value} bpm</b></div>`);
    if (est.formulaAvg) rows.push(`<div class="row spread small" style="padding:4px 0;border-bottom:1px solid var(--line)"><span class="muted">→ Moyenne des formules</span><b>${est.formulaAvg} bpm</b></div>`);
    if (est.seriesMax) rows.push(`<div class="row spread small" style="padding:4px 0;border-bottom:1px solid var(--line)"><span class="muted">📈 Pic observé (${esc(est.seriesRef?.title || 'séance importée')})</span><b>${est.seriesMax} bpm</b></div>`);
    if (est.raceDerived) rows.push(`<div class="row spread small" style="padding:4px 0;border-bottom:1px solid var(--line)"><span class="muted">🏁 Déduite de la FC moy. en course (÷ 0,93)</span><b>${est.raceDerived} bpm</b></div>`);
    out.innerHTML = `${rows.join('')}
      <div class="row spread mt12" style="align-items:center">
        <span class="muted small">Meilleure estimation<br><span style="opacity:.7">source : ${esc(est.bestSource)} · fiabilité ${esc(est.confidence)}</span></span>
        <span class="nutri-num" style="font-size:26px">${est.best} <span style="font-size:13px">bpm</span></span>
      </div>`;
    btn.disabled = false;
    btn.textContent = `Enregistrer ${est.best} bpm comme FC max`;
  };

  yearInput.addEventListener('input', render);
  render();

  btn.addEventListener('click', () => {
    if (!est) return;
    const patch = { hrMax: est.best };
    const year = +yearInput.value;
    if (year > 1930 && year < 2016) patch.birthYear = year;
    db.setProfile(patch);
    toast(`FC max ${est.best} bpm enregistrée ✔ (zones recalculées)`);
    window.dispatchEvent(new Event('xp:refresh'));
  });
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
