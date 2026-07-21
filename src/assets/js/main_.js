// =============================================================================
// NDS — main.js
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Bottomsheet
  // ---------------------------------------------------------------------------
  function openBS(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('bottomsheet--open');
    document.body.style.overflow = 'hidden';
  }

  function closeBS(el) {
    const bs = el instanceof Element ? el : el.closest('.bottomsheet');
    if (!bs) return;
    bs.classList.remove('bottomsheet--open');
    // restore scroll only if no other bottomsheet is open
    if (!document.querySelector('.bottomsheet--open')) {
      document.body.style.overflow = '';
    }
  }

  // Open triggers
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-bs-open]');
    if (btn) { openBS(btn.dataset.bsOpen); return; }

    // Close triggers
    const closeBtn = e.target.closest('[data-bs-close]');
    if (closeBtn) { closeBS(closeBtn); return; }

    // Backdrop click
    if (e.target.classList.contains('bottomsheet__backdrop')) {
      closeBS(e.target.closest('.bottomsheet'));
    }
  });

  // ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const open = document.querySelector('.bottomsheet--open');
      if (open) closeBS(open);
    }
  });

  // ---------------------------------------------------------------------------
  // Sidebar active link (scroll spy — simple version)
  // ---------------------------------------------------------------------------
  const navLinks = Array.from(document.querySelectorAll('.g-sidebar nav a'));
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('is-active'));
          const link = navLinks.find(a => a.getAttribute('href') === '#' + entry.target.id);
          if (link) link.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );
  sections.forEach(s => observer.observe(s));
})();
