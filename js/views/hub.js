// Hub orbital interactif : Forme au centre, domaines en orbite, navigation
// en profondeur (sport → séances récentes + perf + stats ; charge → métriques).
import { db } from '../db.js';
import { fmt, currentFitness, weeklyStats, perfReference, predictionTable, workoutLoad, daysBetween, todayIso } from '../metrics.js';
import { sparkline } from '../charts.js';
import { tsbLabel, coachContext } from '../advice.js';
import { esc } from '../ui.js';

const POS = [[50, 9], [13, 30], [87, 30], [16, 82], [84, 82]]; // haut, gauche, droite, bas-g, bas-d
const CENTER = [50, 47];
const TAG_COL = { bad: '#f87171', warn: '#fbbf24', info: '#9fb0d0', good: '#34d399' };
const SPORTS = {
  run: { ico: '🏃', name: 'Course', col: '#ff6b4a', cls: 'hv-run' },
  trail: { ico: '⛰️', name: 'Trail', col: '#a3e635', cls: 'hv-trail' },
  bike: { ico: '🚴', name: 'Vélo', col: '#38bdf8', cls: 'hv-bike' },
  rest: { ico: '😴', name: 'Repos', col: '#93c5fd', cls: 'hv-rest' },
};

export function mountHub(hubEl, detailEl, navigate) {
  const state = db.get();
  const { workouts, profile, goal, plan } = state;
  const fit = currentFitness(workouts, profile);
  const tsb = tsbLabel(fit.tsb);
  const today = todayIso();
  const in28 = w => daysBetween(w.date, today) >= 0 && daysBetween(w.date, today) < 28;
  const cnt = s => workouts.filter(w => w.sport === s && in28(w)).length;
  const sum = (s, k) => Math.round(workouts.filter(w => w.sport === s && in28(w)).reduce((a, w) => a + (w[k] || 0), 0));
  const pref = perfReference(workouts, profile);
  const ctx = coachContext(state);
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));

  function speedTxt(w) {
    if (!w.distanceKm || !w.durationMin) return '';
    return w.sport === 'bike' ? fmt.speed(w.distanceKm / (w.durationMin / 60)) : fmt.pace(w.durationMin / w.distanceKm);
  }

  function workoutSat(w) {
    const sp = SPORTS[w.sport];
    return {
      ico: w.isRace ? '🏁' : sp.ico,
      name: fmt.dateShort(w.date),
      val: w.sport === 'rest' ? (w.steps ? Math.round(w.steps / 1000) + 'k pas' : 'repos') : (w.distanceKm ? fmt.km(w.distanceKm) : fmt.dur(w.durationMin)),
      cls: sp.cls, col: sp.col,
      action: () => showWorkoutDetail(w),
    };
  }

  function rootState() {
    return {
      center: { ico: '', lab: 'Forme', val: (fit.tsb > 0 ? '+' : '') + Math.round(fit.tsb), tag: tsb.label, tagCol: TAG_COL[tsb.cls] },
      sats: [
        { ico: '🏃', name: 'Course', val: cnt('run') + ' séances', cls: 'hv-run', col: '#ff6b4a', action: () => go({ level: 'sport', sport: 'run' }) },
        { ico: '⛰️', name: 'Trail', val: sum('trail', 'elevGain') + ' m D+', cls: 'hv-trail', col: '#a3e635', action: () => go({ level: 'sport', sport: 'trail' }) },
        { ico: '🚴', name: 'Vélo', val: fmt.dur(sum('bike', 'durationMin')), cls: 'hv-bike', col: '#38bdf8', action: () => go({ level: 'sport', sport: 'bike' }) },
        { ico: '😴', name: 'Repos', val: cnt('rest') + ' jours', cls: 'hv-rest', col: '#93c5fd', action: () => go({ level: 'sport', sport: 'rest' }) },
        { ico: '⚡', name: 'Charge', val: 'CTL ' + fit.ctl, cls: 'hv-load', col: '#fbbf24', action: () => go({ level: 'charge' }) },
      ],
    };
  }

  function sportState(sport) {
    const sp = SPORTS[sport];
    const recent = sorted.filter(w => w.sport === sport).slice(0, 3);
    const sats = recent.map(workoutSat);
    if (sport === 'run' || sport === 'trail') {
      if (pref) sats.push({ ico: '⚡', name: 'Perf', val: 'VMA ' + pref.vma.toFixed(1), cls: 'hv-perf', col: '#22d3ee', action: () => showPerfDetail(sport) });
      sats.push({ ico: '📊', name: 'Stats 28 j', val: sum(sport, 'distanceKm') + ' km', cls: sp.cls, col: sp.col, action: () => showStatsDetail(sport) });
    } else if (sport === 'bike') {
      sats.push({ ico: '⚡', name: 'Perf', val: profile.ftp ? 'FTP ' + profile.ftp + ' W' : 'FTP ?', cls: 'hv-perf', col: '#22d3ee', action: () => showPerfDetail(sport) });
      sats.push({ ico: '📊', name: 'Stats 28 j', val: sum('bike', 'distanceKm') + ' km', cls: sp.cls, col: sp.col, action: () => showStatsDetail(sport) });
    } else {
      const rests = workouts.filter(w => w.sport === 'rest' && in28(w));
      const avgSteps = rests.length ? Math.round(rests.reduce((a, w) => a + (w.steps || 0), 0) / rests.length) : 0;
      sats.push({ ico: '🚶', name: 'Pas moyens', val: avgSteps ? avgSteps.toLocaleString('fr-FR') : '—', cls: 'hv-rest', col: '#93c5fd', action: () => showRestDetail() });
      sats.push({ ico: '🔥', name: 'Sans repos', val: ctx.daysSinceRest + ' j', cls: ctx.daysSinceRest > 10 ? 'hv-load' : 'hv-muted', col: '#fbbf24', action: () => showRestDetail() });
    }
    return {
      parent: 'root',
      center: { ico: sp.ico, lab: sp.name, val: String(sport === 'rest' ? cnt('rest') : cnt(sport)), tag: (sport === 'rest' ? cnt('rest') + ' j' : cnt(sport) + ' séances') + ' / 28 j', tagCol: sp.col },
      sats,
    };
  }

  function chargeState() {
    const acCls = ctx.acRatio > 1.5 ? '#f87171' : ctx.acRatio > 1.3 ? '#fbbf24' : ctx.acRatio < 0.8 ? '#9fb0d0' : '#34d399';
    return {
      parent: 'root',
      center: { ico: '⚡', lab: 'Charge', val: String(fit.ctl), tag: 'CTL · fitness 42 j', tagCol: '#fbbf24' },
      sats: [
        { ico: '🔥', name: 'Fatigue', val: 'ATL ' + fit.atl, cls: 'hv-run', col: '#fb923c', action: showChargeDetail },
        { ico: '🧘', name: 'Forme', val: 'TSB ' + (fit.tsb > 0 ? '+' : '') + fit.tsb, cls: 'hv-perf', col: '#34d399', action: showChargeDetail },
        { ico: '⚖️', name: 'ACWR', val: String(ctx.acRatio), cls: 'hv-load', col: acCls, action: showChargeDetail },
        { ico: '🔁', name: 'Monotonie', val: String(ctx.monotony), cls: ctx.monotony > 2 ? 'hv-run' : 'hv-muted', col: '#a78bfa', action: showChargeDetail },
        { ico: '🎚️', name: '80/20', val: ctx.pctLowIntensity + '% facile', cls: ctx.pctLowIntensity < 70 ? 'hv-load' : 'hv-trail', col: '#a3e635', action: showChargeDetail },
      ],
    };
  }

  let current = { level: 'root' };
  const stateFor = s => s.level === 'sport' ? sportState(s.sport) : s.level === 'charge' ? chargeState() : rootState();

  function renderHubView() {
    const st = stateFor(current);
    const [cx, cy] = CENTER;
    const wires = st.sats.map((s, i) => {
      const [x, y] = POS[i];
      const mx = cx + (x - cx) * 0.55, my = cy + (y - cy) * 0.55;
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(148,170,220,.28)" stroke-width=".45" stroke-dasharray="1.6 1.8"/>
        <circle cx="${mx}" cy="${my}" r="1.5" fill="${s.col}"/>
        <circle cx="${mx}" cy="${my}" r="2.6" fill="none" stroke="${s.col}" stroke-width=".35" opacity=".5"/>`;
    }).join('');
    hubEl.innerHTML = `
      <button class="hub-back ${st.parent ? 'on' : ''}" id="hub-back-btn" type="button">← Retour</button>
      <svg class="wires" viewBox="0 0 100 105" preserveAspectRatio="none">
        <circle cx="${cx}" cy="${cy}" r="26" fill="none" stroke="rgba(148,170,220,.2)" stroke-width=".4" stroke-dasharray="2 2.4"/>
        ${wires}
      </svg>
      ${st.sats.map((s, i) => `
        <div class="hub-item" data-i="${i}" style="left:${POS[i][0]}%;top:${POS[i][1] / 1.05}%">
          <div class="hub-tile">${s.ico}</div>
          <div class="hub-name">${esc(s.name)}</div>
          <div class="hub-val ${s.cls}">${esc(String(s.val))}</div>
        </div>`).join('')}
      <div class="hub-center" id="hub-center">
        ${st.center.ico ? `<span class="c-ico">${st.center.ico}</span>` : ''}
        <span class="c-lab">${esc(st.center.lab)}</span>
        <span class="c-val">${esc(String(st.center.val))}</span>
        <span class="c-tag" style="color:${st.center.tagCol}">${esc(st.center.tag)}</span>
      </div>`;
    hubEl.querySelectorAll('.hub-item').forEach(el =>
      el.addEventListener('click', () => st.sats[+el.dataset.i]?.action?.()));
    hubEl.querySelector('#hub-center').addEventListener('click', () => { if (st.parent) go({ level: 'root' }); });
    hubEl.querySelector('#hub-back-btn')?.addEventListener('click', () => go({ level: 'root' }));
  }

  function go(next) {
    current = next;
    detailEl.innerHTML = '';
    hubEl.classList.add('swapping');
    setTimeout(() => { renderHubView(); hubEl.classList.remove('swapping'); }, 190);
  }

  // ---------- Fiches détail ----------
  function detailCard(html) {
    detailEl.innerHTML = `<div class="card glow">${html}</div>`;
    detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showWorkoutDetail(w) {
    const sp = SPORTS[w.sport];
    if (w.sport === 'rest') {
      detailCard(`<h3>😴 Jour de repos · ${fmt.date(w.date)}</h3>
        <div class="hd-grid">
          <div class="stat"><span class="l">Pas</span><span class="v">${w.steps ? w.steps.toLocaleString('fr-FR') : '—'}</span></div>
          <div class="stat"><span class="l">Charge NEAT</span><span class="v">+${workoutLoad(w, profile)}</span></div>
          <div class="stat"><span class="l">Type</span><span class="v" style="font-size:13px">${w.steps > 6000 ? 'actif' : 'complet'}</span></div>
        </div>
        ${w.notes ? `<p class="muted mt12">📝 ${esc(w.notes)}</p>` : ''}`);
      return;
    }
    detailCard(`<h3>${w.isRace ? '🏁' : sp.ico} ${esc(w.title || sp.name)} <span class="badge" style="margin-left:6px">${fmt.date(w.date)}</span></h3>
      <div class="hd-grid">
        <div class="stat"><span class="l">Durée</span><span class="v">${fmt.dur(w.durationMin)}</span></div>
        <div class="stat"><span class="l">Distance</span><span class="v">${w.distanceKm ? fmt.km(w.distanceKm) : '—'}</span></div>
        <div class="stat"><span class="l">${w.sport === 'bike' ? 'Vitesse' : 'Allure'}</span><span class="v" style="font-size:14px">${speedTxt(w) || '—'}</span></div>
        <div class="stat"><span class="l">D+</span><span class="v">${w.elevGain ? w.elevGain + ' m' : '—'}</span></div>
        <div class="stat"><span class="l">FC moy</span><span class="v">${w.avgHr || '—'}</span></div>
        <div class="stat"><span class="l">Charge</span><span class="v">${workoutLoad(w, profile)}</span></div>
      </div>
      ${w.series?.hr ? `<div class="mt12">${sparkline(w.series.hr, { width: 420, height: 60, color: '#ff6b4a' })}</div>` : ''}
      ${w.series?.elev ? `<div class="mt8">${sparkline(w.series.elev, { width: 420, height: 60, color: '#a3e635' })}</div>` : ''}
      ${w.notes ? `<p class="muted mt8 small">📝 ${esc(w.notes)}</p>` : ''}
      <button class="btn ghost sm mt12" data-nav="workouts">Ouvrir dans Mes séances →</button>`);
    detailEl.querySelector('[data-nav]')?.addEventListener('click', () => navigate('workouts'));
  }

  function showPerfDetail(sport) {
    if (sport === 'bike') {
      const wkg = profile.ftp && profile.weightKg ? (profile.ftp / profile.weightKg).toFixed(1) : null;
      detailCard(`<h3>⚡ Performance vélo</h3>
        <div class="hd-grid">
          <div class="stat"><span class="l">FTP</span><span class="v">${profile.ftp ? profile.ftp + ' W' : '—'}</span></div>
          <div class="stat"><span class="l">w/kg</span><span class="v">${wkg || '—'}</span></div>
          <div class="stat"><span class="l">28 j</span><span class="v" style="font-size:15px">${fmt.dur(sum('bike', 'durationMin'))}</span></div>
        </div>
        ${!profile.ftp ? '<button class="btn ghost sm mt12" data-nav="analysis">Faire le test FTP (Analyse) →</button>' : '<button class="btn ghost sm mt12" data-nav="analysis">Voir l\'analyse complète →</button>'}`);
      detailEl.querySelector('[data-nav]')?.addEventListener('click', () => navigate('analysis'));
      return;
    }
    if (!pref) return;
    detailCard(`<h3>⚡ Performance ${sport === 'trail' ? 'trail' : 'course'}</h3>
      <p class="muted small">VMA ${pref.source === 'profile' ? 'du profil (test)' : 'estimée'} : <b style="color:var(--txt)">${pref.vma.toFixed(1)} km/h</b> · VO2max ≈ <b style="color:var(--txt)">${Math.round(pref.vma * 3.5)}</b> ml/min/kg</p>
      <div class="tbl-wrap mt12"><table class="tbl" style="min-width:0">
        <tr><th>Distance</th><th>Prédit</th></tr>
        ${predictionTable(pref.refDistKm, pref.refTimeMin).slice(0, 4).map(p =>
          `<tr><td>${p.label}</td><td><b>${fmt.durSec(p.timeMin * 60)}</b></td></tr>`).join('')}
      </table></div>
      <button class="btn ghost sm mt12" data-nav="analysis">Analyse & tests complets →</button>`);
    detailEl.querySelector('[data-nav]')?.addEventListener('click', () => navigate('analysis'));
  }

  function showStatsDetail(sport) {
    const sp = SPORTS[sport];
    const list = workouts.filter(w => w.sport === sport && in28(w));
    const withHr = list.filter(w => w.avgHr);
    const best = list.filter(w => w.distanceKm && w.durationMin).sort((a, b) => (b.distanceKm / b.durationMin) - (a.distanceKm / a.durationMin))[0];
    detailCard(`<h3>${sp.ico} ${sp.name} — 28 derniers jours</h3>
      <div class="hd-grid">
        <div class="stat"><span class="l">Séances</span><span class="v">${list.length}</span></div>
        <div class="stat"><span class="l">Distance</span><span class="v">${sum(sport, 'distanceKm')} km</span></div>
        <div class="stat"><span class="l">Temps</span><span class="v" style="font-size:15px">${fmt.dur(sum(sport, 'durationMin'))}</span></div>
        <div class="stat"><span class="l">D+</span><span class="v">${sum(sport, 'elevGain')} m</span></div>
        <div class="stat"><span class="l">FC moy</span><span class="v">${withHr.length ? Math.round(withHr.reduce((a, w) => a + w.avgHr, 0) / withHr.length) : '—'}</span></div>
        <div class="stat"><span class="l">Meilleure ${sport === 'bike' ? 'vitesse' : 'allure'}</span><span class="v" style="font-size:13px">${best ? speedTxt(best) : '—'}</span></div>
      </div>
      <button class="btn ghost sm mt12" data-nav="workouts">Toutes mes séances →</button>`);
    detailEl.querySelector('[data-nav]')?.addEventListener('click', () => navigate('workouts'));
  }

  function showRestDetail() {
    const rests = workouts.filter(w => w.sport === 'rest' && in28(w));
    const avgSteps = rests.length ? Math.round(rests.reduce((a, w) => a + (w.steps || 0), 0) / rests.length) : 0;
    detailCard(`<h3>😴 Récupération — 28 jours</h3>
      <div class="hd-grid">
        <div class="stat"><span class="l">Jours de repos</span><span class="v">${rests.length}</span></div>
        <div class="stat"><span class="l">Pas moyens</span><span class="v" style="font-size:16px">${avgSteps ? avgSteps.toLocaleString('fr-FR') : '—'}</span></div>
        <div class="stat"><span class="l">Sans repos</span><span class="v">${ctx.daysSinceRest} j</span></div>
      </div>
      <p class="muted mt12 small">${ctx.daysSinceRest > 13 ? '⚠️ Plus de 13 jours sans repos complet : planifiez-en un — c\'est pendant le repos que les adaptations se consolident.' : '✅ Rythme de récupération correct. Objectif : 1 jour de repos complet par semaine minimum.'}</p>`);
  }

  function showChargeDetail() {
    detailCard(`<h3>⚡ Charge d'entraînement</h3>
      <div class="hd-grid">
        <div class="stat"><span class="l">CTL fitness</span><span class="v">${fit.ctl}</span></div>
        <div class="stat"><span class="l">ATL fatigue</span><span class="v">${fit.atl}</span></div>
        <div class="stat"><span class="l">TSB forme</span><span class="v">${fit.tsb > 0 ? '+' : ''}${fit.tsb}</span></div>
        <div class="stat"><span class="l">ACWR</span><span class="v">${ctx.acRatio}</span></div>
        <div class="stat"><span class="l">Monotonie</span><span class="v">${ctx.monotony}</span></div>
        <div class="stat"><span class="l">Basse intensité</span><span class="v">${ctx.pctLowIntensity}%</span></div>
      </div>
      <p class="muted mt12 small">${esc(tsb.text)} Zone ACWR sûre : 0,8-1,3 · monotonie &lt; 2 · cible 80 % du temps en Z1-Z2.</p>
      <button class="btn ghost sm mt12" data-nav="analysis">Analyse détaillée →</button>`);
    detailEl.querySelector('[data-nav]')?.addEventListener('click', () => navigate('analysis'));
  }

  renderHubView();
}
