// Import de fichiers Garmin : GPX et TCX (exports Garmin Connect).
// Extrait durée, distance, D+, FC moyenne + séries downsamplées pour graphiques.

export async function parseActivityFile(file) {
  const text = await file.text();
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.tcx') || text.includes('<TrainingCenterDatabase')) return parseTcx(text, file.name);
  if (lower.endsWith('.gpx') || text.includes('<gpx')) return parseGpx(text, file.name);
  if (lower.endsWith('.fit')) throw new Error('Format FIT binaire non supporté : depuis Garmin Connect, exportez en TCX ou GPX.');
  throw new Error('Format non reconnu. Utilisez un export Garmin GPX ou TCX.');
}

function xml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Fichier XML invalide ou corrompu.');
  return doc;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// D+ avec lissage par seuil d'hystérésis (évite le bruit barométrique)
function elevationGain(elevs, threshold = 3) {
  let gain = 0, ref = elevs.length ? elevs[0] : 0;
  for (const e of elevs) {
    if (e - ref >= threshold) { gain += e - ref; ref = e; }
    else if (ref - e >= threshold) { ref = e; }
  }
  return Math.round(gain);
}

function downsample(arr, maxPts = 200) {
  if (arr.length <= maxPts) return arr;
  const step = arr.length / maxPts;
  const out = [];
  for (let i = 0; i < maxPts; i++) out.push(arr[Math.floor(i * step)]);
  return out;
}

function guessSport(rawSport, distanceKm, durationMin, elevGain) {
  const s = (rawSport || '').toLowerCase();
  if (s.includes('bik') || s.includes('cycl') || s.includes('velo') || s.includes('ride')) return 'bike';
  if (s.includes('trail')) return 'trail';
  if (s.includes('run') || s.includes('course')) {
    return distanceKm && elevGain / distanceKm > 25 ? 'trail' : 'run';
  }
  // heuristique vitesse
  const speed = distanceKm / (durationMin / 60);
  if (speed > 16) return 'bike';
  if (distanceKm && elevGain / distanceKm > 25) return 'trail';
  return 'run';
}

function buildResult({ name, rawSport, startTime, totalSec, distanceKm, elevs, hrs, times }) {
  const durationMin = Math.round(totalSec / 60);
  const elevGain = elevationGain(elevs);
  const validHrs = hrs.filter(h => h > 40 && h < 230);
  const avgHr = validHrs.length ? Math.round(validHrs.reduce((a, b) => a + b, 0) / validHrs.length) : null;
  const sport = guessSport(rawSport, distanceKm, durationMin, elevGain);
  const date = (startTime || new Date().toISOString()).slice(0, 10);

  return {
    sport,
    date,
    title: name || `Import ${sport === 'bike' ? 'vélo' : sport === 'trail' ? 'trail' : 'course'}`,
    durationMin,
    distanceKm: +distanceKm.toFixed(2),
    elevGain,
    avgHr,
    source: 'garmin',
    series: {
      hr: validHrs.length ? downsample(hrs) : null,
      elev: elevs.length ? downsample(elevs).map(e => Math.round(e)) : null,
    },
  };
}

function parseTcx(text, filename) {
  const doc = xml(text);
  const activity = doc.querySelector('Activity');
  if (!activity) throw new Error('Aucune activité trouvée dans le fichier TCX.');
  const rawSport = activity.getAttribute('Sport') || '';
  const laps = [...activity.querySelectorAll('Lap')];

  let totalSec = 0, distanceM = 0;
  for (const lap of laps) {
    totalSec += parseFloat(lap.querySelector('TotalTimeSeconds')?.textContent || 0);
    distanceM += parseFloat(lap.querySelector('DistanceMeters')?.textContent || 0);
  }

  const tps = [...activity.querySelectorAll('Trackpoint')];
  const elevs = [], hrs = [], times = [];
  let firstTime = null;
  for (const tp of tps) {
    const t = tp.querySelector('Time')?.textContent;
    if (t && !firstTime) firstTime = t;
    const alt = tp.querySelector('AltitudeMeters');
    if (alt) elevs.push(parseFloat(alt.textContent));
    const hr = tp.querySelector('HeartRateBpm > Value');
    if (hr) hrs.push(parseInt(hr.textContent, 10));
  }

  // secours si les laps ne portent pas les totaux
  if (!totalSec && tps.length >= 2) {
    const t0 = new Date(tps[0].querySelector('Time')?.textContent);
    const t1 = new Date(tps[tps.length - 1].querySelector('Time')?.textContent);
    totalSec = (t1 - t0) / 1000;
  }
  if (!distanceM) {
    const lastDist = [...tps].reverse().find(tp => tp.querySelector('DistanceMeters'));
    if (lastDist) distanceM = parseFloat(lastDist.querySelector('DistanceMeters').textContent);
  }
  if (!totalSec || !distanceM) throw new Error('Durée ou distance introuvable dans le TCX.');

  const startTime = activity.querySelector('Id')?.textContent || firstTime;
  return buildResult({
    name: doc.querySelector('Activities > Activity > Notes')?.textContent || filename.replace(/\.(tcx|gpx)$/i, ''),
    rawSport, startTime, totalSec, distanceKm: distanceM / 1000, elevs, hrs, times,
  });
}

function parseGpx(text, filename) {
  const doc = xml(text);
  const pts = [...doc.querySelectorAll('trkpt')];
  if (pts.length < 2) throw new Error('Aucune trace GPS trouvée dans le GPX.');

  const elevs = [], hrs = [];
  let distanceKm = 0, prev = null, firstTime = null, lastTime = null;

  for (const pt of pts) {
    const lat = parseFloat(pt.getAttribute('lat')), lon = parseFloat(pt.getAttribute('lon'));
    const eleEl = pt.querySelector('ele');
    if (eleEl) elevs.push(parseFloat(eleEl.textContent));
    // FC dans les extensions Garmin (ns3:hr / gpxtpx:hr)
    const hrEl = [...pt.getElementsByTagName('*')].find(el => el.localName === 'hr');
    if (hrEl) hrs.push(parseInt(hrEl.textContent, 10));
    const tEl = pt.querySelector('time');
    if (tEl) {
      const t = new Date(tEl.textContent);
      if (!firstTime) firstTime = t;
      lastTime = t;
    }
    if (prev) distanceKm += haversineKm(prev.lat, prev.lon, lat, lon);
    prev = { lat, lon };
  }

  if (!firstTime || !lastTime || lastTime <= firstTime) {
    throw new Error('Horodatage manquant dans le GPX (trace sans temps : export "itinéraire" plutôt qu\'activité ?).');
  }
  const totalSec = (lastTime - firstTime) / 1000;
  const name = doc.querySelector('trk > name')?.textContent || doc.querySelector('metadata > name')?.textContent;
  const rawSport = doc.querySelector('trk > type')?.textContent || '';

  return buildResult({
    name: name || filename.replace(/\.(tcx|gpx)$/i, ''),
    rawSport,
    startTime: firstTime.toISOString(),
    totalSec, distanceKm, elevs, hrs, times: [],
  });
}
