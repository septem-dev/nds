/* ============================================================
   NDS Guide — Component Interactions
   guide.js
   ============================================================ */

/* ── Accordion ─────────────────────────────────────────────── */
function toggleAccordion(btn) {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  btn.nextElementSibling.classList.toggle('open', !expanded);
}

/* ── Tab ───────────────────────────────────────────────────── */
document.querySelectorAll('.tab-list').forEach(tabList => {
  tabList.querySelectorAll('.tab__item').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.disabled || tab.classList.contains('tab__item--disabled')) return;
      tabList.querySelectorAll('.tab__item').forEach(t => {
        t.classList.remove('active', 'tab__item--active');
      });
      tab.classList.add('active', 'tab__item--active');

      const target = tab.dataset.tab;
      if (target) {
        const wrap = tabList.closest('[data-tab-group]');
        if (wrap) {
          wrap.querySelectorAll('[data-panel]').forEach(p => {
            p.hidden = p.dataset.panel !== target;
          });
        }
      } else {
        const panel = tabList.nextElementSibling;
        if (panel && panel.classList.contains('tab-panel')) {
          panel.textContent = '"' + tab.textContent.trim() + '" 탭의 콘텐츠 영역입니다.';
        }
      }
    });
  });
});

/* ── Chip ──────────────────────────────────────────────────── */
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    if (chip.classList.contains('chip--disabled')) return;
    chip.classList.toggle('chip--selected');
  });
});

/* ── Filter ────────────────────────────────────────────────── */
document.querySelectorAll('.filter-trigger').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('active'));
});

/* ── Calendar ──────────────────────────────────────────────── */
document.querySelectorAll('.cal-preview').forEach(cal => {
  cal.querySelectorAll('.cal-day:not(.other)').forEach(day => {
    day.addEventListener('click', () => {
      cal.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
      day.classList.add('selected');
    });
  });
});

/* ── Terms ─────────────────────────────────────────────────── */
document.querySelectorAll('.terms').forEach(terms => {
  const allCb   = terms.querySelector('.terms__all input[type=checkbox]');
  const allWrap = terms.querySelector('.terms__all');
  const items   = Array.from(terms.querySelectorAll('.terms__item input[type=checkbox]'));

  function syncAll() {
    const allChecked = items.every(c => c.checked);
    if (allCb) allCb.checked = allChecked;
    if (allWrap) allWrap.classList.toggle('checked', allChecked);
  }

  if (allCb) {
    allCb.addEventListener('change', () => {
      items.forEach(cb => { cb.checked = allCb.checked; });
      if (allWrap) allWrap.classList.toggle('checked', allCb.checked);
    });
  }
  items.forEach(cb => cb.addEventListener('change', syncAll));
});

/* ── Popup ─────────────────────────────────────────────────── */
function openPopup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('popup--open');
  document.body.style.overflow = 'hidden';
}

function closePopup(overlayEl) {
  overlayEl.classList.remove('popup--open');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-popup-open]').forEach(btn => {
  btn.addEventListener('click', () => openPopup(btn.dataset.popupOpen));
});

document.querySelectorAll('.popup-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePopup(overlay);
  });
  overlay.querySelectorAll('[data-popup-close]').forEach(btn => {
    btn.addEventListener('click', () => closePopup(overlay));
  });
});

/* ── Bottomsheet ───────────────────────────────────────────── */
function openBottomsheet(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('bs--open');
  document.body.style.overflow = 'hidden';
}

function closeBottomsheet(overlayEl) {
  overlayEl.classList.remove('bs--open');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-bs-open]').forEach(btn => {
  btn.addEventListener('click', () => openBottomsheet(btn.dataset.bsOpen));
});

document.querySelectorAll('.bs-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeBottomsheet(overlay);
  });
  overlay.querySelectorAll('[data-bs-close]').forEach(btn => {
    btn.addEventListener('click', () => closeBottomsheet(overlay));
  });
});

/* ── Toast ─────────────────────────────────────────────────── */
let _toastContainer = null;

function getToastContainer() {
  if (!_toastContainer) {
    _toastContainer = document.createElement('div');
    _toastContainer.className = 'toast-container--fixed';
    document.body.appendChild(_toastContainer);
  }
  return _toastContainer;
}

const TOAST_ICONS = {
  success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:2px"><polyline points="20,6 9,17 4,12"/></svg>',
  danger:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:2px"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
  info:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  def:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
};

function showToast(opts) {
  var title    = opts.title || '';
  var message  = opts.message || '';
  var type     = opts.type || '';
  var duration = opts.duration || 3000;

  var container = getToastContainer();
  var toast = document.createElement('div');
  toast.className = 'toast' + (type ? ' toast--' + type : '');
  var icon = TOAST_ICONS[type] || TOAST_ICONS.def;
  toast.innerHTML = icon + '<div><div class="toast__title">' + title + '</div><div class="toast__msg">' + message + '</div></div>';
  container.appendChild(toast);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { toast.classList.add('toast--visible'); });
  });
  setTimeout(function() {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', function() { toast.remove(); }, { once: true });
  }, duration);
}

var TOAST_PRESETS = {
  '':       { title: '기본 알림', message: '처리가 완료되었습니다.' },
  success:  { title: '성공',      message: '이체가 완료되었습니다.' },
  danger:   { title: '오류',      message: '처리 중 오류가 발생했습니다.' },
  warning:  { title: '주의',      message: '만기일이 3일 남았습니다.' },
  info:     { title: '안내',      message: '새로운 공지사항이 있습니다.' },
};

document.querySelectorAll('[data-toast]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var type = btn.dataset.toast;
    var cfg  = TOAST_PRESETS[type] || TOAST_PRESETS[''];
    showToast({ title: cfg.title, message: cfg.message, type: type });
  });
});

/* ── Indeterminate checkbox init ───────────────────────────── */
var cbIndet = document.getElementById('cbIndet');
if (cbIndet) cbIndet.indeterminate = true;

/* ── Sidebar active nav on scroll ──────────────────────────── */
var sections  = document.querySelectorAll('.g-section');
var navLinks  = document.querySelectorAll('.g-sidebar nav a');
var navObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      navLinks.forEach(function(l) { l.classList.remove('active'); });
      var link = document.querySelector('.g-sidebar nav a[href="#' + e.target.id + '"]');
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach(function(s) { navObserver.observe(s); });
