import { courseCast } from '../game/courseCast';
import { STARTERS, type StarterType } from '../game/campaign';
import { COURSE_LESSONS, COURSE_REGIONS, courseLesson, courseRegion } from '../game/curriculum';
import { DIFFICULTIES, type DifficultyId } from '../game/difficulty';
import { markIntroSeen, pendingIntro, endingPending, finaleInterludeUnlocked, finalEncounter, journeyComplete, lessonUnlocked, regionUnlocked, type JourneySave } from '../game/journey';
import { clearJourney, loadJourney, newJourneyForMode, persistJourney } from '../journeySave';
import { closeModal, esc, isModalOpen, showModal } from '../ui/overlay';
import { BaseScene, goTo } from '../ui/screen';
import { coverImage } from '../ui/widgets';
import '../ui/journey.css';
import { chapterIntro, chapterStory, COMPANION_GREETINGS, finaleInterlude, journeyEnding } from '../game/courseStory';
import { portraitStyle } from '../ui/portrait';
import { journeyRoute, journeyTrail } from '../ui/journeyLayout';
import { previewRegion } from '../journeyPreview';

type Page = 'title' | 'setup' | 'moves' | 'difficulty' | 'companion' | 'map' | 'journal' | 'settings' | 'story' | 'interlude' | 'ending';
const ART = { n: 'knight', b: 'bishop', r: 'rook' };
const HELP: Record<DifficultyId, string> = {
  squire: 'Unlimited tries, hints and advice before every position.',
  knight: 'Three misses per attempt. Hints and a little opening advice.',
  champion: 'Two misses per attempt. No hints or in-position advice.',
  grandmaster: 'Two misses per attempt. Same challenge rules as Champion throughout the journey.',
};

/** The campaign shell: onboarding, chapter trail, journal and preferences. */
export class JourneyScene extends BaseScene {
  private save: JourneySave | null = null;
  private hud!: HTMLElement;
  private page: Page = 'title';
  private difficulty: DifficultyId = 'knight';
  private starter: StarterType = 'n';
  private storyRegion = '';

  constructor() { super('journey'); }

  init(data: { page?: Page; storyRegion?: string } = {}) {
    this.save = loadJourney();
    this.page = data.page ?? 'title';
    if (this.page === 'setup') this.page = 'moves';
    this.storyRegion = data.storyRegion ?? '';
    if (this.page === 'story' && !courseRegion(this.storyRegion)?.lessons.every(id => this.save?.completed.includes(id))) this.page = 'map';
    if (this.page === 'interlude' && (!this.save || !finaleInterludeUnlocked(this.save))) this.page = 'map';
    if (this.page === 'ending' && !this.save?.finaleComplete) this.page = 'map';
    if (!this.save && !['title', 'moves', 'difficulty', 'companion'].includes(this.page)) this.page = 'moves';
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
    this.hud.addEventListener('change', e => {
      const select = e.target as HTMLSelectElement;
      if (select.matches('[data-region-picker]') && !isModalOpen()) this.action(`region:${select.value}`);
    });
    this.events.once('shutdown', () => { this.hud.remove(); closeModal(); });
  }

  protected build() {
    const backdrop = this.page === 'ending' || this.page === 'interlude' ? 'finale' : this.page === 'story' ? this.storyRegion : this.save?.currentRegion ?? '';
    const mapArt = courseRegion(backdrop)?.mapArt ?? 'map-region1';
    const onboarding = ['moves', 'difficulty'].includes(this.page) && !this.save;
    if (this.page === 'companion' && !this.save) coverImage(this, 'bg-town', .55);
    else coverImage(this, this.page === 'title' || onboarding ? 'bg-title' : `bg-${mapArt}`, this.page === 'title' ? .3 : onboarding ? .45 : this.page === 'map' ? .1 : .18);
    this.render();
  }

  private btn(action: string, text: string, cls = '', disabled = false) {
    return `<button data-action="${action}" class="${cls}" ${disabled ? 'disabled' : ''}>${esc(text)}</button>`;
  }

  private options() {
    return `<fieldset><legend>How much help would you like?</legend><div class="journey-options">${Object.values(DIFFICULTIES).map(d => `<button data-action="difficulty:${d.id}" aria-pressed="${this.difficulty === d.id}">${d.label}</button>`).join('')}</div><p class="journey-help">${HELP[this.difficulty]} All levels use the same puzzles. You can always retry.</p></fieldset>
      <fieldset><legend>Who will guide you?</legend><div class="journey-companions">${(['n', 'b', 'r'] as const).map(t => `<button data-action="starter:${t}" aria-pressed="${this.starter === t}"><img src="${import.meta.env.BASE_URL}sprites/${ART[t]}-ally.webp" alt=""/><span><strong>${STARTERS[t].name}</strong><small>${STARTERS[t].species}</small></span></button>`).join('')}</div></fieldset>`;
  }

  /** New journeys ask one question at a time, like the original game. */
  private onboarding() {
    if (this.page === 'difficulty') {
      return `<div class="journey-welcome"><section class="journey-setup journey-step" aria-label="Choose your help">
        <p class="journey-eyebrow">Difficulty</p><h1>How much help would you like?</h1>
        <div class="journey-choices">${Object.values(DIFFICULTIES).map(d => `<button class="journey-choice" data-action="pick:${d.id}" ${this.difficulty === d.id ? 'aria-current="true"' : ''}><strong>${esc(d.label)}</strong><span>${esc(HELP[d.id])}</span></button>`).join('')}</div>
        <p class="journey-help">Every level uses the same puzzles. You can change this anytime in Settings.</p>
        ${this.btn('page:moves', 'Back', 'quiet')}</section></div>`;
    }
    if (this.page === 'companion') {
      return `<section class="journey-companion-pick" aria-label="Choose your companion"><p class="journey-eyebrow">Choose your companion</p><h1>Who rides out with you?</h1>
        <p class="journey-companion-lead">Your companion is your tutor through every chapter.</p>
        <div class="journey-companion-cards">${(['n', 'b', 'r'] as const).map(t => `<article class="journey-companion-card"><button class="journey-companion-art" data-action="choose:${t}" tabindex="-1" aria-hidden="true"><img src="${import.meta.env.BASE_URL}sprites/${ART[t]}-ally.webp" alt=""/></button><div class="journey-companion-text"><h2>${esc(STARTERS[t].name)}</h2><p class="journey-eyebrow">${esc(STARTERS[t].species)}</p><p>${esc(STARTERS[t].blurb)}</p></div>${this.btn(`choose:${t}`, `Choose ${STARTERS[t].name}`, 'primary')}</article>`).join('')}</div>
        ${this.btn('page:difficulty', 'Back', 'quiet journey-companion-back')}</section>`;
    }
    return `<div class="journey-welcome"><section class="journey-setup journey-step" aria-label="Start your journey">
      <p class="journey-eyebrow">Before we begin</p><h1>Do you know how the pieces move?</h1>
      <p>Pawnshire is for players who know the moves and want to spot tactics.</p>
      <div class="journey-actions journey-actions-stack">${this.btn('knows', 'Yes, I know the moves', 'primary')}${this.btn('teach', 'Not yet, show me')}</div>
      <p class="journey-help">Progress saves on this device.</p>${this.btn('page:title', 'Back to title', 'quiet')}</section></div>`;
  }

  private dialogueRow(line: { who: 'narrator' | 'companion' | 'boss'; speaker: string; line: string }) {
    if (line.who === 'narrator') return `<p class="journey-narration">${esc(line.line)}</p>`;
    const foe = line.who === 'boss';
    const pic = foe ? portraitStyle('k', 'bog') : portraitStyle(this.save?.starter ?? this.starter, 'ally');
    return `<div class="dlg ${foe ? 'foe' : 'ally'} journey-dlg"><div class="dlg-pic" style="${pic}"></div><div><p class="who ${foe ? 'foe' : ''}">${esc(line.speaker)}</p><p>${esc(line.line)}</p></div></div>`;
  }

  /** The first visit to a chapter opens with its story, once per journey. */
  private maybeIntro() {
    const save = this.save;
    if (!save || this.page !== 'map' || isModalOpen()) return;
    const region = courseRegion(pendingIntro(save, !!previewRegion) ?? '');
    if (!region) return;
    markIntroSeen(save, region.id); persistJourney(save);
    const lines = chapterIntro(region.id, save.starter);
    if (!lines.length) return;
    showModal({ eyebrow: region.kind === 'finale' ? 'Finale' : `Chapter ${COURSE_REGIONS.indexOf(region) + 1}`, title: region.title, wide: true,
      html: `<div class="journey-intro">${lines.map(line => this.dialogueRow(line)).join('')}</div>`,
      buttons: [{ label: 'Onward', kind: 'primary', onClick: () => {} }] });
  }

  private toast(text: string) {
    this.hud.querySelector('.journey-toast')?.remove();
    const el = document.createElement('p');
    el.className = 'journey-toast'; el.setAttribute('role', 'status'); el.textContent = text;
    this.hud.appendChild(el);
    window.setTimeout(() => el.remove(), 2200);
  }

  private render() {
    this.hud.className = `journey-hud journey-${this.page}`;
    if (this.page === 'title') {
      this.hud.innerHTML = `<section class="journey-title-scene" aria-label="Pawnshire title screen"><div class="journey-title-copy"><h1>Pawnshire</h1><p class="journey-title-subtitle">A storybook chess tactics journey</p><div class="journey-title-actions">${this.save ? this.btn('continue', 'Continue', 'primary journey-continue') : ''}${this.btn('new', 'New journey', this.save ? '' : 'primary')}</div></div><p class="journey-title-footnote">The rules of chess never change on the board.</p></section>`;
      return;
    }
    if (!this.save) {
      this.hud.innerHTML = this.onboarding();
      return;
    }
    const save = this.save;
    const current = courseRegion(save.currentRegion) ?? COURSE_REGIONS[0];
    const stars = save.completed.reduce((n, id) => n + 1 + Number(save.stars[id]?.clean ?? false) + Number(save.stars[id]?.noHint ?? false), 0);
    this.hud.classList.toggle('journey-road', current.id === 'r2');
    const header = `<header class="journey-header"><button class="journey-menu" data-action="menu" aria-label="Open journey menu">☰</button><button class="journey-wordmark" data-action="page:map">Pawnshire</button><nav aria-label="Journey navigation">${this.btn('page:map', 'Map', this.page === 'map' ? 'selected' : '')}${this.btn('page:journal', 'Journal', this.page === 'journal' ? 'selected' : '')}${this.btn('page:settings', 'Settings', this.page === 'settings' ? 'selected' : '')}</nav><span class="journey-total" aria-label="${stars} stars earned">★ ${stars}</span></header>`;
    let body = '';
    if (this.page === 'ending' || this.page === 'interlude') {
      const ending = this.page === 'ending';
      const lines = ending ? journeyEnding(save.starter) : finaleInterlude(save.starter);
      body = `<section class="journey-paper journey-story journey-ending"><p class="journey-kicker">${ending ? 'The journey is complete' : 'The Lich King · Between the tables'}</p>
        <img class="journey-ending-companion" src="${import.meta.env.BASE_URL}sprites/${ART[save.starter]}-ally.webp" alt="${esc(STARTERS[save.starter].name)}"/>
        <h1>${ending ? 'A crown worth carrying.' : 'One last table.'}</h1>
        <p class="journey-story-lead">${ending ? 'The Lich King accepts checkmate. The gates open, the banners rise, and the road home belongs to Pawnshire again.' : 'The first encounter is settled. Your companion draws up a chair beside you.'}</p>
        <div class="journey-story-lines">${lines.map(line => `<blockquote><p>${esc(line.line)}</p><cite>${esc(line.speaker)}</cite></blockquote>`).join('')}</div>
        <div class="journey-actions">${ending ? this.btn('page:map', 'Revisit the journey', 'primary') : this.btn(`lesson:${finalEncounter()}`,  'Take your place', 'primary')}${this.btn('page:journal', 'Read your journal')}${ending ? this.btn(`lesson:${finalEncounter()}`,  'Practise the last encounter') : this.btn('page:map', 'Back to the map')}</div>
        ${ending ? `<footer class="journey-credits"><h2>Thank you for playing Pawnshire</h2><p>Keep looking, keep learning, and return whenever you like. Every earlier lesson and your earned stars are still here.</p><p>Published positions and solution lines: <a href="https://database.lichess.org/#puzzles" target="_blank" rel="noopener">Lichess open puzzle database</a>, shared under CC0. Original story and companion notes by Pawnshire.</p><p>Built with Phaser and chess.js. Storybook landscapes created with AI assistance.</p><p>Want to keep learning? <a href="https://lichess.org/practice" target="_blank" rel="noopener">Explore Lichess Practice</a>.</p></footer>` : ''}</section>`;
    } else if (this.page === 'story') {
      const chapter = courseRegion(this.storyRegion)!;
      const nextChapter = COURSE_REGIONS[COURSE_REGIONS.indexOf(chapter) + 1];
      const lines = chapterStory(chapter.id, save.starter);
      const heading = courseCast(chapter.id).endingTitle;
      body = `<section class="journey-paper journey-story"><p class="journey-kicker">${esc(chapter.title)} · Chapter complete</p><h1>${esc(heading)}</h1><p class="journey-story-lead">${esc(chapter.outro)}</p><div class="journey-story-lines">${lines.map(line => `<blockquote><p>${esc(line.line)}</p><cite>${esc(line.speaker)}</cite></blockquote>`).join('')}</div><div class="journey-actions">${nextChapter ? this.btn(`travel:${nextChapter.id}`, `Onward to ${nextChapter.title}`, 'primary') : this.btn('page:map', 'Return to your map', 'primary')}${this.btn('page:journal', 'Read your journal')}</div></section>`;
    } else if (this.page === 'settings') {
      body = `<section class="journey-paper journey-settings"><h1>Make yourself at home</h1><p>Adjust the help and choose your companion. Your lessons and stars stay earned.</p>${this.options()}<div class="journey-actions">${this.btn('page:map', 'Back to the journey', 'primary')}${this.btn('moves', 'Piece movement guide')}${this.btn('page:title', 'Title screen')}</div><hr><h2>A fresh start</h2><p>Reset all lessons and stars in this journey.</p>${this.btn('reset', 'Reset journey', 'quiet')}</section>`;
    } else if (this.page === 'journal') {
      const learned = COURSE_LESSONS.filter(l => save.completed.includes(l.id) && !l.review);
      body = `<section class="journey-paper"><p class="journey-kicker">${esc(STARTERS[save.starter].name)}’s field notes</p><h1>Your chess journal</h1><p>Keep the ideas you have learned close at hand. Examples are free to revisit.</p><nav class="journey-journal-jump" aria-label="Journal chapters">${COURSE_REGIONS.filter(r => learned.some(l => l.regionId === r.id)).map(r => this.btn(`journal:${r.id}`, r.title)).join('')}</nav><div class="journey-notes">${learned.length ? learned.map(l => `<article data-journal-region="${l.regionId}"><p class="journey-kicker">${esc(courseRegion(l.regionId)!.title)}</p><h2>${esc(l.theme)}</h2><p>${esc(l.takeaway)}</p>${this.btn(`example:${l.id}`, 'Watch the example')}</article>`).join('') : `<p class="journey-empty">Finish your first lesson to add its idea here.</p>${this.btn('page:map', 'Find your first lesson', 'primary')}`}</div><footer class="journey-credits"><h2>From real games to your board</h2><p>Positions and solution lines come from the <a href="https://database.lichess.org/#puzzles" target="_blank" rel="noopener">Lichess open puzzle database</a> (CC0). The stories and companion notes are ours. Source links appear after each position.</p><p>Need the basics? <a href="https://lichess.org/learn" target="_blank" rel="noopener">Learn how the pieces move on Lichess</a>.</p></footer></section>`;
    } else {
      const finished = journeyComplete(save);
      const next = COURSE_LESSONS.find(l => !save.completed.includes(l.id) && lessonUnlocked(save, l.id));
      const completedHere = current.lessons.filter(id => save.completed.includes(id)).length;
      const { desktop, phone, phoneHeight } = journeyTrail(current.lessons.length);
      const nodes = current.lessons.map((id, i) => {
        const l = courseLesson(id)!, done = save.completed.includes(id), unlocked = lessonUnlocked(save, id), earned = save.stars[id];
        const isNext = id === next?.id;
        const status = done ? `${1 + Number(earned?.clean ?? false) + Number(earned?.noHint ?? false)} of 3 stars. Completed. Revisit lesson.` : unlocked ? 'Next lesson. Begin.' : 'Locked. Finish the previous lesson.';
        return `<li class="${done ? 'done' : unlocked ? 'available' : 'locked'} ${l.review ? 'review' : ''}" style="--x:${desktop[i][0]}%;--y:${desktop[i][1]}%;--phone-x:${phone[i][0]}%;--phone-y:${phone[i][1]}%"><button data-action="lesson:${id}" aria-label="${esc(`${i + 1}. ${l.title}. ${l.review ? current.kind === 'finale' ? 'Final encounter.' : 'Mixed chapter review.' : l.theme + '.'} ${status}`)}" ${isNext ? 'aria-current="step"' : ''} ${unlocked ? '' : 'aria-disabled="true"'}><span class="journey-stop" aria-hidden="true">${l.review && current.id === 'r1' ? `<img src="${import.meta.env.BASE_URL}sprites/king-bog.webp" alt=""/>` : done ? '✓' : i + 1}</span><span class="journey-node-copy"><strong>${esc(l.title)}</strong><span>${esc(l.review ? current.kind === 'finale' ? 'Final encounter' : 'Mixed chapter review' : l.theme)}</span></span>${done ? `<span class="journey-node-stars" aria-label="${1 + Number(earned?.clean ?? false) + Number(earned?.noHint ?? false)} of 3 stars">★${earned?.clean ? '★' : '☆'}${earned?.noHint ? '★' : '☆'}</span>` : `<span class="journey-node-state">${isNext ? 'Next lesson' : 'Locked'}</span>`}</button></li>`;
      }).join('');
      const chapterDone = completedHere === current.lessons.length;
      body = `<section class="journey-map-heading"><div><p class="journey-kicker">${current.kind === 'finale' ? 'Finale' : `Chapter ${COURSE_REGIONS.indexOf(current) + 1}`}</p><h1>${esc(current.title)}</h1><p>${esc(current.subtitle)}</p></div><div class="journey-map-navigation"><label class="journey-region-picker">Travel the journey<select data-region-picker aria-label="Choose a chapter">${COURSE_REGIONS.map((r, i) => `<option value="${esc(r.id)}" ${r.id === current.id ? 'selected' : ''} ${regionUnlocked(save, r.id) ? '' : 'disabled'}>${r.kind === 'finale' ? 'Finale ·' : `${i + 1}.`} ${esc(r.title)}${regionUnlocked(save, r.id) ? '' : ' · Locked'}</option>`).join('')}</select></label>${next ? this.btn(`lesson:${next.id}`, `Continue: ${next.title}`, 'primary journey-continue') : this.btn('page:journal', 'Open your journal', 'primary')}</div></section>
      ${finished && current.kind === 'finale' ? `<section class="journey-finale" role="status"><span aria-hidden="true">✦ ★ ✦</span><h2>Pawnshire is free.</h2><p>${COURSE_REGIONS.filter(region => region.kind !== 'finale').length} Regions and the Lich King’s final boards are complete. Every lesson remains open for practice.</p>${this.btn('ending', save.endingSeen ? 'See the ending again' : 'See the ending')}</section>` : save.lastResult?.won && courseLesson(save.lastResult.lessonId)?.review && courseRegion(courseLesson(save.lastResult.lessonId)!.regionId)?.kind !== 'finale' ? `<section class="journey-chapter-complete" role="status"><strong>★ ${esc(courseRegion(courseLesson(save.lastResult.lessonId)!.regionId)!.title)} complete!</strong> The next chapter is open.</section>` : ''}
      ${save.lastResult?.interrupted ? '<p class="journey-notice" role="status">Your unfinished attempt ended when you left. Completed lessons and stars are safe; you can retry.</p>' : ''}
      <div class="journey-map" style="--phone-map-height:${phoneHeight}px"><svg class="journey-route" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><polyline class="journey-route-wide" points="${journeyRoute(desktop)}"/><polyline class="journey-route-phone" points="${journeyRoute(phone)}"/></svg><ol class="journey-trail" aria-label="${esc(current.title)} lessons in order">${nodes}</ol><p class="journey-map-caption">${completedHere} of ${current.lessons.length} encounters complete · ${DIFFICULTIES[save.difficulty].label}</p></div>
      <footer class="journey-map-footer"><div class="journey-companion-note"><img src="${import.meta.env.BASE_URL}sprites/${ART[save.starter]}-ally.webp" alt=""/><p><strong>${esc(STARTERS[save.starter].name)}</strong><br>${chapterDone ? esc(current.outro) : esc(current.intro)}</p></div><div class="journey-stars-note">${current.kind === 'finale' ? (!save.finaleComplete && finaleInterludeUnlocked(save) ? this.btn('interlude', 'Read the story so far') : '') : chapterDone ? this.btn(`story:${current.id}`, 'Read the chapter ending') : ''}<p class="journey-help">Stars: complete a lesson, solve cleanly, and solve without hints. Revisit to earn any you missed.</p></div></footer>`;
    }
    const normalUrl = new URL(location.href);
    normalUrl.searchParams.delete('region');
    const previewNotice = previewRegion ? `<p class="journey-notice" role="status"><strong>Region preview.</strong> Earlier chapters are marked complete for testing. Test progress saves separately. <a href="${esc(normalUrl.href)}">Return to normal journey</a>.</p>` : '';
    this.hud.innerHTML = `${header}<div class="journey-content">${previewNotice}${body}</div>`;
    if (this.page === 'ending' && !save.endingSeen) { save.endingSeen = true; persistJourney(save); }
    this.maybeIntro();
  }

  private showMoves(label: string, then: () => void = () => {}) {
    showModal({ title: 'The pieces, at a glance', html: `<div class="journey-moves"><p><strong>King:</strong> one square in any direction. Never move into check.</p><p><strong>Queen:</strong> any distance along a rank, file or diagonal.</p><p><strong>Rook:</strong> any distance straight along a rank or file.</p><p><strong>Bishop:</strong> any distance diagonally.</p><p><strong>Knight:</strong> two squares one way, then one sideways. It can jump over pieces.</p><p><strong>Pawn:</strong> forward one square, or two from its starting square if clear. Capture one square diagonally forward. Reach the last rank to promote.</p><p>Except the knight, pieces cannot jump over other pieces. When your king is in check, your move must make it safe.</p><p>For castling, en passant and interactive practice, visit <a href="https://lichess.org/learn" target="_blank" rel="noopener">Lichess Learn</a>.</p></div>`, buttons: [{ label, kind: 'primary', onClick: then }], onDismiss: then });
  }

  private openSetup() {
    clearJourney();
    this.save = null;
    this.page = 'moves';
    this.rebuild();
    this.hud.scrollTop = 0;
  }

  private confirmNew() {
    if (!this.save) { this.page = 'moves'; this.rebuild(); this.hud.scrollTop = 0; return; }
    showModal({ title: 'Start a new journey?', html: '<p>This clears all lessons and stars in this journey. Earlier campaign and pilot saves are kept.</p>', buttons: [{ label: 'Keep my journey', kind: 'primary', onClick: () => {} }, { label: 'Start a new journey', onClick: () => this.openSetup() }], onDismiss: () => {} });
  }

  private action(action: string) {
    if (action === 'new' || action === 'reset') { this.confirmNew(); return; }
    if (action === 'continue' && this.save) { this.page = endingPending(this.save) ? 'ending' : 'map'; this.rebuild(); this.hud.scrollTop = 0; return; }
    if (action.startsWith('page:')) {
      const page = action.split(':')[1] as Page;
      const setup = ['moves', 'difficulty', 'companion'];
      if (['title', 'setup', 'map', 'journal', 'settings', ...setup].includes(page)) {
        this.page = this.save ? (setup.includes(page) || page === 'setup' ? 'map' : page) : page === 'title' || setup.includes(page) ? page : 'moves';
        this.rebuild(); this.hud.scrollTop = 0;
      }
      return;
    }
    if (action === 'knows') { this.page = 'difficulty'; this.rebuild(); this.hud.scrollTop = 0; return; }
    if (action === 'teach') { this.showMoves('Got it', () => { this.page = 'difficulty'; this.rebuild(); this.hud.scrollTop = 0; }); return; }
    if (action.startsWith('pick:') && !this.save) {
      const d = action.slice(5) as DifficultyId;
      if (!(d in DIFFICULTIES)) return;
      this.difficulty = d; this.page = 'companion'; this.rebuild(); this.hud.scrollTop = 0; return;
    }
    if (action.startsWith('choose:') && !this.save) {
      const t = action.slice(7) as StarterType;
      if (!(t in STARTERS)) return;
      this.starter = t;
      showModal({ eyebrow: STARTERS[t].species, title: STARTERS[t].name,
        html: `<div class="dlg ally journey-greeting"><div class="dlg-pic" style="${portraitStyle(t, 'ally')}"></div><div><p>${esc(COMPANION_GREETINGS[t])}</p></div></div>`,
        buttons: [{ label: `Ride out with ${STARTERS[t].name}`, kind: 'primary', onClick: () => { window.setTimeout(() => { if (this.hud.isConnected && !this.save) this.action('start'); }); } }, { label: 'Choose again', kind: 'ghost', onClick: () => {} }],
        onDismiss: () => {} });
      return;
    }
    if (action === 'start') {
      this.page = 'map';
      this.save = newJourneyForMode(this.difficulty, this.starter); persistJourney(this.save); this.rebuild(); this.hud.scrollTop = 0; return;
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
    if (action === 'moves') { this.showMoves('Ready'); return; }
    if (!this.save) return;
    if (action === 'ending' || action === 'interlude') {
      if (action === 'ending' ? !this.save.finaleComplete : !finaleInterludeUnlocked(this.save)) return;
      this.page = action; this.rebuild(); this.hud.scrollTop = 0; return;
    }
    if (action === 'menu') {
      showModal({ title: 'Your journey', html: `<p>${DIFFICULTIES[this.save.difficulty].label} · ${this.save.completed.length} of ${COURSE_LESSONS.length} encounters complete</p>`, buttons: [{ label: 'Resume', kind: 'primary', onClick: () => {} }, { label: 'Settings', onClick: () => { this.page = 'settings'; this.rebuild(); this.hud.scrollTop = 0; } }, { label: 'Title screen', onClick: () => { this.page = 'title'; this.rebuild(); this.hud.scrollTop = 0; } }], onDismiss: () => {} }); return;
    }
    if (action.startsWith('story:')) {
      const id = action.slice(6);
      if (!courseRegion(id)?.lessons.every(lessonId => this.save!.completed.includes(lessonId))) return;
      this.storyRegion = id; this.page = courseRegion(id)?.kind === 'finale' ? 'ending' : 'story'; this.rebuild(); this.hud.scrollTop = 0; return;
    }
    if (action.startsWith('travel:')) {
      const id = action.slice(7); if (!regionUnlocked(this.save, id)) return;
      this.save.currentRegion = id; this.page = 'map'; persistJourney(this.save); this.rebuild(); this.hud.scrollTop = 0; return;
    }
    if (action.startsWith('region:')) {
      const id = action.split(':')[1]; if (!regionUnlocked(this.save, id)) return;
      this.save.currentRegion = id; persistJourney(this.save); this.rebuild(); if (!isModalOpen()) this.hud.querySelector<HTMLSelectElement>('[data-region-picker]')?.focus(); this.hud.scrollTop = 0; return;
    }
    if (action.startsWith('journal:')) {
      const target = this.hud.querySelector<HTMLElement>(`[data-journal-region="${action.slice(8)}"]`);
      const header = this.hud.querySelector<HTMLElement>('.journey-header');
      if (target) {
        const inset = header && getComputedStyle(header).position === 'sticky' ? header.getBoundingClientRect().height : 0;
        target.style.scrollMarginTop = `${inset + 16}px`;
        target.scrollIntoView({ block: 'start' });
      }
      return;
    }
    if (action.startsWith('lesson:') || action.startsWith('example:')) {
      const id = action.split(':')[1];
      if (!lessonUnlocked(this.save, id)) { this.toast('Finish the lesson before this one to open this path.'); return; }
      goTo(this.game, 'course-play', { lessonId: id, exampleOnly: action.startsWith('example:') }); return;
    }
  }
}
