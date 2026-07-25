// Routeur principal + navigation + rafraîchissement global.
import { db } from './db.js';
import { renderDashboard } from './views/dashboard.js';
import { renderWorkouts, openWorkoutForm } from './views/workouts.js';
import { renderAnalysis } from './views/analysis.js';
import { renderPlan } from './views/plan.js';
import { renderNutrition } from './views/nutrition.js';
import { renderProfile } from './views/profile.js';

const routes = {
  dashboard: { render: renderDashboard, sub: 'Coach endurance' },
  workouts: { render: renderWorkouts, sub: 'Mes séances' },
  analysis: { render: renderAnalysis, sub: 'Analyse & perf' },
  plan: { render: renderPlan, sub: 'Plan d\'entraînement' },
  nutrition: { render: renderNutrition, sub: 'Nutrition d\'effort' },
  profile: { render: renderProfile, sub: 'Profil & données' },
};

let current = 'dashboard';
const view = document.getElementById('view');

export function navigate(route) {
  if (!routes[route]) route = 'dashboard';
  current = route;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.route === route));
  document.getElementById('topbar-sub').textContent = routes[route].sub;
  view.classList.remove('view'); // relance l'animation d'entrée
  void view.offsetWidth;
  view.classList.add('view');
  view.innerHTML = '';
  routes[route].render(view, navigate);
  view.scrollTop = 0;
  window.scrollTo({ top: 0 });
  if (location.hash !== '#' + route) history.replaceState(null, '', '#' + route);
}

document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', () => navigate(t.dataset.route)));

document.getElementById('btn-add-quick').addEventListener('click', () => openWorkoutForm());

// re-render de la vue courante quand les données changent
window.addEventListener('xp:refresh', () => navigate(current));

// capture du prompt d'installation PWA
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.xpInstallPrompt = e;
});

// démarrage
navigate(location.hash?.slice(1) || 'dashboard');
