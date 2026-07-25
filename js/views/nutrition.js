// Écran nutrition : calculateur pendant-effort, timeline, jour de course, récupération.
import { db } from '../db.js';
import { NUTRI } from '../knowledge/nutrition.js';
import { computeNutrition, recoveryAdvice, racedayAdvice } from '../nutrition.js';
import { nutritionAdvice } from '../advice.js';
import { fmt, daysBetween, todayIso } from '../metrics.js';
import { esc, bindSeg } from '../ui.js';

let lastParams = null;

export function renderNutrition(root) {
  const { profile, goal } = db.get();
  const p = lastParams || {
    durationH: goal?.targetTimeMin ? +(goal.targetTimeMin / 60).toFixed(1) : 2,
    intensity: 'moderate',
    tempC: 20,
    sport: goal?.sport || 'run',
  };

  root.innerHTML = `
    <div class="section-title" style="margin-top:4px">Nutrition d'effort</div>
    <div class="card glow">
      <h3>Mon effort</h3>
      <div class="form">
        <div class="seg" id="n-sport">
          <button type="button" data-v="run" class="${p.sport === 'run' ? 'on' : ''}">🏃 Route</button>
          <button type="button" data-v="trail" class="${p.sport === 'trail' ? 'on' : ''}">⛰️ Trail</button>
          <button type="button" data-v="bike" class="${p.sport === 'bike' ? 'on' : ''}">🚴 Vélo</button>
        </div>
        <div class="f-row-3">
          <label class="f">Durée (h)<input type="number" id="n-dur" step="0.5" min="0.5" max="30" value="${p.durationH}"></label>
          <label class="f">Température (°C)<input type="number" id="n-temp" min="-10" max="45" value="${p.tempC}"></label>
          <label class="f">Intensité<select id="n-int">
            <option value="low" ${p.intensity === 'low' ? 'selected' : ''}>Facile</option>
            <option value="moderate" ${p.intensity === 'moderate' ? 'selected' : ''}>Modérée</option>
            <option value="high" ${p.intensity === 'high' ? 'selected' : ''}>Compétition</option>
          </select></label>
        </div>
        <button class="btn" id="n-go">Calculer mon plan nutrition</button>
      </div>
    </div>
    <div id="n-result" class="mt12"></div>
  `;

  const getSport = bindSeg(root.querySelector('#n-sport'));
  const run = () => {
    const params = {
      durationH: +root.querySelector('#n-dur').value || 2,
      tempC: +root.querySelector('#n-temp').value || 20,
      intensity: root.querySelector('#n-int').value,
      sport: getSport() || 'run',
      weightKg: profile.weightKg || 70,
    };
    lastParams = params;
    renderResult(root.querySelector('#n-result'), params, profile, goal);
  };
  root.querySelector('#n-go').onclick = run;
  run(); // calcul immédiat avec les valeurs par défaut
}

function renderResult(el, params, profile, goal) {
  const r = computeNutrition(params);
  const advice = nutritionAdvice({
    ...params,
    targetCarbs: r.carbsPerH,
    daysToEvent: goal?.date ? daysBetween(todayIso(), goal.date) : 999,
    isRaceDay: params.intensity === 'high',
  }, 6);
  const rec = recoveryAdvice(params.weightKg);
  const race = racedayAdvice(params.weightKg);

  el.innerHTML = `
    <div class="cards-3">
      <div class="card"><div class="stat">
        <span class="l">Glucides</span>
        <span class="nutri-num">${r.carbsPerH}<span style="font-size:14px"> g/h</span></span>
        <span class="d flat">≈ ${r.totalCarbs} g au total</span>
      </div></div>
      <div class="card"><div class="stat">
        <span class="l">Hydratation · ${esc(r.tempLabel)}</span>
        <span class="nutri-num">${r.fluidMin}–${r.fluidMax}<span style="font-size:14px"> ml/h</span></span>
        <span class="d flat">≈ ${(r.totalFluid / 1000).toFixed(1)} L au total</span>
      </div></div>
      <div class="card"><div class="stat">
        <span class="l">Sodium</span>
        <span class="nutri-num">${r.sodiumPerH ? r.sodiumPerH.min + '–' + r.sodiumPerH.max : '—'}<span style="font-size:14px">${r.sodiumPerH ? ' mg/h' : ''}</span></span>
        <span class="d flat">${r.sodiumPerH ? 'indispensable > 2 h' : 'inutile < 2 h d\'effort'}</span>
      </div></div>
    </div>

    <div class="card mt12">
      <h3>Stratégie glucides</h3>
      <p class="muted">${esc(r.carbsNote)}</p>
      ${r.needRatio ? `<p class="muted mt8">🧪 Au-delà de 60 g/h, mélange <b style="color:var(--txt)">glucose:fructose ${esc(r.ratio)}</b> obligatoire (double transporteur intestinal).</p>` : ''}
      ${r.gutTraining ? `<div class="advice warn mt8"><span class="a-ico">🦠</span><span>${esc(r.gutTraining)}</span></div>` : ''}
    </div>

    ${r.hourlyPlan ? `<div class="card mt12">
      <h3>Exemple de ravitaillement / heure <span class="badge accent">${r.hourlyPlan.totalCarbs} g</span></h3>
      <div class="grid" style="gap:8px">
        ${r.hourlyPlan.combo.map(c => `<div class="row spread" style="border-bottom:1px solid var(--line);padding-bottom:8px">
          <span>${c.qty > 1 ? c.qty + ' × ' : ''}<b>${esc(c.item.label)}</b>${c.note ? ' <span class="muted small">(' + esc(c.note) + ')</span>' : ''}</span>
          <span class="badge">${c.item.carbsG * c.qty} g</span>
        </div>`).join('')}
      </div>
      <p class="muted small mt8">${esc(r.hourlyPlan.note || '')}</p>
    </div>` : ''}

    ${r.timeline ? `<div class="card mt12">
      <h3>Timeline · ${esc(r.timeline.label)}</h3>
      <div class="timeline mt8">
        ${(r.timeline.timeline || []).map(t => `<div class="tl-item">
          <div class="tl-when">${esc(t.when || t.time || '')}</div>
          <div class="tl-what">${esc(t.what || t.action || '')}</div>
        </div>`).join('')}
      </div>
      ${!r.timeline.timeline?.length ? `
        <p class="muted"><b>Avant :</b> ${esc(r.timeline.before || '')}</p>
        <p class="muted mt8"><b>Pendant :</b> ${esc(r.timeline.during || '')}</p>
        <p class="muted mt8"><b>Après :</b> ${esc(r.timeline.after || '')}</p>` : ''}
    </div>` : ''}

    ${r.caffeine ? `<div class="card mt12">
      <h3>☕ Caféine (${profile.weightKg || 70} kg)</h3>
      <p class="muted">Dose efficace : <b style="color:var(--txt)">${r.caffeine.doseMg} mg</b> (3 mg/kg) 45-60 min avant l'effort — max ${r.caffeine.maxMg} mg/24 h.</p>
      ${r.caffeine.redose ? `<p class="muted mt8">${esc(r.caffeine.redose)}</p>` : ''}
      <p class="muted small mt8">${esc(NUTRI.caffeine.warning || '')}</p>
    </div>` : ''}

    ${advice.length ? `<div class="section-title">Conseils du nutritionniste</div>
    <div class="grid">${advice.map(a => `<div class="advice"><span class="a-ico">💡</span><span>${esc(a.message)}</span></div>`).join('')}</div>` : ''}

    ${params.durationH >= 1.5 ? `<div class="section-title">Jour de course</div>
    <div class="cards-2">
      <div class="card">
        <h3>Charge glucidique J-3 → J-1</h3>
        <p class="muted">${esc(race.carbLoad?.displayText || race.carbLoad?.textFr || 'Augmentez les glucides à 8-12 g/kg/jour les 2-3 jours précédents.')}</p>
        <p class="mt8"><span class="badge accent">${esc(race.carbLoadTotal)}</span></p>
      </div>
      <div class="card">
        <h3>Petit-déjeuner d'avant course</h3>
        <p class="muted">${esc(race.breakfast?.displayText || '')}</p>
        <p class="mt8"><span class="badge accent">${esc(race.breakfastG)}</span></p>
      </div>
    </div>
    ${race.mistakes?.length ? `<div class="card mt12"><h3>🚫 Erreurs classiques</h3>
      <ul style="padding-left:18px;display:grid;gap:6px" class="muted">${race.mistakes.slice(0, 6).map(e => `<li>${esc(typeof e === 'string' ? e : e.textFr || e.text || '')}</li>`).join('')}</ul>
    </div>` : ''}` : ''}

    <div class="section-title">Récupération</div>
    <div class="card">
      <p class="muted">${esc(rec.window || '')}</p>
      <p class="muted mt8">🍚 ${esc(rec.carbs || '')} <span class="badge accent">≈ ${rec.carbsG} g/h pour vous</span></p>
      <p class="muted mt8">🥛 ${esc(rec.protein || '')}</p>
      <p class="muted mt8">💧 ${esc(rec.rehydration || '')}</p>
      ${rec.examples?.length ? `<p class="mt12" style="font-weight:700;font-size:13px">Exemples concrets :</p>
      <ul style="padding-left:18px;display:grid;gap:5px" class="muted mt8">${rec.examples.slice(0, 4).map(e => `<li>${esc(typeof e === 'string' ? e : e.textFr || e.text || '')}</li>`).join('')}</ul>` : ''}
    </div>
    <p class="muted small mt12">${esc(NUTRI.meta?.disclaimer || '')}</p>
  `;
}
