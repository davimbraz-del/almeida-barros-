/* Almeida Barros – interações leves, sem bibliotecas. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------- WhatsApp: mensagem pré-preenchida ----------
     O número fica no href de cada link (https://wa.me/55DDDNUMERO).
     Aqui só acrescentamos o texto de data-wa-msg. */
  $$('a[data-wa-msg]').forEach(function (link) {
    var base = link.getAttribute('href').split('?')[0];
    link.setAttribute('href', base + '?text=' + encodeURIComponent(link.getAttribute('data-wa-msg')));
  });

  /* ---------- Ano no rodapé ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Header: fundo sólido ao rolar ---------- */
  var header = $('[data-header]');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menu mobile ---------- */
  var menuToggle = $('[data-menu-toggle]');
  var menu = $('[data-menu]');
  if (menuToggle && menu) {
    var desktop = window.matchMedia('(min-width: 1024px)');
    var setMenu = function (open, returnFocus) {
      menuToggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      header.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      if (open) {
        var first = $('a', menu);
        if (first) first.focus();
      } else if (returnFocus) {
        menuToggle.focus();
      }
    };
    menuToggle.addEventListener('click', function () {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { if (!desktop.matches) setMenu(false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
    doc.addEventListener('click', function (e) {
      if (menu.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
    });
    var onBreakpoint = function () { if (desktop.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  }

  /* ---------- Tarjas e entradas ao rolar ---------- */
  var animated = $$('[data-tarja], [data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    root.classList.add('reveal-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    animated.forEach(function (el) {
      if (el.id === 'hero-title') return;
      io.observe(el);
    });

    // O título do hero desenha a tarja logo após o carregamento.
    var heroTitle = $('#hero-title');
    if (heroTitle) {
      window.setTimeout(function () { heroTitle.classList.add('is-in'); }, 450);
    }
  }

  /* ---------- Perfis (abas acessíveis) ---------- */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap);
    var panels = tabs.map(function (t) { return doc.getElementById(t.getAttribute('aria-controls')); });

    var select = function (index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        if (on) {
          panels[i].classList.remove('is-entering');
          void panels[i].offsetWidth;
          panels[i].classList.add('is-entering');
        }
      });
      if (focus) {
        tabs[index].focus();
        tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });

    panels.forEach(function (p, i) { p.hidden = i !== 0; });
  });

  /* ---------- Carrossel de avaliações ---------- */
  $$('[data-carousel]').forEach(function (wrap) {
    var track = $('[data-carousel-track]', wrap);
    var prev = $('[data-carousel-prev]', wrap);
    var next = $('[data-carousel-next]', wrap);
    if (!track || !prev || !next) return;

    var step = function () {
      var item = track.firstElementChild;
      if (!item) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    };
    var update = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    };
    var behavior = function () { return reduceMotion.matches ? 'auto' : 'smooth'; };

    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: behavior() }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: behavior() }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Vídeo institucional (carrega o YouTube só ao clicar) ---------- */
  $$('[data-video]').forEach(function (box) {
    var id = (box.getAttribute('data-youtube-id') || '').trim();
    var play = $('[data-video-play]', box);
    var soon = $('[data-video-soon]', box);
    if (!id || !play) return;
    play.hidden = false;
    if (soon) soon.hidden = true;
    play.addEventListener('click', function () {
      var frame = doc.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      frame.title = 'Vídeo institucional da Almeida Barros';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      frame.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(frame);
      frame.focus();
    });
  });

  /* ---------- Mapa (carrega o Google Maps só ao clicar) ---------- */
  $$('[data-map]').forEach(function (box) {
    var query = (box.getAttribute('data-map-query') || '').trim();
    var isPlaceholder = !query || query.indexOf('[') !== -1;
    if (isPlaceholder) query = 'Almeida Barros Corretora de Seguros';
    var link = $('[data-map-link]', box);
    if (link && !isPlaceholder) {
      link.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
    }
    var btn = $('[data-map-load]', box);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var frame = doc.createElement('iframe');
      frame.src = 'https://www.google.com/maps?q=' + encodeURIComponent(query) + '&output=embed';
      frame.title = 'Mapa com a localização da Almeida Barros';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      box.innerHTML = '';
      box.appendChild(frame);
    });
  });

  /* ---------- Widget de dúvidas frequentes ---------- */
  var faqToggle = $('[data-faq-toggle]');
  var faqPanel = $('[data-faq-panel]');
  if (faqToggle && faqPanel) {
    var log = $('[data-faq-log]', faqPanel);
    var title = $('#faq-title');
    var answers = {};
    var tpl = doc.getElementById('faq-answers');
    if (tpl) {
      $$('[data-a]', tpl.content).forEach(function (el) { answers[el.getAttribute('data-a')] = el.innerHTML; });
    }

    var setFaq = function (open, returnFocus) {
      faqPanel.hidden = !open;
      faqToggle.setAttribute('aria-expanded', String(open));
      if (open) {
        title.focus();
      } else if (returnFocus) {
        faqToggle.focus();
      }
    };

    faqToggle.addEventListener('click', function () { setFaq(faqPanel.hidden); });
    $('[data-faq-close]', faqPanel).addEventListener('click', function () { setFaq(false, true); });
    faqPanel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setFaq(false, true);
    });

    var bubble = function (cls, html) {
      var p = doc.createElement('p');
      p.className = 'bubble ' + cls;
      p.innerHTML = html;
      log.appendChild(p);
      log.scrollTop = log.scrollHeight;
      return p;
    };

    $$('[data-faq-q]', faqPanel).forEach(function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.getAttribute('data-faq-q');
        bubble('bubble--me', chip.textContent);
        var reply = function () {
          bubble('bubble--them', answers[key] || '');
          $$('a[href^="#"]', log).forEach(function (a) {
            a.addEventListener('click', function () { setFaq(false); });
          });
        };
        if (reduceMotion.matches) { reply(); return; }
        var typing = bubble('bubble--them bubble--typing', '<span></span><span></span><span></span>');
        typing.setAttribute('aria-hidden', 'true');
        window.setTimeout(function () { typing.remove(); reply(); }, 650);
      });
    });
  }
})();
