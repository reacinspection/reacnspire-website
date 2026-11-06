/* Small, progressively enhanced homepage interactions. */
(() => {
  const nav = document.querySelector('.site-nav');
  const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  addEventListener('scroll', updateNav, { passive: true }); updateNav();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('pending-reveal'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('pending-reveal'); observer.observe(el); });
  }
  const overlay = document.getElementById('promoOverlay');
  let returnFocus;
  const originalOpen = window.openPromo, originalClose = window.closePromo;
  window.openPromo = function () { returnFocus = document.activeElement; originalOpen(); overlay.querySelector('.promo-close').focus(); };
  window.closePromo = function () {
    originalClose();
    // Auto-open leaves no trigger to return to; fall back to the persistent reopen link.
    const target = returnFocus && returnFocus.isConnected && returnFocus !== document.body ? returnFocus : document.getElementById('promoReopen');
    if (target) target.focus();
  };
  overlay.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = [...overlay.querySelectorAll('a,button')].filter(el => el.getClientRects().length);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.getElementById('mobileMenu').classList.contains('open')) toggleMenu();
  });
})();
// Keep the dialog's accessible title in the active language.
(() => {
  const originalToggle = window.toggleLang;
  window.toggleLang = function () {
    originalToggle();
    document.getElementById('promoOverlay').setAttribute('aria-labelledby', document.body.classList.contains('es') ? 'promoTitleEs' : 'promoTitle');
  };
})();
