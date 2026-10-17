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
    thumb.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
    thumb.onerror = function () { thumb.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; };
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
})();
