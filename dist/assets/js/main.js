/* ============================================================
   NDS Design Library v1.0 — Guide Interactions
   html/index.html 내부에 흩어져 있던 인라인 <script> 블록 및
   이전까지 어디서도 로드되지 않던 assets/js/main.js의 미연결
   기능(Tab 전환, Select 체브론, Tooltip 닫기, 예제 복사버튼)을
   하나로 통합한 파일. (FOUC 방지용 테마 초기화 스크립트만
   html/index.html 상단에 인라인으로 남아있음 — 렌더 전에
   최대한 빨리 실행되어야 하므로 외부 파일 로드를 기다릴 수 없음)
   ============================================================ */

/* ── Finance Bottomsheet tab switching ─────────────── */
  // Finance Bottomsheet tab switching
  document.addEventListener('click', function(e) {
    var tab = e.target.closest('[data-bs-tab] .tab-bar__item[data-tab-target]');
    if (!tab) return;
    var container = tab.closest('[data-bs-tab]');
    // 탭 active 토글
    container.querySelectorAll('.tab-bar__item').forEach(function(t) { t.classList.remove('is-active'); });
    tab.classList.add('is-active');
    // 패널 토글
    var targetId = tab.dataset.tabTarget;
    var body = tab.closest('.bottomsheet__body');
    body.querySelectorAll('[id]').forEach(function(panel) {
      if (panel.id === targetId) {
        panel.style.display = 'grid';
      } else {
        panel.style.display = 'none';
      }
    });
  });

/* ── Tab Line / Chip / Bar — 공통 is-active 전환 ───── */
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

/* ── toggleAccordion — 아코디언 열기/닫기 (문자열 id / 트리거 엘리먼트 두 방식 지원) ─── */
  // toggleAccordion은 두 가지 호출 방식을 모두 지원한다.
  // 1) 문자열 id 방식(BS 캘린더/피커 등 기존 서브 아코디언): toggleAccordion('acc-sub-1', this)
  //    'sub'가 포함된 id → 'chevron'으로 바꾼 id의 엘리먼트를 화살표로 사용, display로 토글
  // 2) 트리거 엘리먼트 방식(accordion-notice/line/box/gray, card__accordion-toggle 등):
  //    onclick="toggleAccordion(this)" — aria-expanded를 토글하고, 화살표 회전은 CSS
  //    ([aria-expanded="true"] 셀렉터)가 처리하므로, 형제 중 첫 .accordion-content에
  //    open 클래스만 토글해주면 된다.
  function toggleAccordion(subIdOrEl, headerEl) {
    if (typeof subIdOrEl === 'string') {
      var sub = document.getElementById(subIdOrEl);
      var chevronId = subIdOrEl.replace('sub', 'chevron');
      var chevron = document.getElementById(chevronId);
      if (!sub) return;
      var isOpen = sub.style.display !== 'none';
      sub.style.display = isOpen ? 'none' : 'block';
      if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      return;
    }

    var trigger = subIdOrEl;
    if (!trigger || !trigger.getAttribute) return;
    var expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!expanded));

    // .accordion-content는 항상 trigger의 형제 요소들 중 하나(사이에 다른 요소가
    // 끼어 있는 경우도 있음, 예: card__subtitle)로 존재 — 순서대로 찾아서 토글
    var el = trigger.nextElementSibling;
    while (el && !el.classList.contains('accordion-content')) {
      el = el.nextElementSibling;
    }
    if (el) el.classList.toggle('open', !expanded);
  }

/* ── optSelectChip — 옵션 칩 선택 ───────────────────── */
  function optSelectChip(el, groupId) {
    var group = document.getElementById(groupId);
    group.querySelectorAll('button').forEach(function(btn) {
      btn.style.borderColor = '#D0D0D0';
      btn.style.color = '#505050';
    });
    el.style.borderColor = '#19973C';
    el.style.color = '#19973C';
  }

/* ── Picker Wheel — 휠 피커 ─────────────────────────── */
  (function() {
    var ITEM_H = 44;
    var PAD_H  = 88; // 2 items

    /**
     * Scroll a column to its selected item and hook scroll → highlight.
     */
    function initPickerCol(col) {
      var isLeft = col.classList.contains('pw-col--left');

      function getItems() {
        return Array.prototype.slice.call(col.querySelectorAll('.pw-item'));
      }

      function highlight() {
        var items = getItems();
        var center = col.scrollTop + col.clientHeight / 2;
        var closest = null, closestDist = Infinity;
        items.forEach(function(item) {
          var itemCenter = item.offsetTop + ITEM_H / 2;
          var dist = Math.abs(center - itemCenter);
          if (dist < closestDist) { closestDist = dist; closest = item; }
        });
        items.forEach(function(item) {
          if (item === closest) {
            item.classList.add('pw-item--selected');
            item.style.fontWeight = '600';
            item.style.color = '#19973C';
            if (isLeft) item.style.justifyContent = 'flex-start';
          } else {
            item.classList.remove('pw-item--selected');
            item.style.fontWeight = '400';
            item.style.color = '#121212';
            if (isLeft) item.style.justifyContent = 'flex-start';
          }
        });
      }

      // Scroll to initial selection
      var selectedText = col.getAttribute('data-pw-selected');
      if (selectedText) {
        var items = getItems();
        for (var i = 0; i < items.length; i++) {
          if (items[i].textContent.trim() === selectedText) {
            // Center this item: scrollTop = itemTop - 2*ITEM_H
            col.scrollTop = items[i].offsetTop - PAD_H;
            break;
          }
        }
      }

      col.addEventListener('scroll', highlight, { passive: true });
      highlight();
    }

    function initPickerInContainer(container) {
      var cols = container.querySelectorAll('.pw-col');
      cols.forEach(function(col) { initPickerCol(col); });
    }

    /**
     * Run on every bottomsheet open.
     * Re-init pickers each time so scroll positions are correct after re-open.
     */
    function onBsOpen(e) {
      var bsId = e && e.target ? e.target.getAttribute('data-bs-open') : null;
      if (!bsId) return;
      var bs = document.getElementById(bsId);
      if (!bs) return;
      // Defer to after transition
      setTimeout(function() {
        initPickerInContainer(bs);
      }, 100);
    }

    // Hook into the open buttons (data-bs-open)
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-bs-open]');
      if (!btn) return;
      var bsId = btn.getAttribute('data-bs-open');
      if (!bsId || !bsId.startsWith('bs-pw-')) return;
      var bs = document.getElementById(bsId);
      if (!bs) return;
      setTimeout(function() { initPickerInContainer(bs); }, 120);
    });

    // Also init on DOMContentLoaded for any pre-opened ones
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.bottomsheet--open .pw-col').forEach(initPickerCol);
    });
  })();

/* ── Picker Calendar — 캘린더 피커 ──────────────────── */
  (function() {
    var CAL_TYPES = {
      'bs-pc-ymd': 'ymd',
      'bs-pc-md':  'md',
      'bs-pc-ym':  'ym'
    };

    // Per-calendar state
    var calStates = {};

    function getToday() {
      var t = new Date();
      return { year: t.getFullYear(), month: t.getMonth(), day: t.getDate() };
    }

    function initState(bsId) {
      var t = getToday();
      calStates[bsId] = {
        year: t.year,
        month: t.month,
        selectedYear: t.year,
        selectedMonth: t.month,
        selectedDay: t.day,
        todayYear: t.year,
        todayMonth: t.month,
        todayDay: t.day
      };
    }

    /* ── Render day calendar (YMD / MD) ────────────────────── */
    function renderDayGrid(bsId) {
      var s = calStates[bsId];
      var type = CAL_TYPES[bsId];
      var year = s.year, month = s.month;
      var firstDay = new Date(year, month, 1).getDay();     // 0=Sun
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var cells = [];
      for (var i = 0; i < firstDay; i++) {
        cells.push('<span class="cal-d cal-d--other"></span>');
      }
      for (var d = 1; d <= daysInMonth; d++) {
        var dow = new Date(year, month, d).getDay();
        var cls = 'cal-d';
        if (dow === 0) cls += ' cal-d--sun';
        if (dow === 6) cls += ' cal-d--sat';
        var isToday = (year === s.todayYear && month === s.todayMonth && d === s.todayDay);
        var isSelected = (year === s.selectedYear && month === s.selectedMonth && d === s.selectedDay);
        if (isSelected) cls += ' cal-d--selected';
        else if (isToday) cls += ' cal-d--today';
        cells.push('<span class="' + cls + '" data-cal-day="' + d + '">' + d + '</span>');
      }
      var gridId = (type === 'md') ? 'cal-grid-md' : 'cal-grid-ymd';
      var grid = document.getElementById(gridId);
      if (grid) {
        grid.innerHTML = cells.join('');
        var dayEls = grid.querySelectorAll('[data-cal-day]');
        for (var j = 0; j < dayEls.length; j++) {
          dayEls[j].addEventListener('click', (function(clickBsId, dayNum) {
            return function() {
              var st = calStates[clickBsId];
              st.selectedYear = st.year;
              st.selectedMonth = st.month;
              st.selectedDay = dayNum;
              renderDayGrid(clickBsId);
            };
          })(bsId, d));
        }
      }
      updateToolbar(bsId);
    }

    /* ── Render month grid (YM) ────────────────────── */
    function renderMonthGrid(bsId) {
      var s = calStates[bsId];
      var cells = [];
      for (var m = 0; m < 12; m++) {
        var cls = 'cal-mo';
        var isToday = (s.year === s.todayYear && m === s.todayMonth);
        var isSelected = (s.year === s.selectedYear && m === s.selectedMonth);
        if (isSelected) cls += ' cal-mo--selected';
        else if (isToday) cls += ' cal-mo--today';
        cells.push('<span class="' + cls + '" data-cal-month="' + m + '">' + (m + 1) + '월</span>');
      }
      var grid = document.getElementById('cal-grid-ym');
      if (grid) {
        grid.innerHTML = cells.join('');
        var moEls = grid.querySelectorAll('[data-cal-month]');
        for (var k = 0; k < moEls.length; k++) {
          moEls[k].addEventListener('click', (function(clickBsId, monthNum) {
            return function() {
              var st = calStates[clickBsId];
              st.selectedYear = st.year;
              st.selectedMonth = monthNum;
              renderMonthGrid(clickBsId);
            };
          })(bsId, m));
        }
      }
      updateToolbar(bsId);
    }

    /* ── Toolbar label update ────────────────────── */
    function updateToolbar(bsId) {
      var s = calStates[bsId];
      if (bsId === 'bs-pc-ymd') {
        var yEl = document.getElementById('cal-ymd-year');
        var mEl = document.getElementById('cal-ymd-month');
        if (yEl) yEl.textContent = s.year;
        if (mEl) mEl.textContent = (s.month + 1);
      } else if (bsId === 'bs-pc-md') {
        var ymEl = document.getElementById('cal-md-ym');
        if (ymEl) ymEl.textContent = s.year + '. ' + (s.month + 1);
      } else if (bsId === 'bs-pc-ym') {
        var yEl2 = document.getElementById('cal-ym-year');
        if (yEl2) yEl2.textContent = s.year;
      }
    }

    function render(bsId) {
      var type = CAL_TYPES[bsId];
      if (type === 'ym') renderMonthGrid(bsId);
      else renderDayGrid(bsId);
    }

    /* ── Event bindings ────────────────────── */
    var todayBtns = document.querySelectorAll('[data-cal-today]');
    for (var ti = 0; ti < todayBtns.length; ti++) {
      todayBtns[ti].addEventListener('click', function() {
        var bsId = this.getAttribute('data-cal-today');
        initState(bsId);
        render(bsId);
      });
    }

    var prevBtns = document.querySelectorAll('[data-cal-prev]');
    for (var pi = 0; pi < prevBtns.length; pi++) {
      prevBtns[pi].addEventListener('click', function() {
        var bsId = this.getAttribute('data-cal-id');
        var unit = this.getAttribute('data-cal-prev');
        var s = calStates[bsId];
        if (unit === 'year') {
          s.year -= 1;
        } else {
          s.month -= 1;
          if (s.month < 0) { s.month = 11; s.year -= 1; }
        }
        render(bsId);
      });
    }

    var nextBtns = document.querySelectorAll('[data-cal-next]');
    for (var ni = 0; ni < nextBtns.length; ni++) {
      nextBtns[ni].addEventListener('click', function() {
        var bsId = this.getAttribute('data-cal-id');
        var unit = this.getAttribute('data-cal-next');
        var s = calStates[bsId];
        if (unit === 'year') {
          s.year += 1;
        } else {
          s.month += 1;
          if (s.month > 11) { s.month = 0; s.year += 1; }
        }
        render(bsId);
      });
    }

    /* ── Init all calendars ────────────────────── */
    for (var bsId2 in CAL_TYPES) {
      if (CAL_TYPES.hasOwnProperty(bsId2)) {
        initState(bsId2);
        render(bsId2);
      }
    }
  })();

/* ── openBottomsheet — 바텀시트 열기/닫기 ──────────── */
  (function () {
    window.openBottomsheet = function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add('bottomsheet--open');
      document.body.style.overflow = 'hidden';
      el.dispatchEvent(new CustomEvent('bs:open', { detail: { id: id } }));
    };

    window.closeBottomsheet = function (el) {
      if (typeof el === 'string') el = document.getElementById(el);
      if (!el) return;
      el.classList.remove('bottomsheet--open');
      if (!document.querySelector('.bottomsheet--open') && !document.querySelector('.popup--open')) {
        document.body.style.overflow = '';
      }
    };

    // 열기 트리거: [data-bs-open="시트ID"]
    document.addEventListener('click', function (e) {
      var openBtn = e.target.closest('[data-bs-open]');
      if (openBtn) {
        window.openBottomsheet(openBtn.getAttribute('data-bs-open'));
        return;
      }
      // 닫기 트리거: [data-bs-close]
      var closeBtn = e.target.closest('[data-bs-close]');
      if (closeBtn) {
        var sheet = closeBtn.closest('.bottomsheet');
        if (sheet) window.closeBottomsheet(sheet);
      }
    });

    // 백드롭 클릭 시 닫기
    document.querySelectorAll('.bottomsheet').forEach(function (bs) {
      var backdrop = bs.querySelector('.bottomsheet__backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', function () { window.closeBottomsheet(bs); });
      }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var open = document.querySelector('.bottomsheet--open');
        if (open) window.closeBottomsheet(open);
      }
    });
  })();

/* ── Sidebar 스크롤 active 표시 ─────────────────────── */
  (function () {
    var navLinks = document.querySelectorAll('.g-sidebar nav a');
    if (!navLinks.length || !window.IntersectionObserver) return;

    // 각 nav 링크(href="#id")가 실제로 가리키는 대상 엘리먼트를 관찰 대상으로 삼는다.
    // (섹션 전체뿐 아니라 g-nav-sub 서브메뉴가 가리키는 서브섹션 wrapper도 포함)
    var navTargets = [];
    navLinks.forEach(function (l) {
      var id = (l.getAttribute('href') || '').slice(1);
      var target = id && document.getElementById(id);
      if (target) navTargets.push(target);
    });
    if (!navTargets.length) return;

    var visible = {};

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });

      // navTargets는 사이드바 링크 순서(= 문서 순서, 상위 섹션 다음 그 하위 서브앵커)로
      // 정렬되어 있으므로, 보이는 것 중 마지막(가장 안쪽/아래쪽) 것을 active로 표시한다.
      var current = null;
      navTargets.forEach(function (t) {
        if (visible[t.id]) current = t;
      });

      if (current) {
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        var link = document.querySelector('.g-sidebar nav a[href="#' + current.id + '"]');
        if (link) link.classList.add('active');
      }
    }, { rootMargin: '-20% 0px -70% 0px' });

    navTargets.forEach(function (t) { observer.observe(t); });
  })();

/* ── Chip Accordion — .chip-accordion__toggle 펼침/접힘 토글 ─── */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.chip-accordion__toggle');
    if (!toggle) return;
    var acc = toggle.closest('.chip-accordion');
    if (acc) acc.classList.toggle('is-open');
  });

/* ── Select — 드롭다운 트리거 체브론 토글 ──────────── */
  document.querySelectorAll('.select-field__box').forEach(function (box) {
    box.addEventListener('click', function () {
      var chevron = box.querySelector('.select-field__chevron');
      if (chevron) chevron.classList.toggle('select-field__chevron--up');
    });
  });

/* ── Tooltip-card 닫기 버튼 ─────────────────────────── */
  document.querySelectorAll('.tooltip-card__close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.tooltip-card');
      if (card) card.style.display = 'none';
    });
  });

/* ── Load Data — 상단 링크 ──────────────────────────── */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('.load-data__top .load-data__link');
    if (!link) return;
    var container = link.closest('.load-data');
    if (!container) return;
    var box = container.querySelector('.load-data__box');
    if (!box || box.hasAttribute('data-loading')) return;

    var original = box.innerHTML;
    box.setAttribute('data-loading', 'true');
    box.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;width:100%;">' +
        '<div class="skeleton" style="width:70px;height:16px;border-radius:4px;flex-shrink:0;"></div>' +
        '<div class="skeleton" style="flex:1;height:20px;border-radius:4px;margin-left:auto;max-width:100px;"></div>' +
      '</div>';

    setTimeout(function () {
      box.innerHTML = original;
      box.removeAttribute('data-loading');
    }, 900);
  });

/* ── Load Data — 하단 링크 ──────────────────────────── */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('.load-data__bottom .load-data__link');
    if (!link) return;
    var container = link.closest('.load-data');
    if (!container) return;
    var msg = container.querySelector('.load-data__message');
    if (!msg) return;
    msg.style.display = (msg.style.display === 'none') ? '' : 'none';
  });

/* ── openPopup — 팝업 열기/닫기 ─────────────────────── */
  (function () {
    window.openPopup = function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add('popup--open');
      document.body.style.overflow = 'hidden';
    };

    window.closePopup = function (el) {
      if (typeof el === 'string') el = document.getElementById(el);
      if (!el) return;
      el.classList.remove('popup--open');
      if (!document.querySelector('.popup--open') && !document.querySelector('.bottomsheet--open')) {
        document.body.style.overflow = '';
      }
    };

    // 열기 트리거: [data-popup-open="팝업ID"]
    document.addEventListener('click', function (e) {
      var openBtn = e.target.closest('[data-popup-open]');
      if (openBtn) {
        window.openPopup(openBtn.getAttribute('data-popup-open'));
        return;
      }
      // 닫기 트리거: [data-popup-close]
      var closeBtn = e.target.closest('[data-popup-close]');
      if (closeBtn) {
        var popup = closeBtn.closest('.popup');
        if (popup) window.closePopup(popup);
      }
    });

    // 백드롭 클릭 시 닫기
    document.querySelectorAll('.popup').forEach(function (popup) {
      var backdrop = popup.querySelector('.popup__backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', function () { window.closePopup(popup); });
      }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var open = document.querySelector('.popup--open');
        if (open) window.closePopup(open);
      }
    });
  })();

/* ── g-example HTML 복사 버튼 ───────────────────────── */
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
