import { STARTERS, type StarterType } from '../game/campaign';
import { COURSE_LESSONS, COURSE_REGIONS, courseLesson, courseRegion } from '../game/curriculum';
import { DIFFICULTIES, type DifficultyId } from '../game/difficulty';
import { journeyComplete, lessonUnlocked, newJourney, regionUnlocked, type JourneySave } from '../game/journey';
import { clearJourney, loadJourney, persistJourney } from '../journeySave';
import { closeModal, esc, isModalOpen, showModal } from '../ui/overlay';
import { BaseScene, goTo } from '../ui/screen';
import { coverImage } from '../ui/widgets';
import '../ui/journey.css';

type Page = 'map' | 'journal' | 'settings';
const ART = { n: 'knight', b: 'bishop', r: 'rook' };
const HELP: Record<DifficultyId, string> = {
  squire: 'Unlimited tries, hints and advice before every position.',
  knight: 'Three misses per attempt. Hints and a little opening advice.',
  champion: 'Two misses per attempt. No hints or in-position advice.',
  grandmaster: 'Two misses per attempt. Same challenge rules as Champion in this chapter.',
};

/** The campaign shell: onboarding, chapter trail, journal and preferences. */
export class JourneyScene extends BaseScene {
  private save: JourneySave | null = null;
  private hud!: HTMLElement;
  private page: Page = 'map';
  private difficulty: DifficultyId = 'knight';
  private starter: StarterType = 'n';

  constructor() { super('journey'); }

  init(data: { page?: Page } = {}) {
    this.save = loadJourney();
    this.page = data.page ?? 'map';
    this.difficulty = this.save?.difficulty ?? 'knight';
    this.starter = this.save?.starter ?? 'n';
    this.hud = document.createElement('main');
    this.hud.className = 'journey-hud';
    this.hud.id = 'journey-ui';
    document.body.appendChild(this.hud);
    this.hud.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
      if (b && !b.disabled && !isModalOpen()) this.action(b.dataset.action!);
    });
    this.events.once('shutdown', () => { this.hud.remove(); closeModal(); });
  }

  protected build() {
    coverImage(this, this.save ? 'bg-map-region1' : 'bg-title', .65);
    this.render();
  }

  private btn(action: string, text: string, cls = '', disabled = false) {
    return `<button data-action="${action}" class="${cls}" ${disabled ? 'disabled' : ''}>${esc(text)}</button>`;
  }

  private options() {
    return `<fieldset><legend>How much help would you like?</legend><div class="journey-options">${Object.values(DIFFICULTIES).map(d => `<button data-action="difficulty:${d.id}" aria-pressed="${this.difficulty === d.id}">${d.label}</button>`).join('')}</div><p class="journey-help">${HELP[this.difficulty]} All levels use the same puzzles. You can always retry.</p></fieldset>
      <fieldset><legend>Who will guide you?</legend><div class="journey-companions">${(['n', 'b', 'r'] as const).map(t => `<button data-action="starter:${t}" aria-pressed="${this.starter === t}"><img src="${import.meta.env.BASE_URL}sprites/${ART[t]}-ally.webp" alt=""/><span><strong>${STARTERS[t].name}</strong><small>${STARTERS[t].species}</small></span></button>`).join('')}</div></fieldset>`;
  }

  private render() {
    if (!this.save) {
      this.hud.innerHTML = `<div class="journey-welcome"><section class="journey-welcome-story"><p class="journey-kicker">A chess journey in two chapters</p><h1>Pawnshire</h1><p class="journey-lede">A small move.<br>A new way to see the board.</p><p>Travel through the Bog and along the Kingsroad. Let a companion show you an idea, then discover it for yourself.</p><p class="journey-source">Real chess. Published Lichess puzzles. Your own discoveries.</p></section><section class="journey-setup" aria-label="Start your journey"><h2>Your road begins here</h2><p>For players who know how the pieces move and want to spot tactics.</p>${this.options()}<div class="journey-actions">${this.btn('start', 'Begin the journey', 'primary')}${this.btn('moves', 'Remind me of the moves')}</div><p class="journey-help">Progress saves on this device. Change your help level anytime.</p></section></div>`;
      return;
    }
    const save = this.save;
    const current = courseRegion(save.currentRegion) ?? COURSE_REGIONS[0];
    const stars = save.completed.reduce((n, id) => n + 1 + Number(save.stars[id]?.clean ?? false) + Number(save.stars[id]?.noHint ?? false), 0);
    this.hud.classList.toggle('journey-road', current.id === 'r2');
    const header = `<header class="journey-header"><button class="journey-wordmark" data-action="page:map">Pawnshire</button><nav aria-label="Journey navigation">${this.btn('page:map', 'Map', this.page === 'map' ? 'selected' : '')}${this.btn('page:journal', 'Journal', this.page === 'journal' ? 'selected' : '')}${this.btn('page:settings', 'Settings', this.page === 'settings' ? 'selected' : '')}</nav><span class="journey-total" aria-label="${stars} stars earned">★ ${stars}</span></header>`;
    let body = '';
    if (this.page === 'settings') {
      body = `<section class="journey-paper journey-settings"><h1>Make yourself at home</h1><p>Adjust the help and choose your companion. Your lessons and stars stay earned.</p>${this.options()}<div class="journey-actions">${this.btn('page:map', 'Back to the journey', 'primary')}${this.btn('moves', 'Piece movement guide')}</div><hr><h2>A fresh start</h2><p>Reset this journey’s lessons and stars. Earlier campaign and pilot saves are kept separately.</p>${this.btn('reset', 'Reset journey', 'quiet')}</section>`;
    } else if (this.page === 'journal') {
      const learned = COURSE_LESSONS.filter(l => save.completed.includes(l.id) && !l.review);
      body = `<section class="journey-paper"><p class="journey-kicker">${esc(STARTERS[save.starter].name)}’s field notes</p><h1>Your chess journal</h1><p>Keep the ideas you have learned close at hand. Examples are free to revisit.</p><div class="journey-notes">${learned.length ? learned.map(l => `<article><p class="journey-kicker">${esc(courseRegion(l.regionId)!.title)}</p><h2>${esc(l.theme)}</h2><p>${esc(l.takeaway)}</p>${this.btn(`example:${l.id}`, 'Watch the example')}</article>`).join('') : `<p class="journey-empty">Finish your first lesson to add its idea here.</p>${this.btn('page:map', 'Find your first lesson', 'primary')}`}</div><footer class="journey-credits"><h2>From real games to your board</h2><p>Positions and solution lines come from the <a href="https://database.lichess.org/#puzzles" target="_blank" rel="noopener">Lichess open puzzle database</a> (CC0). The stories and companion notes are ours. Source links appear after each position.</p><p>Need the basics? <a href="https://lichess.org/learn" target="_blank" rel="noopener">Learn how the pieces move on Lichess</a>.</p></footer></section>`;
    } else {
      const finished = journeyComplete(save);
      const next = COURSE_LESSONS.find(l => !save.completed.includes(l.id) && lessonUnlocked(save, l.id));
      const completedHere = current.lessons.filter(id => save.completed.includes(id)).length;
      body = `<div class="journey-region-tabs" role="group" aria-label="Choose a region">${COURSE_REGIONS.map((r, i) => this.btn(`region:${r.id}`, `${i + 1}. ${r.title}${regionUnlocked(save, r.id) ? '' : ' · Locked'}`, r.id === current.id ? 'selected' : '', !regionUnlocked(save, r.id))).join('')}</div>
      ${finished ? `<section class="journey-finale" role="status"><p class="journey-kicker">Two chapters. A sharper eye.</p><h2>The road is yours.</h2><p>You have completed the Bog and the Kingsroad. Revisit any lesson, fill your journal, or return for the stars you missed.</p><p>The next regions are still beyond the horizon. Your journey here is complete.</p></section>` : ''}
      ${save.lastResult?.interrupted ? '<p class="journey-notice" role="status">Your unfinished attempt ended when you left. Completed lessons and stars are safe; you can retry.</p>' : ''}
      <div class="journey-map-layout"><section class="journey-chapter"><p class="journey-kicker">Chapter ${COURSE_REGIONS.indexOf(current) + 1} · ${esc(current.town)}</p><h1>${esc(current.title)}</h1><p class="journey-lede">${esc(current.subtitle)}</p><p>${esc(current.intro)}</p><div class="journey-companion-note"><img src="${import.meta.env.BASE_URL}sprites/${ART[save.starter]}-ally.webp" alt="${esc(STARTERS[save.starter].name)}"/><p><strong>${esc(STARTERS[save.starter].name)}</strong><br>${completedHere === current.lessons.length ? esc(current.outro) : 'One idea at a time. Look closely, then make your move.'}</p></div><p class="journey-progress">${completedHere} of ${current.lessons.length} encounters complete · ${DIFFICULTIES[save.difficulty].label}</p>${next ? this.btn(`lesson:${next.id}`, `Continue: ${next.title}`, 'primary journey-continue') : this.btn('page:journal', 'Open your journal', 'primary')}</section>
      <ol class="journey-trail" aria-label="${esc(current.title)} lessons">${current.lessons.map((id, i) => {
        const l = courseLesson(id)!, done = save.completed.includes(id), unlocked = lessonUnlocked(save, id), earned = save.stars[id];
        return `<li class="${done ? 'done' : unlocked ? 'available' : 'locked'} ${l.review ? 'review' : ''}"><span class="journey-stop" aria-hidden="true">${done ? '✓' : i + 1}</span><button data-action="lesson:${id}" ${unlocked ? '' : 'disabled'}><span class="journey-node-copy"><small>${l.review ? `${esc(current.bossName)}’s challenge` : `Lesson ${i + 1}`}</small><strong>${esc(l.title)}</strong><span>${esc(l.review ? 'Bring the ideas together' : l.theme)}</span></span><span class="journey-node-state">${done ? `<span aria-label="${1 + Number(earned?.clean ?? false) + Number(earned?.noHint ?? false)} of 3 stars">★${earned?.clean ? '★' : '☆'}${earned?.noHint ? '★' : '☆'}</span><small>Revisit</small>` : unlocked ? 'Begin' : '<small>Finish the previous encounter</small>'}</span></button></li>`;
      }).join('')}</ol></div>`;
    }
    this.hud.innerHTML = `${header}<div class="journey-content">${body}</div>`;
  }

  private action(action: string) {
    if (action === 'start') {
      this.save = newJourney(this.difficulty, this.starter); persistJourney(this.save); this.rebuild(); this.hud.scrollTop = 0; return;
    }
    if (action.startsWith('difficulty:')) {
      const d = action.split(':')[1] as DifficultyId;
      if (!(d in DIFFICULTIES)) return;
      this.difficulty = d; if (this.save) { this.save.difficulty = d; persistJourney(this.save); } this.render(); return;
    }
    if (action.startsWith('starter:')) {
      const s = action.split(':')[1] as StarterType;
      if (!(s in STARTERS)) return;
      this.starter = s; if (this.save) { this.save.starter = s; persistJourney(this.save); } this.render(); return;
    }
    if (action === 'moves') {
      showModal({ title: 'The pieces, at a glance', html: `<div class="journey-moves"><p><strong>King:</strong> one square in any direction. Never move into check.</p><p><strong>Queen:</strong> any distance along a rank, file or diagonal.</p><p><strong>Rook:</strong> any distance straight along a rank or file.</p><p><strong>Bishop:</strong> any distance diagonally.</p><p><strong>Knight:</strong> two squares one way, then one sideways. It can jump over pieces.</p><p><strong>Pawn:</strong> forward one square, or two from its starting square if clear. Capture one square diagonally forward. Reach the last rank to promote.</p><p>Except the knight, pieces cannot jump over other pieces. When your king is in check, your move must make it safe.</p><p>For castling, en passant and interactive practice, visit <a href="https://lichess.org/learn" target="_blank" rel="noopener">Lichess Learn</a>.</p></div>`, buttons: [{ label: 'Ready', kind: 'primary', onClick: () => {} }], onDismiss: () => {} }); return;
    }
    if (!this.save) return;
    if (action.startsWith('page:')) {
      this.page = action.split(':')[1] as Page; this.render(); this.hud.scrollTop = 0; return;
    }
    if (action.startsWith('region:')) {
      const id = action.split(':')[1]; if (!regionUnlocked(this.save, id)) return;
      this.save.currentRegion = id; persistJourney(this.save); this.render(); this.hud.scrollTop = 0; return;
    }
    if (action.startsWith('lesson:') || action.startsWith('example:')) {
      const id = action.split(':')[1]; if (!lessonUnlocked(this.save, id)) return;
      goTo(this.game, 'course-play', { lessonId: id, exampleOnly: action.startsWith('example:') }); return;
    }
    if (action === 'reset') {
      showModal({ title: 'Start this journey again?', html: '<p>This clears your progress and stars in these two chapters. Earlier campaign and pilot saves are not affected.</p>', buttons: [{ label: 'Keep my progress', kind: 'primary', onClick: () => {} }, { label: 'Reset journey', onClick: () => { clearJourney(); this.save = null; this.page = 'map'; this.rebuild(); this.hud.scrollTop = 0; } }], onDismiss: () => {} });
    }
  }
}
