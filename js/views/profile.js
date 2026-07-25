// Écran profil : données athlète, sauvegarde/restauration, installation PWA.
import { db } from '../db.js';
import { esc, toast, confirmDlg } from '../ui.js';

export function renderProfile(root) {
  const { profile, workouts } = db.get();

  root.innerHTML = `
    <div class="section-title" style="margin-top:4px">Mon profil</div>
    <div class="card">
      <form class="form" id="prof-form">
        <label class="f">Prénom<input name="name" value="${esc(profile.name || '')}" placeholder="optionnel"></label>
        <div class="f-row">
          <label class="f">Poids (kg)<input type="number" name="weightKg" step="0.5" min="30" max="150" value="${profile.weightKg || ''}" required></label>
          <label class="f">Année de naissance<input type="number" name="birthYear" min="1930" max="2015" value="${profile.birthYear || ''}" placeholder="1997"></label>
        </div>
        <div class="f-row">
          <label class="f">FC max (bpm)<input type="number" name="hrMax" min="120" max="230" value="${profile.hrMax || ''}" required></label>
          <label class="f">FC repos (bpm)<input type="number" name="hrRest" min="30" max="100" value="${profile.hrRest || ''}" required></label>
        </div>
        <div class="f-row">
          <label class="f">VMA (km/h) — si connue<input type="number" name="vma" step="0.1" min="8" max="26" value="${profile.vma || ''}" placeholder="test demi-Cooper"></label>
          <label class="f">FTP vélo (W) — si connue<input type="number" name="ftp" min="80" max="500" value="${profile.ftp || ''}" placeholder="test 20 min × 0,95"></label>
        </div>
        <label class="f">Heures d'entraînement dispo / semaine<input type="number" name="weeklyHours" step="0.5" min="2" max="25" value="${profile.weeklyHours || 6}"></label>
        <button class="btn" type="submit">Enregistrer</button>
      </form>
    </div>

    <div class="card mt12" id="install-card" style="display:none">
      <h3>📲 Installer l'application</h3>
      <p class="muted">Installez Xpertise sur votre écran d'accueil : plein écran, hors-ligne, comme une app native.</p>
      <button class="btn mt12" id="btn-install">Installer sur mon téléphone</button>
    </div>

    <div class="section-title">Mes données</div>
    <div class="card">
      <p class="muted">${workouts.length} séance${workouts.length > 1 ? 's' : ''} enregistrée${workouts.length > 1 ? 's' : ''} — tout est stocké <b>localement sur votre appareil</b> (rien ne part sur un serveur).</p>
      <div class="row mt12">
        <button class="btn ghost sm" id="btn-export">⬇ Exporter (sauvegarde JSON)</button>
        <label class="btn ghost sm" style="display:inline-flex;align-items:center;cursor:pointer">⬆ Restaurer<input type="file" id="btn-import" accept=".json" hidden></label>
        <button class="btn danger sm" id="btn-reset">Tout effacer</button>
      </div>
    </div>

    <div class="card mt12">
      <h3>À propos</h3>
      <p class="muted">Xpertise — coach endurance course / trail / vélo.<br>
      Modèles : TRIMP (Banister), CTL·ATL·TSB (Coggan), Riegel, 80/20 (Seiler), zones Daniels/Coggan.<br>
      Nutrition : recommandations Jeukendrup / Burke (glucides multi-transportables, hydratation, sodium).<br>
      <b>Les conseils fournis sont indicatifs et ne remplacent pas un avis médical.</b></p>
    </div>
  `;

  root.querySelector('#prof-form').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const num = k => { const v = fd.get(k); return v === '' || v == null ? null : +v; };
    db.setProfile({
      name: fd.get('name')?.trim() || '',
      weightKg: num('weightKg'),
      birthYear: num('birthYear'),
      hrMax: num('hrMax'),
      hrRest: num('hrRest'),
      vma: num('vma'),
      ftp: num('ftp'),
      weeklyHours: num('weeklyHours'),
    });
    toast('Profil enregistré ✔');
    window.dispatchEvent(new Event('xp:refresh'));
  });

  // installation PWA
  const card = root.querySelector('#install-card');
  if (window.xpInstallPrompt) card.style.display = '';
  root.querySelector('#btn-install').onclick = async () => {
    if (!window.xpInstallPrompt) return;
    window.xpInstallPrompt.prompt();
    const { outcome } = await window.xpInstallPrompt.userChoice;
    if (outcome === 'accepted') { toast('Application installée 🎉'); card.style.display = 'none'; window.xpInstallPrompt = null; }
  };

  root.querySelector('#btn-export').onclick = () => {
    const blob = new Blob([db.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `xpertise-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  root.querySelector('#btn-import').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      db.importJson(await file.text());
      toast('Données restaurées ✔');
      window.dispatchEvent(new Event('xp:refresh'));
    } catch (err) { toast('Erreur : ' + err.message); }
  });
  root.querySelector('#btn-reset').onclick = async () => {
    if (await confirmDlg('Effacer TOUTES les données (séances, plan, profil) ? Cette action est irréversible.', 'Tout effacer')) {
      db.reset();
      toast('Données effacées');
      window.dispatchEvent(new Event('xp:refresh'));
    }
  };
}
