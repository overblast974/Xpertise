// Helpers UI : échappement, modales, toasts, icônes sport.

export function esc(s) {
  return String(s ?? '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
}

export const SPORT = {
  run: { label: 'Course', ico: '🏃', cls: 'run' },
  trail: { label: 'Trail', ico: '⛰️', cls: 'trail' },
  bike: { label: 'Vélo', ico: '🚴', cls: 'bike' },
};

export function toast(msg, ms = 2600) {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, ms);
}

export function modal(html, { onClose } = {}) {
  const root = document.getElementById('modal-root');
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <button class="modal-close" aria-label="Fermer">✕</button>${html}</div>`;
  const close = () => { back.remove(); onClose?.(); };
  back.addEventListener('click', e => { if (e.target === back) close(); });
  back.querySelector('.modal-close').addEventListener('click', close);
  root.appendChild(back);
  return { el: back.querySelector('.modal'), close };
}

export function confirmDlg(msg, okLabel = 'Confirmer') {
  return new Promise(resolve => {
    const m = modal(`<h2>Confirmation</h2><p class="muted" style="font-size:14px">${esc(msg)}</p>
      <div class="row mt16" style="justify-content:flex-end">
        <button class="btn ghost" data-a="no">Annuler</button>
        <button class="btn danger" data-a="yes">${esc(okLabel)}</button>
      </div>`, { onClose: () => resolve(false) });
    m.el.querySelector('[data-a=no]').onclick = () => { m.close(); resolve(false); };
    m.el.querySelector('[data-a=yes]').onclick = () => { m.close(); resolve(true); };
  });
}

// ---------- Bulles explicatives ----------
// Dictionnaire des explications des métriques importantes (vulgarisation).
export const INFO = {
  ctl: {
    title: 'Fitness (CTL) — Charge chronique',
    body: `<p>La <b>CTL</b> (Chronic Training Load) est la moyenne pondérée de votre charge d'entraînement sur les <b>42 derniers jours</b>. C'est votre "capital forme" : plus elle est haute, plus votre organisme est habitué à encaisser du volume.</p>
    <p class="mt8">📈 <b>Comment la lire :</b> elle doit monter <b>progressivement</b> (+3 à +5 points/semaine max, jamais plus de 8). Une montée trop rapide = risque de blessure ou surentraînement, même si vous vous sentez bien sur le moment.</p>
    <p class="mt8">💡 Ordres de grandeur : &lt; 30 loisir, 40-70 coureur régulier, 80-110 compétiteur assidu, &gt; 120 niveau élite.</p>`,
  },
  atl: {
    title: 'Fatigue (ATL) — Charge aiguë',
    body: `<p>L'<b>ATL</b> (Acute Training Load) est la même moyenne mais sur <b>7 jours</b> seulement : elle reflète la fatigue fraîche accumulée cette semaine.</p>
    <p class="mt8">Elle monte vite après quelques grosses séances et redescend vite au repos. C'est normal qu'elle dépasse la CTL en phase de travail — c'est comme ça qu'on progresse — mais pas en permanence.</p>`,
  },
  tsb: {
    title: 'Forme (TSB) — Fraîcheur',
    body: `<p>Le <b>TSB</b> (Training Stress Balance) = CTL − ATL : votre capital forme moins votre fatigue fraîche. C'est l'indicateur n°1 à surveiller.</p>
    <p class="mt8">🔴 <b>&lt; −25 :</b> fatigue très élevée, zone de risque (blessure, maladie, surmenage). Levez le pied.<br>
    🟠 <b>−25 à −8 :</b> "en charge" — productif en phase d'entraînement, à ne pas prolonger plus de 2-3 semaines.<br>
    🟡 <b>−8 à +8 :</b> équilibre.<br>
    🟢 <b>+8 à +22 :</b> frais — la fenêtre idéale pour une course ou un test. C'est la cible de l'affûtage.<br>
    🔵 <b>&gt; +22 :</b> très frais… trop longtemps = désentraînement.</p>`,
  },
  acwr: {
    title: 'Ratio charge aiguë : chronique (ACWR)',
    body: `<p>Compare ce que vous avez fait <b>ces 7 derniers jours</b> à votre moyenne des <b>4 dernières semaines</b>. C'est le meilleur prédicteur simple du <b>risque de blessure</b> (études de Gabbett).</p>
    <p class="mt8">✅ <b>0,8 – 1,3 :</b> zone optimale, progression sûre.<br>
    ⚠️ <b>1,3 – 1,5 :</b> limite haute, vigilance sur les signaux (sommeil, douleurs, FC au réveil).<br>
    🛑 <b>&gt; 1,5 :</b> vous en faites beaucoup plus que d'habitude — risque de blessure multiplié par 2 à 4. Réduisez cette semaine.<br>
    💤 <b>&lt; 0,8 :</b> sous-charge — OK en récupération/affûtage, sinon vous perdez du fitness.</p>`,
  },
  monotony: {
    title: 'Monotonie (indice de Foster)',
    body: `<p>Mesure si vos journées d'entraînement se ressemblent trop : charge moyenne quotidienne ÷ variabilité sur 7 jours.</p>
    <p class="mt8">Un entraînement efficace alterne <b>jours durs et jours faciles</b>. Faire "moyen" tous les jours (monotonie &gt; 2) fatigue autant mais fait moins progresser, et augmente le risque de surmenage — même à volume identique.</p>
    <p class="mt8">✅ &lt; 1,5 : bonne alternance · ⚠️ &gt; 2 : trop uniforme · 🛑 &gt; 2,5 combiné à une grosse charge : signal d'alarme classique du surentraînement.</p>`,
  },
  polarization: {
    title: 'Polarisation — la règle 80/20',
    body: `<p>Part de votre temps d'entraînement passée en <b>basse intensité</b> (zones 1-2, conversation aisée) sur les 28 derniers jours.</p>
    <p class="mt8">Les études de Seiler sur les athlètes élites de tous les sports d'endurance convergent : <b>~80 % facile / 20 % dur</b> est la répartition qui fait le plus progresser.</p>
    <p class="mt8">⚠️ L'erreur n°1 du coureur amateur : courir trop souvent en <b>"zone grise"</b> (Z3, un peu dur mais pas vraiment) — ça fatigue beaucoup, ça fait peu progresser, et ça empêche de réussir les vraies séances dures.</p>`,
  },
  vma: {
    title: 'VMA estimée & VO2max',
    body: `<p>La <b>VMA</b> (Vitesse Maximale Aérobie) est la vitesse à partir de laquelle votre consommation d'oxygène plafonne. C'est LA référence pour calibrer les allures d'entraînement.</p>
    <p class="mt8">Ici elle est <b>estimée</b> depuis votre meilleure sortie soutenue récente (via le % de VMA soutenable selon la durée d'effort). Plus fiable : faites un vrai test de terrain (voir la section "Tests de terrain" de l'onglet Analyse).</p>
    <p class="mt8">🫁 Le <b>VO2max</b> s'en déduit : VO2max ≈ 3,5 × VMA (ml/min/kg). Ex : VMA 16 km/h ≈ 56 ml/min/kg.</p>`,
  },
  prediction: {
    title: 'Prédictions de temps (modèle de Riegel)',
    body: `<p>Formule utilisée par toutes les plateformes : <b>T2 = T1 × (D2/D1)<sup>1,06</sup></b> — votre temps sur une distance permet de prédire les autres, avec un ralentissement naturel de ~6 % à chaque doublement de distance.</p>
    <p class="mt8">⚠️ <b>Conditions de validité :</b> la prédiction suppose un entraînement adapté à la distance visée (on ne tient pas un marathon sur une prédiction de 10 km sans les sorties longues qui vont avec !), un terrain comparable et une bonne stratégie d'allure.</p>
    <p class="mt8">⛰️ En trail, ajoutez le surcoût du D+ : comptez 3 à 6 min par 100 m de D+ selon votre niveau.</p>`,
  },
  trend: {
    title: 'Tendance & extrapolation de progression',
    body: `<p>Régression linéaire sur la VMA estimée de vos sorties des <b>90 derniers jours</b> : elle indique si vous progressez, stagnez ou régressez, et extrapole où vous serez dans 8 semaines <b>si la tendance se poursuit</b>.</p>
    <p class="mt8">⚠️ À prendre avec recul : la progression n'est jamais linéaire très longtemps (elle plafonne), et l'estimation dépend de la qualité des données (sorties variées, terrain plat, efforts francs). Plus vous avez de séances, plus c'est fiable.</p>`,
  },
  weekload: {
    title: 'Charge hebdomadaire (TRIMP)',
    body: `<p>Chaque séance génère une <b>charge</b> = durée × intensité (calculée depuis votre FC moyenne — méthode TRIMP de Banister — ou depuis votre RPE si pas de cardio).</p>
    <p class="mt8">Une séance facile d'1 h ≈ 50-80 points, une séance seuil d'1 h ≈ 120-160, une course à fond ≈ 200+. La règle d'or : n'augmentez pas le total hebdo de plus de <b>~10 % par semaine</b>, et placez une semaine allégée (−30-45 %) toutes les 3-4 semaines.</p>`,
  },
  zones: {
    title: 'Zones d\'entraînement personnalisées',
    body: `<p>Calculées depuis <b>votre</b> FCmax, VMA et FTP (onglet Profil). Chaque zone cible une adaptation physiologique différente : ne pas les mélanger, c'est tout l'art de l'entraînement.</p>
    <p class="mt8">L'essentiel : <b>Z1-Z2</b> = le socle (80 % du temps), <b>Z4</b> = le seuil (tempo contrôlé), <b>Z5</b> = la VMA/PMA (fractions courtes). La Z3 est utile en trail/vélo mais piégeuse en course sur route (zone grise).</p>`,
  },
  dplus: {
    title: 'D+ hebdomadaire (trail)',
    body: `<p>En trail, le dénivelé est un volume d'entraînement à part entière. En phase spécifique, visez un <b>D+ hebdomadaire proche du D+ de votre course</b> (80-110 %).</p>
    <p class="mt8">Le D+ importé est lissé (seuil de 3 m) pour éliminer le bruit du GPS/baromètre — il peut différer légèrement de Garmin qui applique son propre lissage.</p>`,
  },
};

export function infoBtn(key) {
  return INFO[key] ? `<button class="info-btn" data-info="${key}" aria-label="Explication" type="button">i</button>` : '';
}

// délégation globale : un seul listener pour toutes les bulles
document.addEventListener('click', e => {
  const b = e.target.closest('.info-btn');
  if (!b) return;
  e.stopPropagation();
  const info = INFO[b.dataset.info];
  if (info) modal(`<h2>💡 ${info.title}</h2><div class="muted" style="font-size:14px;line-height:1.6">${info.body}</div>`);
});

// Segment control : renvoie une fonction get() de la valeur active
export function bindSeg(container, onChange) {
  const btns = [...container.querySelectorAll('button')];
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.toggle('on', x === b));
    onChange?.(b.dataset.v);
  }));
  return () => container.querySelector('button.on')?.dataset.v;
}
