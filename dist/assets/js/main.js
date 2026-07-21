/* ============================================================
   NDS Design Library v1.0 — Interactions
   ============================================================ */

/* ── Theme (Dark Mode) ────────────────────────────────────────
   #themeToggle 버튼 onclick="toggleTheme()" 로 연결됨.
   <html data-theme="dark|light"> 로 명시 설정 시 시스템 설정보다 우선.
   localStorage 에 사용자 선택을 저장해 새로고침 후에도 유지. */
(function () {
  var STORAGE_KEY = 'nds-theme';
  var root = document.documentElement;

  function effectiveTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit === 'dark' || explicit === 'light') return explicit;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }

  function updateToggleLabel() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.innerHTML = effectiveTheme() === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode';
  }

  // 저장된 설정을 최대한 빨리(페인트 전) 적용해 깜빡임 방지
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved === 'dark' || saved === 'light') {
    root.setAttribute('data-theme', saved);
  }

  window.toggleTheme = function () {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    updateToggleLabel();
  };

  document.addEventListener('DOMContentLoaded', updateToggleLabel);
})();

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

  /* ── Chip Accordion (.js-chip-acc-toggle) ─────────────────── */
  document.querySelectorAll('.js-chip-acc-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var chips = btn.closest('.chip-accordion').querySelector('.chip-accordion__chips');
      if (!chips) return;
      var open = chips.classList.toggle('is-open');
      btn.classList.toggle('is-open', open);
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

  /* ── g-example HTML 복사 ──────────────────────────────────── */
  var COPY_ICON = '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<rect x="0.6" y="3.6" width="7.8" height="7.8" rx="1.2" stroke="currentColor" stroke-width="1.2"/>'
    + '<path d="M3.6 3V2.4A1.2 1.2 0 014.8 1.2h4.8A1.2 1.2 0 0110.8 2.4v4.8A1.2 1.2 0 019.6 8.4H9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>'
    + '</svg>';

  function indentHtml(raw) {
    var lines = raw.split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    var out = [];
    var depth = 0;
    var PAD = '  ';
    lines.forEach(function (line) {
      if (/^<\//.test(line) && !/<[^/]/.test(line)) depth = Math.max(0, depth - 1);
      out.push(PAD.repeat(depth) + line);
      var opens     = (line.match(/<[^/!][^>]*>/g) || []).length;
      var closes    = (line.match(/<\/[^>]+>/g) || []).length;
      var selfClose = (line.match(/<[^>]+\/>/g) || []).length;
      depth += Math.max(0, (opens - selfClose) - closes);
    });
    return out.join('\n');
  }

  function showCopied(btn) {
    btn.innerHTML = COPY_ICON + 'Copied!';
    btn.classList.add('is-copied');
    setTimeout(function () {
      btn.innerHTML = COPY_ICON + 'Copy';
      btn.classList.remove('is-copied');
    }, 2000);
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showCopied(btn); } catch (e) {}
    document.body.removeChild(ta);
  }

  document.querySelectorAll('.g-example').forEach(function (ex) {
    var btn = document.createElement('button');
    btn.className = 'g-copy-btn';
    btn.type = 'button';
    btn.innerHTML = COPY_ICON + 'Copy';
    ex.appendChild(btn);

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var clone = ex.cloneNode(true);
      var cloneBtn = clone.querySelector('.g-copy-btn');
      if (cloneBtn) cloneBtn.remove();

      var raw = clone.innerHTML
        .replace(/^\s+|\s+$/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n');

      var formatted = indentHtml(raw);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(formatted).then(function () {
          showCopied(btn);
        }).catch(function () {
          fallbackCopy(formatted, btn);
        });
      } else {
        fallbackCopy(formatted, btn);
      }
    });
  });

}); // DOMContentLoaded
