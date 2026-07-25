// Écran d'accueil : état de forme, charge, conseils du coach, prochaine séance, prédictions.
import { db } from '../db.js';
import { fmt, fitnessSeries, currentFitness, weeklyStats, perfReference, predictionTable, progressionTrend, todayIso, daysBetween, mondayOf } from '../metrics.js';
import { fitnessChart, weeklyBars, tsbGauge, donut } from '../charts.js';
import { coachAdvice, tsbLabel } from '../advice.js';
import { esc, SPORT, infoBtn } from '../ui.js';
import { openWorkoutForm } from './workouts.js';

export function renderDashboard(root, navigate) {
  const state = db.get();
  const { workouts, profile, goal, plan } = state;

  if (!workouts.length && !goal) {
    root.innerHTML = `
      <div class="hero">
        <div class="hello">Bienvenue sur</div>
        <div class="hero-line"><b>Xpertise</b> — votre coach endurance</div>
        <div class="hero-note">Suivi d'entraînement course, trail et vélo · analyse de charge scientifique (CTL/ATL/TSB) ·
        plans personnalisés · nutrition d'effort. Commencez par régler votre profil, puis ajoutez votre première séance.</div>
        <div class="row mt16">
          <button class="btn" id="cta-add">＋ Première séance</button>
          <button class="btn ghost" id="cta-profile">Régler mon profil</button>
        </div>
      </div>
      <div class="section-title">Ce que fait l'app</div>
      <div class="cards-2">
        <div class="card"><h3>📈 Suivi & analyse</h3><p class="muted">Charge d'entraînement (TRIMP), forme/fatigue (CTL·ATL·TSB), monotonie, polarisation 80/20 — les mêmes modèles que les structures pro.</p></div>
        <div class="card"><h3>🎯 Plan sur objectif</h3><p class="muted">Définissez une course (distance, D+, temps visé) : l'app périodise base → développement → spécifique → affûtage, avec décharges.</p></div>
        <div class="card"><h3>🥤 Nutrition d'effort</h3><p class="muted">Glucides/h, hydratation, sodium et caféine calculés selon durée, intensité, chaleur et votre poids (science Jeukendrup/Burke).</p></div>
        <div class="card"><h3>⌚ Import Garmin</h3><p class="muted">Importez vos fichiers FIT, GPX ou TCX exportés de Garmin Connect : durée, distance, D+ et FC sont extraits automatiquement.</p></div>
      </div>`;
    root.querySelector('#cta-add').onclick = () => openWorkoutForm();
    root.querySelector('#cta-profile').onclick = () => navigate('profile');
    return;
  }

  const fit = currentFitness(workouts, profile);
  const tsb = tsbLabel(fit.tsb);
  const series = fitnessSeries(workouts, profile, 90);
  const weeks = weeklyStats(workouts, profile, 8);
  const thisWeek = weeks[weeks.length - 1];
  const lastWeek = weeks[weeks.length - 2];
  const { advice } = coachAdvice(state, 3);
  const today = todayIso();

  // prochaine séance planifiée
  let nextSession = null;
  if (plan) {
    const dayIdx = { Lun: 0, Mar: 1, Mer: 2, Jeu: 3, Ven: 4, Sam: 5, Dim: 6 };
    outer:
    for (const w of plan.weeks) {
      for (const s of w.sessions) {
        const dIso = addDaysIso(w.monday, dayIdx[s.day] ?? 0);
        if (dIso >= today && !s.done) { nextSession = { ...s, date: dIso, phase: w.phase }; break outer; }
      }
    }
  }

  // répartition sports 28 j
  const bySport = { run: 0, trail: 0, bike: 0 };
  for (const w of workouts) {
    const age = daysBetween(w.date, today);
    if (age >= 0 && age < 28) bySport[w.sport] = (bySport[w.sport] || 0) + (w.durationMin || 0);
  }

  const pref = perfReference(workouts, profile);
  const trend = progressionTrend(workouts);
  const daysToRace = goal?.date ? daysBetween(today, goal.date) : null;

  root.innerHTML = `
    <div class="hero">
      <div class="hello">${greeting()}${profile.name ? ' ' + esc(profile.name) : ''} · ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <div class="hero-line">Forme : <b>${tsb.label}</b> <span class="badge ${tsb.cls}" style="vertical-align:middle">TSB ${fit.tsb > 0 ? '+' : ''}${fit.tsb}</span>${infoBtn('tsb')}</div>
      <div class="hero-note">${esc(tsb.text)}</div>
      ${daysToRace != null && daysToRace >= 0 ? `<div class="row mt12"><span class="badge accent">🏁 Objectif dans ${daysToRace} j — ${esc(goalLabel(goal))}</span></div>` : ''}
    </div>

    <div class="cards-3 mt12">
      <div class="card"><div class="stat">
        <span class="l">Fitness (CTL)${infoBtn('ctl')}</span>
        <span class="v">${fit.ctl}</span>
        <span class="d ${fit.ctlDelta7 > 0.5 ? 'up' : fit.ctlDelta7 < -0.5 ? 'down' : 'flat'}">${fit.ctlDelta7 > 0 ? '▲' : fit.ctlDelta7 < 0 ? '▼' : '•'} ${Math.abs(fit.ctlDelta7)} sur 7 j</span>
      </div></div>
      <div class="card"><div class="stat">
        <span class="l">Fatigue (ATL)${infoBtn('atl')}</span>
        <span class="v">${fit.atl}</span>
        <span class="d flat">charge aiguë 7 j</span>
      </div></div>
      <div class="card"><div class="stat">
        <span class="l">Cette semaine${infoBtn('weekload')}</span>
        <span class="v">${fmt.dur(thisWeek?.durationMin || 0)}</span>
        <span class="d flat">${thisWeek?.count || 0} séance${(thisWeek?.count || 0) > 1 ? 's' : ''} · ${Math.round(thisWeek?.distanceKm || 0)} km · ${Math.round(thisWeek?.elevGain || 0)} m D+</span>
      </div></div>
    </div>

    ${advice.length ? `<div class="section-title">Conseils du coach</div>
    <div class="grid">${advice.map(a => `
      <div class="advice ${a.severity}"><span class="a-ico">${a.severity === 'bad' ? '🛑' : a.severity === 'warn' ? '⚠️' : a.severity === 'good' ? '✅' : '💡'}</span><span>${esc(a.message)}</span></div>`).join('')}
    </div>` : ''}

    ${nextSession ? `<div class="section-title">Prochaine séance</div>
    <div class="card glow">
      <div class="row spread">
        <div>
          <div style="font-weight:800;font-size:16px">${esc(nextSession.name)}</div>
          <div class="muted mt8">${esc(nextSession.detail || '')}</div>
        </div>
      </div>
      <div class="row mt12">
        <span class="badge accent">${fmt.date(nextSession.date)}</span>
        ${nextSession.durationMin ? `<span class="badge">${fmt.dur(nextSession.durationMin)}</span>` : ''}
        ${nextSession.zone ? `<span class="badge">${esc(nextSession.zone)}</span>` : ''}
      </div>
    </div>` : ''}

    <div class="section-title">Forme sur 90 jours ${infoBtn('tsb')}</div>
    <div class="card">
      <div class="chart-wrap">${fitnessChart(series)}</div>
      <div class="chart-legend">
        <span><i style="background:#7c5cff"></i>Fitness (CTL)</span>
        <span><i style="background:#fb923c"></i>Fatigue (ATL)</span>
        <span><i style="background:#34d399"></i>Forme (TSB)</span>
      </div>
      <div class="row mt12" style="justify-content:center">${tsbGauge(fit.tsb)}</div>
    </div>

    <div class="section-title">Volume hebdomadaire ${infoBtn('weekload')}</div>
    <div class="card">
      <div class="chart-wrap">${weeklyBars(weeks, 'durationMin', { color: '#22d3ee' })}</div>
      ${lastWeek ? `<p class="muted mt8">${volumeComment(thisWeek, lastWeek)}</p>` : ''}
    </div>

    <div class="cards-2 mt12">
      <div class="card">
        <h3>Répartition 28 j</h3>
        <div class="row" style="justify-content:space-around">
          ${donut([
            { value: bySport.run, color: '#ff6b4a' },
            { value: bySport.trail, color: '#a3e635' },
            { value: bySport.bike, color: '#38bdf8' },
          ], { size: 120, stroke: 15 })}
          <div class="grid" style="gap:6px">
            ${['run', 'trail', 'bike'].map(s => `<span class="badge ${SPORT[s].cls}">${SPORT[s].ico} ${SPORT[s].label} · ${fmt.dur(bySport[s])}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <h3><span>Projection de perf ${infoBtn('trend')}</span> ${trend ? '' : '<span class="badge">besoin de + de données</span>'}</h3>
        ${pref ? `
          <p class="muted">VMA ${pref.source === 'profile' ? 'du profil (test)' : 'estimée de vos sorties'} : <b style="color:var(--txt)">${pref.vma.toFixed(1)} km/h</b> · VO2max ≈ <b style="color:var(--txt)">${Math.round(pref.vma * 3.5)}</b> ml/min/kg ${infoBtn('vma')}</p>
          ${trend ? `<p class="muted mt8">Tendance 90 j (sorties) : <b class="${trend.perMonth >= 0 ? 'up' : 'down'}">${trend.perMonth >= 0 ? '+' : ''}${trend.perMonth.toFixed(2)} km/h par mois</b><br>
            Extrapolation à 8 semaines : <b style="color:var(--txt)">${(pref.vma + trend.perMonth * 1.87).toFixed(1)} km/h</b></p>` : ''}
          <div class="tbl-wrap mt12"><table class="tbl">
            <tr><th>Distance</th><th>Temps prédit</th><th>Allure</th></tr>
            ${predictionTable(pref.refDistKm, pref.refTimeMin).slice(0, 4).map(p =>
              `<tr><td>${p.label}</td><td><b>${fmt.durSec(p.timeMin * 60)}</b></td><td>${fmt.pace(p.pace)}</td></tr>`).join('')}
          </table></div>` :
          `<p class="muted">Renseignez votre VMA (Profil ou Tests de terrain de l'onglet Analyse), ou ajoutez une sortie soutenue ≥ 3 km sur plat pour débloquer les prédictions.</p>`}
      </div>
    </div>

    ${!goal ? `<div class="card glow mt12">
      <h3>🎯 Définir un objectif</h3>
      <p class="muted">Distance, D+, temps visé : Xpertise génère un plan périodisé complet avec conseils nutrition course.</p>
      <button class="btn mt12" id="cta-goal">Créer mon plan</button>
    </div>` : ''}
  `;

  root.querySelector('#cta-goal')?.addEventListener('click', () => navigate('plan'));
}

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
}

function goalLabel(goal) {
  const s = SPORT[goal.sport]?.label || '';
  return `${s} ${goal.distanceKm} km${goal.elevGain ? ' / ' + goal.elevGain + ' m D+' : ''}`;
}

function volumeComment(thisW, lastW) {
  if (!lastW?.durationMin) return 'Continuez à enregistrer vos séances pour suivre la progression.';
  const pct = Math.round((thisW.durationMin - lastW.durationMin) / lastW.durationMin * 100);
  if (thisW.durationMin === 0) return 'Aucune séance cette semaine pour l\'instant.';
  if (pct > 25) return `⚠️ Volume en hausse de ${pct}% vs semaine passée — au-delà de la rampe sûre de +10 %, surveillez les signaux de fatigue.`;
  if (pct > 0) return `Volume en hausse de ${pct}% vs semaine passée — progression maîtrisée.`;
  return `Volume en baisse de ${Math.abs(pct)}% vs semaine passée.`;
}

function addDaysIso(iso, n) {
  const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
