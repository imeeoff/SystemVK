/* =====================================================
   script.js — общий скрипт сайта
   ===================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;

  /* ---------- Тема ---------- */
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.classList.add('theme-anim');
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      setTimeout(function () { root.classList.remove('theme-anim'); }, 500);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'light' ? '#f2f5f8' : '#0e1115');
    });
  }

  /* ---------- Шапка при прокрутке ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Активный пункт меню ---------- */
  var current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a[data-page]').forEach(function (a) {
    if (a.getAttribute('data-page') === current) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- Бургер ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.main-nav');
  function setMenu(open) {
    if (!burger || !nav) return;
    burger.classList.toggle('open', open);
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });
  }

  /* ---------- Модальные окна ---------- */
  var lastOpener = null;

  function openModal(id, opener) {
    var modal = document.getElementById(id);
    if (!modal) return;
    lastOpener = opener || null;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    var first = modal.querySelector('input, textarea');
    if (first) setTimeout(function () { first.focus(); }, 350);
  }

  function closeModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(function (m) {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
    body.classList.remove('modal-open');
    if (lastOpener) { lastOpener.focus(); lastOpener = null; }
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setMenu(false);
      openModal(btn.getAttribute('data-open-modal'), btn);
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModals);
  });
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closeModals(); });
  });

  /* ---------- Уведомление ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3600);
  }

  /* ---------- Формы ---------- */
  document.querySelectorAll('.modal-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var message = form.getAttribute('data-success') || 'Спасибо! Заявка отправлена.';
      form.reset();
      closeModals();
      setTimeout(function () { showToast(message); }, 300);
    });
  });

  /* ---------- Маска телефона ---------- */
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '');
      if (d.charAt(0) === '7' || d.charAt(0) === '8') d = d.slice(1);
      d = d.slice(0, 10);
      if (!d) { input.value = ''; return; }
      var out = '+7 (' + d.slice(0, 3);
      if (d.length >= 3) out += ')';
      if (d.length > 3) out += ' ' + d.slice(3, 6);
      if (d.length > 6) out += '-' + d.slice(6, 8);
      if (d.length > 8) out += '-' + d.slice(8, 10);
      input.value = out;
    });
  });

  /* ---------- Просмотр изображений ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
  }
  if (lightbox && lightboxImg) {
    document.querySelectorAll('[data-lightbox]').forEach(function (img) {
      img.addEventListener('click', function () {
        lightboxImg.src = img.getAttribute('data-lightbox') || img.src;
        lightboxImg.alt = img.alt || '';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        body.classList.add('modal-open');
      });
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.closest('[data-close-lightbox]')) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModals(); closeLightbox(); setMenu(false); }
  });

  /* ---------- Появление при прокрутке ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    reveals.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList.contains('reveal');
      });
      var idx = siblings.indexOf(el);
      el.style.setProperty('--d', Math.min(idx, 4) * 0.09 + 's');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Подсветка карточки за курсором ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
