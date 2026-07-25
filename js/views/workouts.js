// Écran séances : liste, saisie manuelle, import Garmin (FIT/TCX/GPX), détail.
import { db } from '../db.js';
import { fmt, workoutLoad, todayIso } from '../metrics.js';
import { parseActivityFile } from '../parser.js';
import { sparkline } from '../charts.js';
import { esc, SPORT, modal, toast, confirmDlg, bindSeg } from '../ui.js';

export function renderWorkouts(root) {
  const { workouts, profile } = db.get();

  root.innerHTML = `
    <div class="row spread">
      <div class="section-title" style="margin-top:4px">Mes séances</div>
      <div class="row">
        <button class="btn sm ghost" id="btn-import">⌚ Import Garmin</button>
        <button class="btn sm" id="btn-add">＋ Ajouter</button>
      </div>
    </div>
    <div class="seg mt8" id="filter-seg" style="max-width:420px">
      <button data-v="all" class="on">Tout</button>
      <button data-v="run">🏃 Course</button>
      <button data-v="trail">⛰️ Trail</button>
      <button data-v="bike">🚴 Vélo</button>
    </div>
    <div class="grid mt12" id="wo-list"></div>
  `;

  const list = root.querySelector('#wo-list');
  const renderList = (filter = 'all') => {
    const items = workouts.filter(w => filter === 'all' || w.sport === filter);
    if (!items.length) {
      list.innerHTML = `<div class="empty"><span class="big">🏃</span>Aucune séance${filter !== 'all' ? ' dans cette catégorie' : ''}.<br>Ajoutez-en une à la main ou importez un fichier Garmin (FIT/TCX/GPX).</div>`;
      return;
    }
    let lastMonth = '';
    list.innerHTML = items.map(w => {
      const month = w.date.slice(0, 7);
      const header = month !== lastMonth
        ? `<div class="muted" style="font-weight:800;text-transform:capitalize;margin:8px 2px 0">${new Date(w.date + 'T12:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>`
        : '';
      lastMonth = month;
      const sp = SPORT[w.sport] || SPORT.run;
      return `${header}
      <div class="wo-item" data-id="${w.id}">
        <div class="wo-ico ${sp.cls}">${sp.ico}</div>
        <div class="wo-main">
          <div class="wo-title">${esc(w.title || sp.label)}${w.isRace ? ' 🏁' : ''}</div>
          <div class="wo-meta">${fmt.date(w.date)} · ${fmt.dur(w.durationMin)}${w.avgHr ? ' · ♥ ' + w.avgHr : ''}${w.rpe ? ' · RPE ' + w.rpe : ''}${w.source === 'garmin' ? ' · ⌚' : ''}</div>
        </div>
        <div class="wo-right">
          <b>${w.distanceKm ? fmt.km(w.distanceKm) : fmt.dur(w.durationMin)}</b>
          ${w.elevGain ? w.elevGain + ' m D+' : (w.distanceKm && w.durationMin ? paceOrSpeed(w) : '')}
        </div>
      </div>`;
    }).join('');
    list.querySelectorAll('.wo-item').forEach(el =>
      el.addEventListener('click', () => openWorkoutDetail(el.dataset.id)));
  };
  renderList();
  bindSeg(root.querySelector('#filter-seg'), v => renderList(v));

  root.querySelector('#btn-add').onclick = () => openWorkoutForm();
  root.querySelector('#btn-import').onclick = () => openImport();
}

function paceOrSpeed(w) {
  return w.sport === 'bike'
    ? fmt.speed(w.distanceKm / (w.durationMin / 60))
    : fmt.pace(w.durationMin / w.distanceKm);
}

// ---------- Formulaire manuel ----------
export function openWorkoutForm(existing = null) {
  const w = existing || { sport: 'run', date: todayIso() };
  const m = modal(`
    <h2>${existing ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
    <form class="form" id="wo-form">
      <div class="seg" id="sport-seg">
        <button type="button" data-v="run" class="${w.sport === 'run' ? 'on' : ''}">🏃 Course</button>
        <button type="button" data-v="trail" class="${w.sport === 'trail' ? 'on' : ''}">⛰️ Trail</button>
        <button type="button" data-v="bike" class="${w.sport === 'bike' ? 'on' : ''}">🚴 Vélo</button>
      </div>
      <label class="f">Titre<input name="title" value="${esc(w.title || '')}" placeholder="ex : Sortie longue vallonée"></label>
      <div class="f-row">
        <label class="f">Date<input type="date" name="date" required value="${w.date}" max="${todayIso()}"></label>
        <label class="f">Durée (min)<input type="number" name="durationMin" required min="1" max="1500" value="${w.durationMin || ''}" placeholder="60"></label>
      </div>
      <div class="f-row">
        <label class="f">Distance (km)<input type="number" name="distanceKm" step="0.1" min="0" value="${w.distanceKm ?? ''}" placeholder="10"></label>
        <label class="f">D+ (m)<input type="number" name="elevGain" min="0" value="${w.elevGain ?? ''}" placeholder="0"></label>
      </div>
      <div class="f-row">
        <label class="f">FC moyenne (bpm)<input type="number" name="avgHr" min="60" max="220" value="${w.avgHr ?? ''}" placeholder="optionnel"></label>
        <label class="f">Effort ressenti RPE (1-10)<input type="number" name="rpe" min="1" max="10" value="${w.rpe ?? ''}" placeholder="optionnel"></label>
      </div>
      <label class="f" style="flex-direction:row;display:flex;align-items:center;gap:8px">
        <input type="checkbox" name="isRace" style="width:auto" ${w.isRace ? 'checked' : ''}> Compétition / course officielle
      </label>
      <label class="f">Notes<textarea name="notes" rows="2" placeholder="sensations, météo…">${esc(w.notes || '')}</textarea></label>
      <button class="btn" type="submit">${existing ? 'Enregistrer' : 'Ajouter la séance'}</button>
    </form>
  `);
  const getSport = bindSeg(m.el.querySelector('#sport-seg'));
  m.el.querySelector('#wo-form').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const num = k => { const v = fd.get(k); return v === '' || v == null ? null : +v; };
    const wo = {
      sport: getSport() || 'run',
      title: fd.get('title')?.trim() || null,
      date: fd.get('date'),
      durationMin: num('durationMin'),
      distanceKm: num('distanceKm'),
      elevGain: num('elevGain'),
      avgHr: num('avgHr'),
      rpe: num('rpe'),
      isRace: fd.get('isRace') === 'on',
      notes: fd.get('notes')?.trim() || null,
      source: existing?.source || 'manual',
    };
    if (existing) { db.updateWorkout(existing.id, wo); toast('Séance modifiée ✔'); }
    else { db.addWorkout(wo); toast('Séance ajoutée ✔'); }
    m.close();
    window.dispatchEvent(new Event('xp:refresh'));
  });
}

// ---------- Import Garmin ----------
function openImport() {
  const m = modal(`
    <h2>⌚ Import Garmin</h2>
    <p class="muted">Depuis Garmin Connect : ouvrez l'activité → ⚙️ → <b>Exporter l'original (FIT)</b>, <b>TCX</b> ou <b>GPX</b> — les trois formats sont acceptés. Vous pouvez sélectionner plusieurs fichiers (le .zip Garmin doit être décompressé d'abord).</p>
    <label class="f mt12">Fichiers FIT / TCX / GPX
      <input type="file" id="imp-file" accept=".gpx,.tcx,.fit" multiple>
    </label>
    <div id="imp-out" class="grid mt12"></div>
  `);
  m.el.querySelector('#imp-file').addEventListener('change', async e => {
    const out = m.el.querySelector('#imp-out');
    out.innerHTML = '<p class="muted">Analyse des fichiers…</p>';
    const imported = [], skipped = [], failed = [];
    for (const file of e.target.files) {
      try {
        const parsed = await parseActivityFile(file);
        const dup = db.get().workouts.find(w => w.date === parsed.date && Math.abs((w.durationMin || 0) - parsed.durationMin) < 2 && Math.abs((w.distanceKm || 0) - parsed.distanceKm) < 0.3);
        if (dup) { skipped.push({ file: file.name, parsed }); continue; }
        db.addWorkout(parsed);
        imported.push(parsed);
      } catch (err) {
        failed.push({ file: file.name, message: err.message });
      }
    }
    m.close();
    openImportResult(imported, skipped, failed);
    if (imported.length) window.dispatchEvent(new Event('xp:refresh'));
  });
}

// Fenêtre de validation après import : confirme ce qui a été enregistré
function openImportResult(imported, skipped, failed) {
  const ok = imported.length > 0;
  const allOk = ok && !skipped.length && !failed.length;
  const title = allOk
    ? (imported.length > 1 ? `✅ ${imported.length} séances importées avec succès` : '✅ Séance importée avec succès')
    : ok ? '✅ Import terminé' : failed.length ? '❌ Import impossible' : '⚠️ Rien à importer';

  const woLine = w => {
    const sp = SPORT[w.sport] || SPORT.run;
    return `<div class="wo-item" style="cursor:default">
      <div class="wo-ico ${sp.cls}">${sp.ico}</div>
      <div class="wo-main">
        <div class="wo-title">${esc(w.title)}</div>
        <div class="wo-meta">${sp.label} · ${fmt.date(w.date)}${w.avgHr ? ' · ♥ ' + w.avgHr + ' bpm' : ''}</div>
      </div>
      <div class="wo-right"><b>${fmt.km(w.distanceKm)}</b>${fmt.dur(w.durationMin)}${w.elevGain ? ' · ' + w.elevGain + ' m D+' : ''}</div>
    </div>`;
  };

  const m = modal(`
    <h2>${title}</h2>
    ${ok ? `<p class="muted">Les données suivantes ont été enregistrées et sont prises en compte dans votre suivi (charge, forme, prédictions) :</p>
      <div class="grid mt12">${imported.map(woLine).join('')}</div>` : ''}
    ${skipped.length ? `<div class="grid mt12">${skipped.map(s =>
      `<div class="advice warn"><span class="a-ico">⚠️</span><span><b>${esc(s.file)}</b> : doublon ignoré — une séance quasi identique existe déjà le ${fmt.date(s.parsed.date)}.</span></div>`).join('')}</div>` : ''}
    ${failed.length ? `<div class="grid mt12">${failed.map(f =>
      `<div class="advice bad"><span class="a-ico">🛑</span><span><b>${esc(f.file)}</b> : ${esc(f.message)}</span></div>`).join('')}</div>` : ''}
    <div class="row mt16" style="justify-content:flex-end">
      ${failed.length || skipped.length ? '<button class="btn ghost sm" data-a="retry">Réessayer</button>' : ''}
      <button class="btn" data-a="ok">${ok ? 'Parfait 👍' : 'Fermer'}</button>
    </div>
  `);
  m.el.querySelector('[data-a=ok]').onclick = () => m.close();
  m.el.querySelector('[data-a=retry]')?.addEventListener('click', () => { m.close(); openImport(); });
}

// ---------- Détail ----------
function openWorkoutDetail(id) {
  const { workouts, profile } = db.get();
  const w = workouts.find(x => x.id === id);
  if (!w) return;
  const sp = SPORT[w.sport] || SPORT.run;
  const load = workoutLoad(w, profile);
  const m = modal(`
    <h2>${sp.ico} ${esc(w.title || sp.label)}${w.isRace ? ' 🏁' : ''}</h2>
    <div class="row">
      <span class="badge ${sp.cls}">${sp.label}</span>
      <span class="badge">${fmt.date(w.date)}</span>
      ${w.source === 'garmin' ? '<span class="badge">⌚ Garmin</span>' : ''}
    </div>
    <div class="cards-3 mt16">
      <div class="stat"><span class="l">Durée</span><span class="v" style="font-size:20px">${fmt.dur(w.durationMin)}</span></div>
      <div class="stat"><span class="l">Distance</span><span class="v" style="font-size:20px">${w.distanceKm ? fmt.km(w.distanceKm) : '—'}</span></div>
      <div class="stat"><span class="l">D+</span><span class="v" style="font-size:20px">${w.elevGain ? w.elevGain + ' m' : '—'}</span></div>
      <div class="stat"><span class="l">${w.sport === 'bike' ? 'Vitesse' : 'Allure'}</span><span class="v" style="font-size:20px">${w.distanceKm && w.durationMin ? (w.sport === 'bike' ? fmt.speed(w.distanceKm / (w.durationMin / 60)) : fmt.pace(w.durationMin / w.distanceKm)) : '—'}</span></div>
      <div class="stat"><span class="l">FC moy</span><span class="v" style="font-size:20px">${w.avgHr ? w.avgHr + ' <small>bpm</small>' : '—'}</span></div>
      <div class="stat"><span class="l">Charge</span><span class="v" style="font-size:20px">${load}</span></div>
    </div>
    ${w.series?.hr ? `<h3 class="mt16" style="font-size:12px;color:var(--txt-2);text-transform:uppercase">Fréquence cardiaque</h3><div class="chart-wrap">${sparkline(w.series.hr, { width: 560, height: 70, color: '#ff6b4a' })}</div>` : ''}
    ${w.series?.elev ? `<h3 class="mt8" style="font-size:12px;color:var(--txt-2);text-transform:uppercase">Profil altimétrique</h3><div class="chart-wrap">${sparkline(w.series.elev, { width: 560, height: 70, color: '#a3e635' })}</div>` : ''}
    ${w.notes ? `<p class="muted mt12">📝 ${esc(w.notes)}</p>` : ''}
    <div class="row mt16" style="justify-content:flex-end">
      <button class="btn ghost sm" data-a="edit">Modifier</button>
      <button class="btn danger sm" data-a="del">Supprimer</button>
    </div>
  `);
  m.el.querySelector('[data-a=edit]').onclick = () => { m.close(); openWorkoutForm(w); };
  m.el.querySelector('[data-a=del]').onclick = async () => {
    if (await confirmDlg('Supprimer définitivement cette séance ?', 'Supprimer')) {
      db.deleteWorkout(id);
      toast('Séance supprimée');
      m.close();
      window.dispatchEvent(new Event('xp:refresh'));
    }
  };
}
