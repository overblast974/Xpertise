# Xpertise — Coach Endurance 🏃⛰️🚴

PWA installable de suivi d'entraînement **course à pied / trail / vélo** : analyse de charge scientifique, extrapolation de performance, plans d'entraînement personnalisés et nutrition d'effort.

100 % autonome : aucun build, aucune dépendance, aucun serveur — toutes les données restent sur votre appareil (localStorage), l'app fonctionne entièrement hors-ligne une fois installée.

## ✨ Fonctionnalités

### 📊 Dashboard
- État de forme du jour : **CTL** (fitness), **ATL** (fatigue), **TSB** (fraîcheur) avec jauge et interprétation
- Courbe de forme sur 90 jours, volume hebdomadaire, répartition par sport
- **Conseils du coach** générés par un moteur de règles (surcharge, ratio charge aiguë:chronique, monotonie de Foster, polarisation 80/20…)
- Prochaine séance du plan, compte à rebours objectif

### ⏱ Séances
- **Saisie manuelle** : sport, durée, distance, D+, FC moyenne, RPE, compétition
- **Import Garmin** : fichiers **FIT / TCX / GPX** exportés de Garmin Connect (FIT natif décodé en pur JS ; durée, distance, D+ lissé, FC et profil altimétrique extraits automatiquement, détection des doublons)

### 📈 Analyse & extrapolation de perf
- Charge TRIMP (Banister) ou session-RPE (Foster) hebdomadaire
- Ratio charge aiguë:chronique, monotonie, polarisation 80/20
- **VMA estimée** depuis vos sorties + tendance de progression sur 90 j et projection à 8 semaines
- Table de prédictions **5 km → 50 km** (modèle de Riegel), correction D+ pour le trail
- Zones personnalisées : cardio (%FCmax), allure (%VMA), puissance (%FTP) + grilles de niveau

### 🎯 Plan d'entraînement sur objectif
- Objectif : sport, **distance, D+, temps visé**, date, volume dispo
- Périodisation **base → développement → spécifique → affûtage**, semaines de décharge 1/4, sortie longue progressive plafonnée, cible de D+ hebdo pour le trail
- Bibliothèque de 21 types de séances détaillées (VMA, seuil, tempo, côtes, D+, sweet spot, PMA…)
- Temps de course extrapolé de vos données, cases à cocher de suivi

### 🥤 Nutrition d'effort
- Calcul selon durée, intensité, température et poids : **glucides g/h** (jusqu'à 90-120 g/h glucose:fructose), **hydratation ml/h**, **sodium mg/h**, **caféine mg**
- Exemple de ravitaillement heure par heure (gels, boisson, solide), timeline avant/pendant/après
- Jour de course : charge glucidique J-3→J-1, petit-déjeuner, erreurs classiques, récupération

Les bases de connaissances (`js/knowledge/`) s'appuient sur la littérature scientifique : Seiler (80/20), Coggan (CTL/ATL/TSB, zones puissance), Daniels/Billat (VMA), Riegel, Foster (monotonie), Jeukendrup/Burke (nutrition).

## 📲 Installation sur téléphone (Z Fold 4 & co)

1. Hébergez le dossier tel quel (GitHub Pages, Netlify, ou `python3 -m http.server`) — **HTTPS requis** pour l'installation.
2. Ouvrez l'URL dans Chrome → menu ⋮ → **« Ajouter à l'écran d'accueil » / « Installer l'application »** (ou bouton *Installer* dans l'onglet Profil).
3. L'app s'ouvre en plein écran et fonctionne hors-ligne. L'interface est optimisée pour l'écran externe étroit **et** l'écran interne déplié du Z Fold.

### Déploiement GitHub Pages
Settings → Pages → *Deploy from a branch* → sélectionnez cette branche, dossier `/ (root)`.

## 🗂 Structure

```
index.html            coquille de l'app (6 onglets)
manifest.webmanifest  manifeste PWA
sw.js                 service worker (hors-ligne)
css/style.css         design system sombre/dynamique, responsive
js/
  app.js              routeur
  db.js               stockage local + export/restauration JSON
  metrics.js          TRIMP, CTL/ATL/TSB, Riegel, VMA, tendances
  parser.js           import FIT/TCX/GPX Garmin
  charts.js           graphiques SVG sans dépendance
  plan.js             générateur de plan périodisé
  nutrition.js        calculateur nutrition d'effort
  advice.js           moteur de règles de conseil
  knowledge/          bases de connaissances coach & nutrition (FR)
  views/              les 6 écrans
```

> ⚠️ Les conseils fournis sont indicatifs et ne remplacent pas un avis médical ou un coach diplômé.
