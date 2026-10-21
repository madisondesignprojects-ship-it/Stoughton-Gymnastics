// Small progressive-enhancement script: header shrink, dropdowns, mobile menu,
// scroll reveal, lightbox, click-to-load map, expand-all, waiver expander, contact form, notice banner.
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header shrink */
const header = $('[data-header]');
const inner = $('[data-header-inner]');
const onScroll = () => {
  const s = window.scrollY > 40;
  header?.classList.toggle('is-scrolled', s);
  if (inner) inner.classList.toggle('lg:h-[64px]', s), inner.classList.toggle('lg:h-[76px]', !s);
  const bar = $('.header-bar');
  if (bar) bar.style.boxShadow = s ? 'var(--shadow-soft)' : '';
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* Desktop dropdowns */
const dds = $$('[data-dropdown]');
const closeAll = (except?: Element) => dds.forEach((d) => { if (d !== except) setDD(d, false); });
function setDD(d: Element, open: boolean) {
  const btn = $<HTMLButtonElement>('[data-dd-btn]', d); const panel = $('[data-dd-panel]', d);
  if (!btn || !panel) return;
  btn.setAttribute('aria-expanded', String(open)); panel.hidden = !open;
  $('svg', btn)?.classList.toggle('rotate-180', open);
}
dds.forEach((d) => {
  const btn = $<HTMLButtonElement>('[data-dd-btn]', d)!;
  btn.addEventListener('click', () => { const o = btn.getAttribute('aria-expanded') !== 'true'; closeAll(d); setDD(d, o); });
  let t: number | undefined;
  d.addEventListener('pointerenter', (e) => { if ((e as PointerEvent).pointerType === 'mouse') { clearTimeout(t); closeAll(d); setDD(d, true); } });
  d.addEventListener('pointerleave', (e) => { if ((e as PointerEvent).pointerType === 'mouse') t = window.setTimeout(() => setDD(d, false), 180); });
  d.addEventListener('focusout', (e) => { if (!d.contains((e as FocusEvent).relatedTarget as Node)) setDD(d, false); });
});
document.addEventListener('click', (e) => { if (!dds.some((d) => d.contains(e.target as Node))) closeAll(); });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = dds.find((d) => $('[data-dd-btn]', d)?.getAttribute('aria-expanded') === 'true');
  if (open) { setDD(open, false); $<HTMLElement>('[data-dd-btn]', open)?.focus(); }
});

/* Mobile menu */
const menu = $('[data-menu]'); const panel = $('[data-menu-panel]'); const backdrop = $('[data-menu-backdrop]');
const opener = $<HTMLButtonElement>('[data-menu-open]'); const sticky = $('[data-sticky-bar]');
function setMenu(open: boolean) {
  if (!menu || !panel || !opener) return;
  if (open) {
    menu.hidden = false; document.body.style.overflow = 'hidden'; if (sticky) sticky.style.display = 'none';
    requestAnimationFrame(() => { panel.classList.remove('translate-x-full'); backdrop?.classList.add('opacity-100'); });
    opener.setAttribute('aria-expanded', 'true');
    setTimeout(() => $<HTMLElement>('[data-menu-close]')?.focus(), reduce ? 0 : 50);
  } else {
    panel.classList.add('translate-x-full'); backdrop?.classList.remove('opacity-100');
    opener.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; if (sticky) sticky.style.display = '';
    setTimeout(() => { menu.hidden = true; }, reduce ? 0 : 300);
    opener.focus();
  }
}
opener?.addEventListener('click', () => setMenu(true));
$('[data-menu-close]')?.addEventListener('click', () => setMenu(false));
backdrop?.addEventListener('click', () => setMenu(false));
menu?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return setMenu(false);
  if (e.key !== 'Tab' || !panel) return;
  const f = $$<HTMLElement>('a[href], button:not([disabled])', panel).filter((el) => el.offsetParent !== null);
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
$$<HTMLButtonElement>('[data-acc-btn]').forEach((b) => b.addEventListener('click', () => {
  const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(o));
  const t = document.getElementById(b.getAttribute('aria-controls')!); if (t) t.hidden = !o;
  $('svg', b)?.classList.toggle('rotate-180', o);
}));
matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches && menu && !menu.hidden) setMenu(false); });

/* Scroll reveal */
const reveals = $$('.reveal');
if (reduce || !('IntersectionObserver' in window)) reveals.forEach((r) => r.classList.add('is-in'));
else {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((r) => io.observe(r));
}

/* Lightbox */
$$('[data-gallery]').forEach((g) => {
  const tiles = $$<HTMLButtonElement>('[data-full]', g);
  const dlg = $<HTMLDialogElement>('dialog', g.parentElement!) ;
  if (!dlg) return;
  const im = $<HTMLImageElement>('[data-lb-img]', dlg)!, cap = $('[data-lb-cap]', dlg)!, cnt = $('[data-lb-count]', dlg)!;
  let i = 0;
  const show = (n: number) => {
    i = (n + tiles.length) % tiles.length; const t = tiles[i];
    im.src = t.dataset.full!; im.alt = t.dataset.alt!; cap.textContent = t.dataset.alt!; cnt.textContent = `${i + 1} / ${tiles.length}`;
  };
  tiles.forEach((t, n) => t.addEventListener('click', () => { show(n); dlg.showModal(); }));
  $('[data-lb-prev]', dlg)?.addEventListener('click', () => show(i - 1));
  $('[data-lb-next]', dlg)?.addEventListener('click', () => show(i + 1));
  $('[data-lb-close]', dlg)?.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target === dlg.firstElementChild) dlg.close(); });
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
  dlg.addEventListener('close', () => tiles[i]?.focus());
  let x0: number | null = null;
  im.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  im.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
});

/* Click-to-load map */
$$<HTMLButtonElement>('[data-map-load]').forEach((b) => b.addEventListener('click', () => {
  const wrap = b.closest('[data-map]') as HTMLElement;
  const f = document.createElement('iframe');
  f.src = wrap.dataset.src!; f.title = wrap.dataset.title!; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
  f.className = 'absolute inset-0 h-full w-full border-0'; f.setAttribute('allowfullscreen', '');
  wrap.querySelector('[data-map-card]')?.remove(); wrap.appendChild(f); f.focus();
}));

/* Expand / collapse all */
$$<HTMLButtonElement>('[data-expand-all]').forEach((b) => b.addEventListener('click', () => {
  const group = $$<HTMLDetailsElement>('details.acc', document.getElementById(b.dataset.expandAll!)!);
  const open = b.getAttribute('aria-pressed') !== 'true';
  group.forEach((d) => (d.open = open)); b.setAttribute('aria-pressed', String(open)); b.textContent = open ? 'Collapse all' : 'Expand all';
}));
// Open the policy targeted by a deep link.
const openHash = () => { const t = location.hash && document.getElementById(location.hash.slice(1)); if (t instanceof HTMLDetailsElement) t.open = true; };
openHash(); addEventListener('hashchange', openHash);

/* Waiver: clamp legal text on phones, print button */
$$('[data-clamp]').forEach((c) => {
  const btn = $<HTMLButtonElement>('[data-clamp-btn]', c.parentElement!);
  c.classList.add('is-clamped');
  btn?.removeAttribute('hidden');
  btn?.addEventListener('click', () => { const o = c.classList.toggle('is-clamped'); btn.setAttribute('aria-expanded', String(!o)); btn.textContent = o ? 'Read the full waiver' : 'Show less'; });
});
$$('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));

/* Contact form (Netlify Forms). On hosts that don't process Netlify Forms (e.g. Vercel),
   the POST returns a non-2xx (405) and the call/email fallback message is shown instead. */
const form = $<HTMLFormElement>('[data-contact-form]');
if (form) {
  const status = $('[data-form-status]', form)!;
  form.setAttribute('novalidate', '');
  const fields = $$<HTMLInputElement | HTMLTextAreaElement>('input[required], textarea[required], input[type=email]', form);
  const validate = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const err = document.getElementById(`${el.id}-error`)!;
    let msg = '';
    if (el.required && !el.value.trim()) msg = `Please enter your ${el.dataset.label}.`;
    else if (el.type === 'email' && el.value && !el.checkValidity()) msg = 'Please enter a valid email address.';
    err.textContent = msg; err.hidden = !msg; el.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  };
  fields.forEach((f) => f.addEventListener('blur', () => validate(f)));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = fields.map(validate).every(Boolean);
    if (!ok) { status.textContent = 'Please fix the highlighted fields.'; (fields.find((f) => f.getAttribute('aria-invalid') === 'true'))?.focus(); return; }
    status.textContent = 'Sending…';
    try {
      const body = new URLSearchParams(new FormData(form) as any).toString();
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!r.ok || r.redirected) throw new Error(String(r.status));
      form.reset(); status.textContent = form.dataset.success!;
    } catch {
      status.textContent = 'Sorry, your message could not be sent. Please call (608) 88 VAULT or email information@stoughtongymnastics.com.';
    }
  });
}

/* Notice banner */
const nb = $('[data-notice]');
if (nb && localStorage.getItem('sg-notice') !== nb.dataset.notice) {
  nb.hidden = false;
  $('[data-notice-close]', nb)?.addEventListener('click', () => { localStorage.setItem('sg-notice', nb.dataset.notice!); nb.hidden = true; });
}

/* Stagger cards */
$$('[data-stagger]').forEach((g) => Array.from(g.children).forEach((c, n) => (c as HTMLElement).style.setProperty('--d', `${n * 60}ms`)));

/* Policies: show everything expanded on desktop (accordions on phones/tablets) */
if (matchMedia('(min-width: 1024px)').matches) {
  $$('[data-desktop-open]').forEach((w) => {
    $$<HTMLDetailsElement>('details.acc', w).forEach((d) => (d.open = true));
    $$<HTMLButtonElement>('[data-expand-all]', w).forEach((b) => { b.setAttribute('aria-pressed', 'true'); b.textContent = 'Collapse all'; });
  });
}
