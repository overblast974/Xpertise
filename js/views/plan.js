// Écran plan : définition d'objectif (distance, D+, temps) et plan périodisé généré.
import { db } from '../db.js';
import { fmt, todayIso, addDays, daysBetween } from '../metrics.js';
import { generatePlan, PHASE_LABEL } from '../plan.js';
import { esc, SPORT, modal, toast, confirmDlg, bindSeg } from '../ui.js';

export function renderPlan(root) {
  const { goal, plan, profile, workouts } = db.get();

  if (!plan) {
    root.innerHTML = `
      <div class="hero">
        <div class="hello">Générateur de plan</div>
        <div class="hero-line">Un <b>objectif</b>, un plan <b>périodisé</b></div>
        <div class="hero-note">Renseignez votre course (distance, D+, temps visé, date) : Xpertise construit un plan
        base → développement → spécifique → affûtage, avec semaines de décharge, sortie longue progressive et
        répartition 80/20 — selon les règles des meilleures structures d'entraînement.</div>
        <button class="btn mt16" id="btn-goal">🎯 Définir mon objectif</button>
      </div>
      <div class="cards-2 mt12">
        ${Object.entries(PHASE_LABEL).map(([k, p]) => `
        <div class="card"><h3><span style="display:inline-block;width:10px;height:10px;border-radius:3px" class="${p.cls}"></span> ${p.name}</h3>
        <p class="muted">${esc(p.desc)}</p></div>`).join('')}
      </div>`;
    root.querySelector('#btn-goal').onclick = () => openGoalForm();
    return;
  }

  const today = todayIso();
  const daysToRace = daysBetween(today, goal.date);
  const done = plan.weeks.flatMap(w => w.sessions).filter(s => s.done).length;
  const total = plan.weeks.flatMap(w => w.sessions).length;
  const pc = plan.phaseCounts;

  root.innerHTML = `
    <div class="hero">
      <div class="hello">Objectif · ${esc(SPORT[goal.sport]?.label || '')} ${goal.isRaceName ? esc(goal.isRaceName) : ''}</div>
      <div class="hero-line"><b>${goal.distanceKm} km</b>${goal.elevGain ? ` / <b>${goal.elevGain} m D+</b>` : ''}${goal.targetTimeMin ? ` · visé <b>${fmt.dur(goal.targetTimeMin)}</b>` : ''}</div>
      <div class="hero-note">
        ${fmt.date(goal.date)} — ${daysToRace >= 0 ? `dans <b>${daysToRace} jours</b>` : 'passé'} ·
        plan de ${plan.nWeeks} semaines
        ${plan.prediction ? `<br>⚡ Temps extrapolé de vos données : <b>${fmt.durSec(plan.prediction.timeMin * 60)}</b> <span class="small">(${esc(plan.prediction.basis)})</span>` : ''}
      </div>
      <div class="phase-bar mt12">
        <i class="ph-base" style="width:${pc.base / plan.nWeeks * 100}%"></i>
        <i class="ph-build" style="width:${pc.build / plan.nWeeks * 100}%"></i>
        <i class="ph-peak" style="width:${pc.specific / plan.nWeeks * 100}%"></i>
        <i class="ph-taper" style="width:${pc.taper / plan.nWeeks * 100}%"></i>
      </div>
      <div class="chart-legend">
        <span><i class="ph-base"></i>Base (${pc.base} sem)</span>
        <span><i class="ph-build"></i>Développement (${pc.build})</span>
        <span><i class="ph-peak"></i>Spécifique (${pc.specific})</span>
        <span><i class="ph-taper"></i>Affûtage (${pc.taper})</span>
      </div>
      <div class="row mt12 spread">
        <span class="badge">${done}/${total} séances faites</span>
        <span class="row">
          <button class="btn ghost sm" id="btn-regen">Régénérer</button>
          <button class="btn danger sm" id="btn-delplan">Supprimer</button>
        </span>
      </div>
    </div>

    <div class="section-title">Semaines</div>
    <div id="weeks"></div>
  `;

  const weeksEl = root.querySelector('#weeks');
  const currentMonday = plan.weeks.findIndex(w => today >= w.monday && today < addDays(w.monday, 7));
  weeksEl.innerHTML = plan.weeks.map((w, wi) => {
    const ph = PHASE_LABEL[w.phase];
    const isCurrent = wi === currentMonday;
    const open = isCurrent || (currentMonday === -1 && wi === 0);
    return `<div class="week-block">
      <div class="week-head" data-w="${wi}">
        <span>S${wi + 1} · ${fmt.dateShort(w.monday)}${isCurrent ? ' <span class="badge accent">en cours</span>' : ''}${w.deload ? ' <span class="badge good">décharge</span>' : ''}${w.isRaceWeek ? ' <span class="badge bad">🏁 course</span>' : ''}</span>
        <span class="row">
          <span class="badge ph ${ph.cls}" style="color:#0b0f1a;font-weight:800">${ph.name}</span>
          <span class="badge">${w.targetHours} h${w.targetDplus ? ' · ' + w.targetDplus + ' m D+' : ''}</span>
          <span>${open ? '▾' : '▸'}</span>
        </span>
      </div>
      <div class="week-body" style="${open ? '' : 'display:none'}">
        ${w.sessions.map((s, si) => `
        <div class="sess" style="${s.done ? 'opacity:.55' : ''}">
          <input type="checkbox" data-w="${wi}" data-s="${si}" ${s.done ? 'checked' : ''} style="width:auto;margin-top:2px" aria-label="Séance faite">
          <span class="day">${s.day}</span>
          <div style="flex:1;min-width:0">
            <div class="st">${esc(s.name)} ${s.durationMin ? `<span class="muted small">· ${fmt.dur(s.durationMin)}</span>` : ''} ${s.zone ? `<span class="badge" style="font-size:10px;padding:1px 7px">${esc(s.zone)}</span>` : ''}</div>
            <div class="sd">${esc(s.detail || '')}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }).join('');

  weeksEl.querySelectorAll('.week-head').forEach(h => h.addEventListener('click', () => {
    const body = h.nextElementSibling;
    const hidden = body.style.display === 'none';
    body.style.display = hidden ? '' : 'none';
    h.querySelector('span.row > span:last-child').textContent = hidden ? '▾' : '▸';
  }));
  weeksEl.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', () => {
    db.toggleSessionDone(+cb.dataset.w, +cb.dataset.s);
    cb.closest('.sess').style.opacity = cb.checked ? '.55' : '';
  }));

  root.querySelector('#btn-regen').onclick = () => openGoalForm(goal);
  root.querySelector('#btn-delplan').onclick = async () => {
    if (await confirmDlg('Supprimer le plan et l\'objectif ?', 'Supprimer')) {
      db.setPlan(null); db.setGoal(null);
      window.dispatchEvent(new Event('xp:refresh'));
    }
  };
}

export function openGoalForm(existing = null) {
  const g = existing || { sport: 'run' };
  const { profile, workouts } = db.get();
  const m = modal(`
    <h2>🎯 Mon objectif</h2>
    <form class="form" id="goal-form">
      <div class="seg" id="g-sport">
        <button type="button" data-v="run" class="${g.sport === 'run' ? 'on' : ''}">🏃 Route</button>
        <button type="button" data-v="trail" class="${g.sport === 'trail' ? 'on' : ''}">⛰️ Trail</button>
        <button type="button" data-v="bike" class="${g.sport === 'bike' ? 'on' : ''}">🚴 Vélo</button>
      </div>
      <label class="f">Nom de la course (optionnel)<input name="raceName" value="${esc(g.isRaceName || '')}" placeholder="ex : Diagonale des Fous, Marathon de Paris…"></label>
      <div class="f-row">
        <label class="f">Distance (km)<input type="number" name="distanceKm" required step="0.1" min="1" max="400" value="${g.distanceKm ?? ''}" placeholder="42.2"></label>
        <label class="f">D+ (m)<input type="number" name="elevGain" min="0" max="15000" value="${g.elevGain ?? ''}" placeholder="0"></label>
      </div>
      <div class="f-row">
        <label class="f">Date de la course<input type="date" name="date" required min="${addDays(todayIso(), 14)}" value="${g.date || ''}"></label>
        <label class="f">Temps visé (hh:mm)<input type="text" name="targetTime" pattern="\\d{1,2}:\\d{2}" value="${g.targetTimeMin ? Math.floor(g.targetTimeMin / 60) + ':' + String(Math.round(g.targetTimeMin % 60)).padStart(2, '0') : ''}" placeholder="3:45"></label>
      </div>
      <label class="f">Heures d'entraînement dispo / semaine
        <input type="number" name="weeklyHours" min="2" max="25" step="0.5" value="${g.weeklyHours || profile.weeklyHours || 6}">
      </label>
      <p class="muted small">Le plan démarre lundi prochain. Il s'adapte à votre volume récent (${recentVolumeTxt(workouts)}), progresse de ~7 %/semaine, place une décharge toutes les 4 semaines et un affûtage final.</p>
      <button class="btn" type="submit">Générer le plan</button>
    </form>
  `);
  const getSport = bindSeg(m.el.querySelector('#g-sport'));
  m.el.querySelector('#goal-form').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const tt = (fd.get('targetTime') || '').trim();
    let targetTimeMin = null;
    if (tt) { const [h, mn] = tt.split(':').map(Number); targetTimeMin = h * 60 + (mn || 0); }
    const goal = {
      sport: getSport() || 'run',
      isRaceName: fd.get('raceName')?.trim() || null,
      distanceKm: +fd.get('distanceKm'),
      elevGain: +(fd.get('elevGain') || 0),
      targetTimeMin,
      date: fd.get('date'),
      weeklyHours: +fd.get('weeklyHours'),
    };
    if (daysBetween(todayIso(), goal.date) < 14) { toast('Choisissez une date à au moins 2 semaines.'); return; }
    const { profile, workouts } = db.get();
    const plan = generatePlan(goal, profile, workouts);
    db.setGoal(goal);
    db.setPlan(plan);
    toast('Plan généré 🎯');
    m.close();
    window.dispatchEvent(new Event('xp:refresh'));
  });
}

function recentVolumeTxt(workouts) {
  const cutoff = addDays(todayIso(), -28);
  const min = workouts.filter(w => w.date >= cutoff).reduce((a, w) => a + (w.durationMin || 0), 0);
  return min ? `~${(min / 4 / 60).toFixed(1)} h/sem sur 4 semaines` : 'aucun historique récent';
}
