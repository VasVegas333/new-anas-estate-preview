const revealElements = document.querySelectorAll('.reveal, .reveal-group');

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
);

revealElements.forEach((element) => revealObserver.observe(element));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function showAllReveals() {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

if (prefersReducedMotion.matches) {
  showAllReveals();
}

prefersReducedMotion.addEventListener('change', () => {
  if (prefersReducedMotion.matches) showAllReveals();
});
