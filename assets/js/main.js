/* ============================================================
   NDS Design Library v1.0 — Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Accordion ────────────────────────────────────────────── */
  // onclick="toggleAccordion(this)" — 모든 accordion 변형 공통
  // trigger 의 nextElementSibling 이 .accordion-content 라고 가정
  window.toggleAccordion = function (btn) {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    var next = !expanded; // 열릴 상태
    btn.setAttribute('aria-expanded', String(next));

    // 콘텐츠 패널: .accordion-content
    var content = btn.nextElementSibling;
    if (content && content.classList.contains('accordion-content')) {
      content.classList.toggle('open', next);
    }

    // 화살표 회전: btn 내부 *__arrow 요소
    var arrow = btn.querySelector('[class*="__arrow"]');
    if (arrow) arrow.style.transform = next ? 'rotate(180deg)' : '';
  };

  /* ── Tab Line / Chip / Bar (공통 is-active 토글) ──────────── */
  // .tab-line, .tab-chip, .tab-bar 내의 버튼 클릭 시 is-active 전환
  var TAB_SELECTORS = [
    '.tab-line',
    '.tab-chip',
    '.tab-chip-acc__chips',
    '.tab-bar'
  ];

  TAB_SELECTORS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (wrap) {
      wrap.addEventListener('click', function (e) {
        var item = e.target.closest(
          '.tab-line__item, .tab-chip__item, .tab-chip-acc__item, .tab-bar__item'
        );
        if (!item || item.disabled || item.classList.contains('is-disabled')) return;

        // 같은 부모 내 형제에서 is-active 제거
        wrap.querySelectorAll('.is-active').forEach(function (el) {
          el.classList.remove('is-active');
        });
        item.classList.add('is-active');
      });
    });
  });

  /* ── Tab Chip Accordion (접기/펼치기) ─────────────────────── */
  document.querySelectorAll('.tab-chip-acc').forEach(function (acc) {
    var toggle = acc.querySelector('.tab-chip-acc__toggle');
    var body   = acc.querySelector('.tab-chip-acc__body');
    if (!toggle || !body) return;

    // body 초기 숨김
    body.style.display = 'none';

    toggle.addEventListener('click', function () {
      var open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'flex';
      toggle.classList.toggle('tab-chip-acc__toggle--open', !open);
    });
  });

  /* ── Switch (label + checkbox 네이티브 동작 지원) ─────────── */
  // .switch__input checkbox 는 네이티브 동작으로 충분
  // switch-font: thumb order CSS로 처리됨 (JS 불필요)

  /* ── Terms (전체동의 / 개별동의 연동) ────────────────────────
     .terms__all 클릭 → 모든 아이템 토글
     .terms__item 클릭 → 해당 아이템 토글 + 전체동의 상태 동기화
  ─────────────────────────────────────────────────────────── */
  document.querySelectorAll('.terms').forEach(function (card) {
    var allRow   = card.querySelector('.terms__all');
    var items    = Array.from(card.querySelectorAll('.terms__item'));
    if (!allRow || items.length === 0) return;

    function setActive(el, state) {
      el.classList.toggle('is-active', state);
      var check = el.querySelector('.terms__check');
      if (check) check.classList.toggle('is-active', state);
    }

    function syncAll() {
      var allChecked = items.every(function (it) {
        return it.classList.contains('is-active');
      });
      setActive(allRow, allChecked);
    }

    // 전체동의 클릭
    allRow.addEventListener('click', function () {
      var willCheck = !allRow.classList.contains('is-active');
      setActive(allRow, willCheck);
      items.forEach(function (it) { setActive(it, willCheck); });
    });

    // 개별 항목 클릭
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        setActive(item, !item.classList.contains('is-active'));
        syncAll();
      });
    });
  });

  /* ── Popup ────────────────────────────────────────────────── */
  window.openPopup = function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('popup--open');
    document.body.style.overflow = 'hidden';
  };

  window.closePopup = function (overlayEl) {
    if (typeof overlayEl === 'string') overlayEl = document.getElementById(overlayEl);
    if (!overlayEl) return;
    overlayEl.classList.remove('popup--open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-popup-open]').forEach(function (btn) {
    btn.addEventListener('click', function () { window.openPopup(btn.dataset.popupOpen); });
  });

  document.querySelectorAll('.popup').forEach(function (popup) {
    // 백드롭 클릭 시 닫기
    popup.addEventListener('click', function (e) {
      if (e.target === popup || e.target.classList.contains('popup__backdrop')) {
        window.closePopup(popup);
      }
    });
    // [data-popup-close] 버튼
    popup.querySelectorAll('[data-popup-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { window.closePopup(popup); });
    });
  });

  /* ── Bottomsheet ─────────────────────────────────────────── */
  window.openBottomsheet = function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('bottomsheet--open');
    document.body.style.overflow = 'hidden';
  };

  window.closeBottomsheet = function (el) {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    el.classList.remove('bottomsheet--open');
    if (!document.querySelector('.bottomsheet--open')) {
      document.body.style.overflow = '';
    }
  };

  document.querySelectorAll('[data-bs-open]').forEach(function (btn) {
    btn.addEventListener('click', function () { window.openBottomsheet(btn.dataset.bsOpen); });
  });

  document.querySelectorAll('.bottomsheet').forEach(function (bs) {
    bs.addEventListener('click', function (e) {
      if (e.target.classList.contains('bottomsheet__backdrop')) {
        window.closeBottomsheet(bs);
      }
    });
    bs.querySelectorAll('[data-bs-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { window.closeBottomsheet(bs); });
    });
  });

  // ESC 키
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var open = document.querySelector('.bottomsheet--open');
      if (open) window.closeBottomsheet(open);
    }
  });

  /* ── Toast ────────────────────────────────────────────────── */
  window.showToast = function (text, duration) {
    duration = duration || 2500;
    var wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span class="toast__text">' + text + '</span>';
    wrap.appendChild(toast);

    // 페이드인
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.style.opacity = '1'; });
    });

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(function () { toast.remove(); }, 350);
    }, duration);
  };

  // [data-toast] 버튼
  document.querySelectorAll('[data-toast]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.showToast(btn.dataset.toast || '처리가 완료되었습니다.');
    });
  });

  /* ── Select (드롭다운 트리거 체브론 토글) ────────────────── */
  document.querySelectorAll('.select-field__box').forEach(function (box) {
    box.addEventListener('click', function () {
      var chevron = box.querySelector('.select-field__chevron');
      if (chevron) chevron.classList.toggle('select-field__chevron--up');
    });
  });

  /* ── Chip ─────────────────────────────────────────────────── */
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (chip.classList.contains('is-disabled') || chip.disabled) return;
      chip.classList.toggle('is-active');
    });
  });

  /* ── Indeterminate checkbox ───────────────────────────────── */
  var cbIndet = document.getElementById('cbIndet');
  if (cbIndet) cbIndet.indeterminate = true;

  /* ── Sidebar 스크롤 active 표시 ──────────────────────────── */
  var sections = document.querySelectorAll('.g-section');
  var navLinks = document.querySelectorAll('.g-sidebar nav a');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        var link = document.querySelector('.g-sidebar nav a[href="#' + e.target.id + '"]');
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(function (s) { observer.observe(s); });

  /* ── Tooltip-card 닫기 버튼 ──────────────────────────────── */
  document.querySelectorAll('.tooltip-card__close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.tooltip-card');
      if (card) card.style.display = 'none';
    });
  });

}); // DOMContentLoaded
