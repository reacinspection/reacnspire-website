(() => {
  const reel = document.getElementById('workshop-reel');
  if (!reel) return;
  const photo = document.getElementById('workshop-photo');
  const count = document.getElementById('workshop-count');
  const pause = document.getElementById('workshop-pause');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = motion.matches;
  let visible = false;
  let timer;
  function show(step) {
    index = (index + step + 19) % 19;
    photo.src = `/images/workshop/training-${String(index + 1).padStart(2, '0')}.jpg`;
    photo.alt = `Workshop photo / Foto del taller ${index + 1}`;
    count.textContent = `${index + 1} / 19`;
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && visible && !document.hidden) timer = setInterval(() => show(1), 4500);
    pause.querySelector('[data-lang="en"]').textContent = paused ? 'Play' : 'Pause';
    pause.querySelector('[data-lang="es"]').textContent = paused ? 'Reproducir' : 'Pausar';
    pause.setAttribute('aria-pressed', String(paused));
  }
  function manual(step) { paused = true; show(step); schedule(); }
  document.getElementById('workshop-prev').addEventListener('click', () => manual(-1));
  document.getElementById('workshop-next').addEventListener('click', () => manual(1));
  pause.addEventListener('click', () => { paused = !paused; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; schedule(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(reel);
  schedule();
})();
