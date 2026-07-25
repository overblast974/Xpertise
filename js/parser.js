// Import de fichiers Garmin : FIT (natif), TCX et GPX (exports Garmin Connect).
// Extrait durée, distance, D+, FC moyenne + séries downsamplées pour graphiques.

export async function parseActivityFile(file) {
  const lower = file.name.toLowerCase();
  const buf = await file.arrayBuffer();
  if (lower.endsWith('.fit') || isFit(buf)) return parseFit(buf, file.name);
  const text = new TextDecoder().decode(buf);
  if (lower.endsWith('.tcx') || text.includes('<TrainingCenterDatabase')) return parseTcx(text, file.name);
  if (lower.endsWith('.gpx') || text.includes('<gpx')) return parseGpx(text, file.name);
  throw new Error('Format non reconnu. Utilisez un export Garmin FIT, TCX ou GPX.');
}

function isFit(buf) {
  if (buf.byteLength < 12) return false;
  const b = new Uint8Array(buf, 8, 4);
  return b[0] === 0x2E && b[1] === 0x46 && b[2] === 0x49 && b[3] === 0x54; // ".FIT"
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

// ==================== FIT (binaire Garmin) ====================
// Décodeur minimal du protocole FIT : messages "record" (20), "session" (18)
// et "sport" (12). Réf. : Garmin FIT SDK (fit_protocol / fit_profile).

const FIT_EPOCH_MS = Date.UTC(1989, 11, 31); // 31 déc. 1989 00:00 UTC
const SEMI_TO_DEG = 180 / 2 ** 31;

// taille (octets) et valeur "invalide" par base type
const FIT_BASE = {
  0x00: [1, 0xFF], 0x01: [1, 0x7F], 0x02: [1, 0xFF],
  0x83: [2, 0x7FFF], 0x84: [2, 0xFFFF],
  0x85: [4, 0x7FFFFFFF], 0x86: [4, 0xFFFFFFFF],
  0x07: [1, null], 0x88: [4, null], 0x89: [8, null],
  0x0A: [1, 0x00], 0x8B: [2, 0x0000], 0x8C: [4, 0x00000000],
  0x0D: [1, 0xFF], 0x8E: [8, null], 0x8F: [8, null], 0x90: [8, null],
};

function fitRead(view, off, baseType, littleEndian) {
  switch (baseType) {
    case 0x01: return view.getInt8(off);
    case 0x83: return view.getInt16(off, littleEndian);
    case 0x85: return view.getInt32(off, littleEndian);
    case 0x86: case 0x8C: return view.getUint32(off, littleEndian);
    case 0x84: case 0x8B: return view.getUint16(off, littleEndian);
    case 0x88: return view.getFloat32(off, littleEndian);
    case 0x89: return view.getFloat64(off, littleEndian);
    case 0x8E: case 0x8F: case 0x90: return Number(view.getBigUint64(off, littleEndian));
    default: return view.getUint8(off);
  }
}

const FIT_SPORT = { 1: 'run', 2: 'bike', 11: 'trail', 17: 'trail' }; // running, cycling, walking, hiking

function parseFit(buf, filename) {
  const view = new DataView(buf);
  if (!isFit(buf)) throw new Error('Fichier FIT invalide (signature ".FIT" absente).');
  const headerSize = view.getUint8(0);
  const dataSize = view.getUint32(4, true);
  const end = Math.min(headerSize + dataSize, buf.byteLength);

  const defs = {};          // local message type -> définition
  const records = [];       // messages "record"
  const sessions = [];      // messages "session"
  let sportMsg = null;
  let off = headerSize;

  while (off < end) {
    const hdr = view.getUint8(off++);
    let localType, isDef = false, hasDev = false;
    if (hdr & 0x80) {               // compressed timestamp header
      localType = (hdr >> 5) & 0x03;
    } else {
      localType = hdr & 0x0F;
      isDef = !!(hdr & 0x40);
      hasDev = !!(hdr & 0x20);
    }

    if (isDef) {
      off += 1; // reserved
      const littleEndian = view.getUint8(off++) === 0;
      const globalNum = view.getUint16(off, littleEndian); off += 2;
      const nFields = view.getUint8(off++);
      const fields = [];
      let size = 0;
      for (let i = 0; i < nFields; i++) {
        const num = view.getUint8(off), fsize = view.getUint8(off + 1), baseType = view.getUint8(off + 2);
        off += 3;
        fields.push({ num, size: fsize, baseType });
        size += fsize;
      }
      let devSize = 0;
      if (hasDev) {
        const nDev = view.getUint8(off++);
        for (let i = 0; i < nDev; i++) { devSize += view.getUint8(off); off += 3; }
      }
      defs[localType] = { littleEndian, globalNum, fields, size: size + devSize };
      continue;
    }

    const def = defs[localType];
    if (!def) throw new Error('Fichier FIT corrompu (message sans définition).');

    const interesting = def.globalNum === 20 || def.globalNum === 18 || def.globalNum === 12;
    if (!interesting) { off += def.size; continue; }

    const msg = {};
    let p = off;
    for (const f of def.fields) {
      const bt = f.baseType in FIT_BASE ? f.baseType : 0x0D;
      const [unit, invalid] = FIT_BASE[bt];
      if (f.size === unit || unit === 1) {
        // champ simple (on ignore les tableaux multi-valeurs et les strings)
        if (bt !== 0x07 && f.size === unit) {
          const v = fitRead(view, p, bt, def.littleEndian);
          if (invalid === null || v !== invalid) msg[f.num] = v;
        }
      }
      p += f.size;
    }
    off += def.size;

    if (def.globalNum === 20) records.push(msg);
    else if (def.globalNum === 18) sessions.push(msg);
    else if (def.globalNum === 12) sportMsg = msg;
  }

  return buildFitResult({ records, sessions, sportMsg, filename });
}

function buildFitResult({ records, sessions, sportMsg, filename }) {
  // --- totaux : de préférence les messages session (calculés par la montre) ---
  let totalSec = 0, distanceKm = 0, ascent = null, avgHrSession = null, sport = null, startTs = null;
  for (const s of sessions) {
    totalSec += (s[8] ?? s[7] ?? 0) / 1000;          // total_timer_time, sinon elapsed
    distanceKm += (s[9] ?? 0) / 100 / 1000;           // total_distance (cm)
    if (s[22] != null) ascent = (ascent || 0) + s[22]; // total_ascent (m)
    if (s[16] != null) avgHrSession = s[16];           // avg_heart_rate
    if (s[5] != null && sport == null) sport = s[5];   // sport
    if (s[6] === 3) sport = 'trail-sub';               // sub_sport trail
    if (s[2] != null && startTs == null) startTs = s[2]; // start_time
  }
  if (sportMsg?.[0] != null && sport == null) sport = sportMsg[0];

  // --- séries depuis les messages record ---
  const hrs = [], elevs = [];
  let firstTs = null, lastTs = null, lastDist = null;
  for (const r of records) {
    if (r[253] != null) { if (firstTs == null) firstTs = r[253]; lastTs = r[253]; }
    if (r[3] != null && r[3] > 40 && r[3] < 230) hrs.push(r[3]);
    const alt = r[78] != null ? r[78] / 5 - 500 : (r[2] != null ? r[2] / 5 - 500 : null); // enhanced_altitude / altitude
    if (alt != null && alt > -500 && alt < 9000) elevs.push(alt);
    if (r[5] != null) lastDist = r[5] / 100 / 1000;   // distance (cm)
  }

  // secours si pas de message session
  if (!totalSec && firstTs != null && lastTs != null) totalSec = lastTs - firstTs;
  if (!distanceKm && lastDist) distanceKm = lastDist;
  if (!totalSec || !distanceKm) throw new Error('Durée ou distance introuvable dans le fichier FIT.');

  const durationMin = Math.round(totalSec / 60);
  const elevGain = ascent != null ? Math.round(ascent) : elevationGain(elevs);
  const avgHr = avgHrSession ?? (hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null);
  const dateTs = startTs ?? firstTs;
  const date = dateTs != null ? new Date(FIT_EPOCH_MS + dateTs * 1000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  let sportKey = sport === 'trail-sub' ? 'trail' : FIT_SPORT[sport];
  if (!sportKey) sportKey = guessSport('', distanceKm, durationMin, elevGain);
  if (sportKey === 'run' && distanceKm && elevGain / distanceKm > 25) sportKey = 'trail';

  return {
    sport: sportKey,
    date,
    title: filename.replace(/\.fit$/i, '').replace(/[_-]+/g, ' ').trim() || `Import ${sportKey === 'bike' ? 'vélo' : sportKey === 'trail' ? 'trail' : 'course'}`,
    durationMin,
    distanceKm: +distanceKm.toFixed(2),
    elevGain,
    avgHr,
    source: 'garmin',
    series: {
      hr: hrs.length ? downsample(hrs) : null,
      elev: elevs.length ? downsample(elevs).map(e => Math.round(e)) : null,
    },
  };
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
