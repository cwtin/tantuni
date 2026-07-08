/* ===========================================================
   GEDİZ TANTUNİ — Premium Digital Menu
   script.js
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1) SAYFA AÇILIŞ ANİMASYONU (Loader)
     ========================================================= */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loaded');
    }, 500);
  });
  // Güvenlik: load event geç tetiklenirse yine de kaldır
  setTimeout(() => loader && loader.classList.add('loaded'), 2500);


  /* =========================================================
     2) SCROLL PROGRESS BAR
     ========================================================= */
  const progressBar = document.getElementById('progressBar');

  function updateProgressBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }


  /* =========================================================
     3) SCROLL REVEAL (fade-up on scroll)
     ========================================================= */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  /* =========================================================
     4) STICKY KATEGORİ MENÜSÜ — Aktif sekme takibi
     ========================================================= */
  const menuTabs = document.querySelectorAll('.menu-tab');
  const sections = document.querySelectorAll('.menu-section');
  const menuNav = document.getElementById('menuNav');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        menuTabs.forEach(tab => {
          tab.classList.toggle('active', tab.dataset.target === id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => sectionObserver.observe(sec));

  menuTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const offset = menuNav.offsetHeight + 24;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* =========================================================
     5) MENÜ ARAMA (canlı filtreleme)
     ========================================================= */
  const searchInput = document.getElementById('menuSearch');
  const productCards = document.querySelectorAll('.product-card');
  const noResults = document.getElementById('noResults');

  function filterMenu(query) {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    let visibleCount = 0;

    productCards.forEach(card => {
      const name = card.dataset.name || '';
      const matches = name.includes(q);
      card.classList.toggle('hidden-item', !matches && q.length > 0);
      if (matches || q.length === 0) visibleCount++;
    });

    noResults.classList.toggle('show', visibleCount === 0);
  }

  let searchDebounce;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => filterMenu(e.target.value), 120);
  });


  /* =========================================================
     6) GERİ DÖN (Back to Top) BUTONU
     ========================================================= */
  const backToTop = document.getElementById('backToTop');

  function toggleBackToTop() {
    backToTop.classList.toggle('show', window.scrollY > 600);
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* =========================================================
     7) TEK SCROLL DİNLEYİCİ (performans için birleştirildi)
     ========================================================= */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgressBar();
        toggleBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* =========================================================
     8) RIPPLE EFEKTLİ BUTONLAR
     ========================================================= */
  const rippleEls = document.querySelectorAll('.ripple');

  rippleEls.forEach(el => {
    el.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
      const y = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

      circle.className = 'ripple-circle';
      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = x + 'px';
      circle.style.top = y + 'px';

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });


  /* =========================================================
     9) SMOOTH SCROLL — dahili linkler (hero cta, scroll-down)
     ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (target && !this.classList.contains('menu-tab')) {
        e.preventDefault();
        const offset = target.id === 'menu' || target.closest('.menu-section')
          ? (menuNav ? menuNav.offsetHeight + 24 : 0)
          : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* =========================================================
     9.5) ÜRÜN FOTOĞRAFI YEDEĞİ — dosya henüz yüklenmediyse
     ========================================================= */
  document.querySelectorAll('.product-icon img').forEach(img => {
    img.addEventListener('error', function () {
      const wrap = this.closest('.product-icon');
      if (wrap) {
        wrap.innerHTML = '<span style="font-size:1.3rem;opacity:.35;">🍽️</span>';
      }
    }, { once: true });
  });


  /* =========================================================
     10) LAZY LOADING — görseller için hazır altyapı
     ========================================================= */
  const lazyImages = document.querySelectorAll('img[data-src]');
  if (lazyImages.length) {
    const lazyObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });

    lazyImages.forEach(img => lazyObserver.observe(img));
  }


  /* =========================================================
     11) PINCH ZOOM ENGELLEME (mobil app hissi)
     ========================================================= */
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());

  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

});