import './overlay.css';

/**
 * HTML overlay for long text: dialogue, lessons, results and settings sit on top of
 * the canvas, so they wrap, scroll and read well with screen readers.
 */

export interface ModalButton {
  label: string;
  kind?: 'primary' | 'normal' | 'ghost';
  onClick: () => void;
  /** Keep the modal open after the click. */
  keepOpen?: boolean;
}

export interface ModalOpts {
  eyebrow?: string;
  title: string;
  /** Trusted HTML built by the game (escape any player-facing data with `esc`). */
  html?: string;
  tone?: 'won' | 'lost' | 'plain';
  buttons: ModalButton[];
  /** Portrait image shown beside the text (dialogue). */
  portrait?: { src: string; side: 'ally' | 'foe'; name: string };
  /** Clicking the backdrop or pressing Escape runs this (and closes). */
  onDismiss?: () => void;
  wide?: boolean;
}

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const root = () => document.getElementById('overlay')!;
let current: { close: () => void } | null = null;

export function isModalOpen() {
  return current !== null;
}

export function closeModal() {
  current?.close();
}

export function showModal(o: ModalOpts): () => void {
  current?.close();
  const host = root();
  const wrap = document.createElement('div');
  wrap.className = 'ov-backdrop';
  const dialog = document.createElement('div');
  dialog.className = `ov-dialog ${o.tone ?? 'plain'}${o.wide ? ' wide' : ''}`;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', o.title);
  const pic = o.portrait
    ? `<div class="ov-portrait ${o.portrait.side}" style="background-image:url('${o.portrait.src}')" role="img" aria-label="${esc(o.portrait.name)}"></div>`
    : '';
  dialog.innerHTML = `
    ${o.eyebrow ? `<p class="ov-eyebrow">${esc(o.eyebrow)}</p>` : ''}
    <h2>${esc(o.title)}</h2>
    <div class="ov-body ${pic ? 'with-pic' : ''}">${pic}<div class="ov-text">${o.html ?? ''}</div></div>
    <div class="ov-row"></div>`;
  const row = dialog.querySelector('.ov-row')!;
  const close = () => {
    if (current?.close !== close) return;
    current = null;
    document.removeEventListener('keydown', onKey);
    wrap.remove();
  };
  for (const b of o.buttons) {
    const el = document.createElement('button');
    el.className = `ov-btn ${b.kind ?? 'normal'}`;
    el.textContent = b.label;
    el.addEventListener('click', () => {
      if (!b.keepOpen) close();
      b.onClick();
    });
    row.appendChild(el);
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && o.onDismiss) {
      close();
      o.onDismiss();
    }
  };
  document.addEventListener('keydown', onKey);
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap && o.onDismiss) {
      close();
      o.onDismiss();
    }
  });
  wrap.appendChild(dialog);
  host.appendChild(wrap);
  current = { close };
  (row.querySelector<HTMLButtonElement>('.primary') ?? row.querySelector<HTMLButtonElement>('button'))?.focus({ preventScroll: true });
  return close;
}
