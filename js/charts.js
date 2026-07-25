// Graphiques SVG sans dépendance — thème sombre, dégradés dynamiques.

const NS = 'http://www.w3.org/2000/svg';
let uid = 0;

function esc(s) { return String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])); }

function scaleLinear(domain, range) {
  const [d0, d1] = domain, [r0, r1] = range;
  const k = (r1 - r0) / ((d1 - d0) || 1);
  return v => r0 + (v - d0) * k;
}

function pathFrom(points) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
}

function smoothPath(points) {
  if (points.length < 3) return pathFrom(points);
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1], [x1, y1] = points[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return d;
}

// ---------- Courbe forme (CTL / ATL / TSB) ----------
export function fitnessChart(series, { width = 720, height = 240 } = {}) {
  if (!series.length) return '';
  const id = ++uid;
  const pad = { l: 34, r: 10, t: 12, b: 22 };
  const xs = scaleLinear([0, series.length - 1], [pad.l, width - pad.r]);
  const maxY = Math.max(10, ...series.map(s => Math.max(s.ctl, s.atl)));
  const minTsb = Math.min(0, ...series.map(s => s.tsb));
  const ys = scaleLinear([Math.min(minTsb, 0) - 5, maxY * 1.1], [height - pad.b, pad.t]);

  const ctlPts = series.map((s, i) => [xs(i), ys(s.ctl)]);
  const atlPts = series.map((s, i) => [xs(i), ys(s.atl)]);
  const tsbPts = series.map((s, i) => [xs(i), ys(s.tsb)]);
  const areaCtl = `${pathFrom(ctlPts)} L${xs(series.length - 1)},${ys(0)} L${xs(0)},${ys(0)} Z`;

  // graduations
  const yTicks = [];
  const step = maxY > 80 ? 40 : maxY > 40 ? 20 : 10;
  for (let v = 0; v <= maxY * 1.1; v += step) yTicks.push(v);
  const months = [];
  let lastMonth = '';
  series.forEach((s, i) => {
    const m = s.date.slice(0, 7);
    if (m !== lastMonth) {
      lastMonth = m;
      if (i > 3) months.push({ i, label: new Date(s.date + 'T12:00:00').toLocaleDateString('fr-FR', { month: 'short' }) });
    }
  });

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="${NS}" role="img" aria-label="Courbe de forme">
    <defs>
      <linearGradient id="gctl${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7c5cff" stop-opacity=".45"/>
        <stop offset="100%" stop-color="#7c5cff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${yTicks.map(v => `<line x1="${pad.l}" x2="${width - pad.r}" y1="${ys(v)}" y2="${ys(v)}" stroke="rgba(148,170,220,.1)"/>
      <text x="${pad.l - 6}" y="${ys(v) + 3}" fill="#6b7ba0" font-size="9" text-anchor="end">${v}</text>`).join('')}
    ${months.map(m => `<text x="${xs(m.i)}" y="${height - 6}" fill="#6b7ba0" font-size="9">${esc(m.label)}</text>`).join('')}
    <line x1="${pad.l}" x2="${width - pad.r}" y1="${ys(0)}" y2="${ys(0)}" stroke="rgba(148,170,220,.3)"/>
    <path d="${areaCtl}" fill="url(#gctl${id})"/>
    <path d="${smoothPath(atlPts)}" fill="none" stroke="#fb923c" stroke-width="1.6" stroke-opacity=".85"/>
    <path d="${smoothPath(tsbPts)}" fill="none" stroke="#34d399" stroke-width="1.6" stroke-dasharray="4 3"/>
    <path d="${smoothPath(ctlPts)}" fill="none" stroke="#7c5cff" stroke-width="2.4"/>
    <circle cx="${ctlPts.at(-1)[0]}" cy="${ctlPts.at(-1)[1]}" r="4" fill="#7c5cff" stroke="#0b0f1a" stroke-width="2"/>
  </svg>`;
}

// ---------- Barres hebdo ----------
export function weeklyBars(weeks, key = 'load', { width = 720, height = 190, color = '#22d3ee', unit = '' } = {}) {
  if (!weeks.length) return '';
  const id = ++uid;
  const pad = { l: 8, r: 8, t: 24, b: 24 };
  const maxV = Math.max(1, ...weeks.map(w => w[key]));
  const bw = (width - pad.l - pad.r) / weeks.length;
  const ys = scaleLinear([0, maxV], [height - pad.b, pad.t]);

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="${NS}" role="img" aria-label="Volume hebdomadaire">
    <defs>
      <linearGradient id="gbar${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${color}" stop-opacity=".35"/>
      </linearGradient>
    </defs>
    ${weeks.map((w, i) => {
      const v = w[key];
      const x = pad.l + i * bw + bw * 0.16;
      const y = ys(v);
      const h = Math.max(2, height - pad.b - y);
      const isLast = i === weeks.length - 1;
      const label = new Date(w.monday + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
      const valLabel = v > 0 ? (key === 'durationMin' ? Math.round(v / 60 * 10) / 10 + 'h' : Math.round(v) + unit) : '';
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.68).toFixed(1)}" height="${h.toFixed(1)}" rx="4"
          fill="${isLast ? `url(#gbar${id})` : 'rgba(148,170,220,.22)'}" ${isLast ? '' : ''}/>
        ${v > 0 ? `<text x="${(x + bw * 0.34).toFixed(1)}" y="${(y - 5).toFixed(1)}" fill="${isLast ? color : '#6b7ba0'}" font-size="9" text-anchor="middle" font-weight="700">${valLabel}</text>` : ''}
        <text x="${(x + bw * 0.34).toFixed(1)}" y="${height - 8}" fill="#6b7ba0" font-size="8.5" text-anchor="middle">${label}</text>`;
    }).join('')}
  </svg>`;
}

// ---------- Donut répartition ----------
export function donut(parts, { size = 150, stroke = 18 } = {}) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  if (!total) return '';
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r;
  let acc = 0;
  const segs = parts.filter(p => p.value > 0).map(p => {
    const frac = p.value / total;
    const seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${p.color}" stroke-width="${stroke}"
      stroke-dasharray="${(frac * circ - 2).toFixed(1)} ${(circ - frac * circ + 2).toFixed(1)}"
      stroke-dashoffset="${(-acc * circ + circ / 4).toFixed(1)}" stroke-linecap="round"/>`;
    acc += frac;
    return seg;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="${NS}" style="max-width:${size}px" role="img" aria-label="Répartition">
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(148,170,220,.12)" stroke-width="${stroke}"/>
    ${segs}
  </svg>`;
}

// ---------- Sparkline ----------
export function sparkline(values, { width = 140, height = 40, color = '#22d3ee' } = {}) {
  if (!values || values.length < 2) return '';
  const id = ++uid;
  const min = Math.min(...values), max = Math.max(...values);
  const xs = scaleLinear([0, values.length - 1], [2, width - 2]);
  const ys = scaleLinear([min, max === min ? min + 1 : max], [height - 3, 3]);
  const pts = values.map((v, i) => [xs(i), ys(v)]);
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="${NS}" style="max-width:${width}px">
    <defs><linearGradient id="gsp${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity=".4"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${smoothPath(pts)} L${width - 2},${height} L2,${height} Z" fill="url(#gsp${id})" stroke="none"/>
    <path d="${smoothPath(pts)}" fill="none" stroke="${color}" stroke-width="1.8"/>
  </svg>`;
}

// ---------- Jauge TSB ----------
export function tsbGauge(tsb, { width = 220, height = 70 } = {}) {
  // échelle -40 .. +30
  const clamp = Math.max(-40, Math.min(30, tsb));
  const xs = scaleLinear([-40, 30], [10, width - 10]);
  const zones = [
    { from: -40, to: -25, color: '#f87171' },
    { from: -25, to: -8, color: '#fb923c' },
    { from: -8, to: 8, color: '#fbbf24' },
    { from: 8, to: 22, color: '#34d399' },
    { from: 22, to: 30, color: '#60a5fa' },
  ];
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="${NS}" role="img" aria-label="Jauge de forme">
    ${zones.map(z => `<rect x="${xs(z.from)}" y="26" width="${xs(z.to) - xs(z.from)}" height="10" fill="${z.color}" opacity=".8" rx="3"/>`).join('')}
    <polygon points="${xs(clamp)},22 ${xs(clamp) - 6},10 ${xs(clamp) + 6},10" fill="#eef2fb"/>
    <text x="10" y="56" fill="#6b7ba0" font-size="9">Fatigue</text>
    <text x="${width / 2}" y="56" fill="#6b7ba0" font-size="9" text-anchor="middle">Neutre</text>
    <text x="${width - 10}" y="56" fill="#6b7ba0" font-size="9" text-anchor="end">Frais</text>
  </svg>`;
}
