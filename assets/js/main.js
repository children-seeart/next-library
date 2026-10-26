/* 내일의 어린이실 아카이브 — 동작
   ① 목차 자동 생성 (섹션이 늘어도 목차를 손으로 고칠 필요 없음)
   ② 현재 읽는 섹션 표시
   ③ 영상 썸네일 → 클릭 시 재생 (초기 로딩 절약) */

(function () {
  'use strict';

  /* ---------- ① 목차 자동 생성 ---------- */
  var list = document.getElementById('navList');
  var toggle = document.getElementById('navToggle');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  sections.forEach(function (sec) {
    var h2 = sec.querySelector('h2');
    if (!h2) return;
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + sec.id;
    a.textContent = h2.textContent.trim();
    li.appendChild(a);
    list.appendChild(li);
  });

  /* 좁은 화면에서는 접어두고, 넓으면 펼쳐둔다 */
  var wide = window.matchMedia('(min-width: 720px)');
  function applyWidth() {
    if (wide.matches) {
      list.hidden = false;
      toggle.hidden = true;
    } else {
      toggle.hidden = false;
      list.hidden = toggle.getAttribute('aria-expanded') !== 'true';
    }
  }
  applyWidth();
  wide.addEventListener('change', applyWidth);

  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    list.hidden = open;
  });

  /* 목차에서 고르면 닫는다 (좁은 화면) */
  list.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && !wide.matches) {
      toggle.setAttribute('aria-expanded', 'false');
      list.hidden = true;
    }
  });

  /* ---------- ② 현재 섹션 표시 ---------- */
  var links = {};
  Array.prototype.forEach.call(list.querySelectorAll('a'), function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
      var current = null;
      sections.forEach(function (sec) { if (seen[sec.id] && !current) current = sec.id; });
      Object.keys(links).forEach(function (id) {
        if (id === current) links[id].setAttribute('aria-current', 'true');
        else links[id].removeAttribute('aria-current');
      });
    }, { rootMargin: '-72px 0px -70% 0px' });
    sections.forEach(function (sec) { io.observe(sec); });
  }

  /* ---------- ③ 영상: 클릭할 때 불러오기 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.video[data-id]'), function (box) {
    var id = box.getAttribute('data-id');
    var btn = box.querySelector('.video__btn');
    if (!btn) return;

    /* 영상 ID가 아직 없으면 자리표시자로 둔다 */
    if (!id) {
      btn.disabled = true;
      btn.style.cursor = 'default';
      return;
    }

    /* 썸네일을 미리 깔아둔다 */
    var thumb = new Image();
    thumb.className = 'video__thumb';
    thumb.alt = '';
    thumb.loading = 'lazy';
    /* 영상마다 있는 썸네일 크기가 달라서 큰 것부터 차례로 시도한다 */
    var sizes = ['maxresdefault', 'sddefault', 'hqdefault'];
    var si = 0;
    thumb.src = 'https://i.ytimg.com/vi/' + id + '/' + sizes[si] + '.jpg';
    thumb.onerror = function () {
      si += 1;
      if (si < sizes.length) thumb.src = 'https://i.ytimg.com/vi/' + id + '/' + sizes[si] + '.jpg';
    };
    /* 404 는 120x90 회색 이미지로 응답하므로 크기로도 걸러낸다 */
    thumb.onload = function () {
      if (thumb.naturalWidth <= 120 && si < sizes.length - 1) {
        si += 1;
        thumb.src = 'https://i.ytimg.com/vi/' + id + '/' + sizes[si] + '.jpg';
      }
    };
    box.insertBefore(thumb, btn);

    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = btn.textContent.trim();
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(f);
    });
  });

  /* ---------- ④ 대표 이미지: 여러 장을 돌아가며 ---------- */
  /* hero-1.jpg 부터 차례로 찾아보고, 실제로 있는 사진만 모아 돌립니다.
     한 장도 없으면 자리표시자를 그대로 둡니다. */
  Array.prototype.forEach.call(document.querySelectorAll('.slides[data-slides]'), function (box) {
    var base = box.getAttribute('data-slides');
    var count = parseInt(box.getAttribute('data-count'), 10) || 5;
    var found = [];
    var left = count;

    for (var i = 1; i <= count; i += 1) {
      (function (n) {
        var im = new Image();
        im.onload = function () { found.push({ n: n, src: im.src }); done(); };
        im.onerror = done;
        im.src = base + n + '.jpg';
      })(i);
    }

    function done() {
      left -= 1;
      if (left > 0) return;
      /* 1번부터 끊기지 않고 이어지는 데까지만 씁니다 */
      found.sort(function (a, b) { return a.n - b.n; });
      var use = [];
      found.forEach(function (f, k) { if (f.n === k + 1) use.push(f); });
      if (!use.length) return;
      build(use);
    }

    function build(list) {
      var frame = document.createElement('div');
      frame.className = 'slides__frame';
      var imgs = list.map(function (f, k) {
        var im = document.createElement('img');
        im.className = 'slides__img';
        im.setAttribute('data-n', f.n);   /* 사진마다 보일 자리를 CSS 로 맞출 수 있게 */
        im.src = f.src;
        im.alt = k === 0 ? '천안두정도서관 내일의 어린이실' : '';
        if (k === 0) im.setAttribute('data-on', '');
        frame.appendChild(im);
        return im;
      });

      var ph = box.querySelector('.ph');
      if (ph) box.removeChild(ph);
      box.insertBefore(frame, box.firstChild);
      if (imgs.length < 2) return;

      /* 좌우 화살표 */
      ['prev', 'next'].forEach(function (way) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slides__arrow';
        b.setAttribute('data-way', way);
        b.setAttribute('aria-label', way === 'prev' ? '이전 사진' : '다음 사진');
        b.innerHTML = way === 'prev' ? '&#8249;' : '&#8250;';
        b.addEventListener('click', function () {
          step(way === 'prev' ? -1 : 1);
          hold = true;
        });
        frame.appendChild(b);
      });

      var dots = document.createElement('div');
      dots.className = 'slides__dots';
      var buttons = imgs.map(function (_, k) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slides__dot';
        b.setAttribute('aria-label', (k + 1) + '번째 사진');
        if (k === 0) b.setAttribute('aria-current', 'true');
        b.addEventListener('click', function () { show(k); hold = true; });
        dots.appendChild(b);
        return b;
      });
      box.insertBefore(dots, box.querySelector('figcaption'));

      var at = 0;
      var hold = false;
      function show(k) {
        imgs[at].removeAttribute('data-on');
        buttons[at].removeAttribute('aria-current');
        at = k;
        imgs[at].setAttribute('data-on', '');
        buttons[at].setAttribute('aria-current', 'true');
      }

      function step(d) { show((at + d + imgs.length) % imgs.length); }

      /* 움직임을 줄여 달라고 한 환경에서는 저절로 넘기지 않습니다 */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      box.addEventListener('mouseenter', function () { hold = true; });
      box.addEventListener('mouseleave', function () { hold = false; });
      box.addEventListener('focusin', function () { hold = true; });
      setInterval(function () {
        if (hold || document.hidden) return;
        step(1);
      }, 5000);
    }
  });

  /* 사진 격자 넘겨보기 — 휴대폰에서만 보이는 화살표와 점을 달아 줍니다.
     넘기는 동작은 CSS 스크롤 스냅이 맡고, 여기서는 버튼과 점만 맞춥니다. */
  Array.prototype.forEach.call(document.querySelectorAll('.grid-3[data-swipe]'), function (grid) {
    var imgs = grid.querySelectorAll('img');
    if (imgs.length < 2) return;
    var box = document.createElement('div');
    box.className = 'swipe';
    grid.parentNode.insertBefore(box, grid);
    box.appendChild(grid);

    function current() { return Math.round(grid.scrollLeft / grid.clientWidth); }
    function go(k) {
      k = (k + imgs.length) % imgs.length;
      grid.scrollTo({ left: imgs[k].offsetLeft - grid.offsetLeft, behavior: 'smooth' });
    }

    ['prev', 'next'].forEach(function (way) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slides__arrow';
      b.setAttribute('data-way', way);
      b.setAttribute('aria-label', way === 'prev' ? '이전 사진' : '다음 사진');
      b.innerHTML = way === 'prev' ? '&#8249;' : '&#8250;';
      b.addEventListener('click', function () { go(current() + (way === 'prev' ? -1 : 1)); });
      box.appendChild(b);
    });

    var dots = document.createElement('div');
    dots.className = 'slides__dots';
    var buttons = Array.prototype.map.call(imgs, function (_, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slides__dot';
      b.setAttribute('aria-label', (k + 1) + '번째 사진');
      if (k === 0) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { go(k); });
      dots.appendChild(b);
      return b;
    });
    box.appendChild(dots);

    grid.addEventListener('scroll', function () {
      var k = current();
      buttons.forEach(function (b, i) {
        if (i === k) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    }, { passive: true });
  });
})();
