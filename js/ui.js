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

// Segment control : renvoie une fonction get() de la valeur active
export function bindSeg(container, onChange) {
  const btns = [...container.querySelectorAll('button')];
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.toggle('on', x === b));
    onChange?.(b.dataset.v);
  }));
  return () => container.querySelector('button.on')?.dataset.v;
}
