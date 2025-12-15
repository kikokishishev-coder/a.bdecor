// script.js - филтриране на галерията по hash, търсене и прост lightbox
document.addEventListener('DOMContentLoaded', function () {

  // --- Прост lightbox
  (function initLightbox() {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.style.display = 'none';

    const img = document.createElement('img');
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';

    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    function openLightbox(src, alt) {
      img.src = src;
      img.alt = alt || '';
      overlay.style.display = 'flex';
      document.body.classList.add('body-lock');
    }

    function closeLightbox() {
      overlay.style.display = 'none';
      img.src = '';
      document.body.classList.remove('body-lock');
    }

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.style.display === 'flex') closeLightbox();
    });

    window.openLightbox = openLightbox;
  })();

  // --- gallery filtering + hash handling + lightbox hook

  function normalizeCategory(name) {
    if (!name) return '';
    const n = name.toString().trim().toLowerCase();
    const map = {
      'сватба': 'weddings',
      'сватби': 'weddings',
      'svatba': 'weddings',
      'svatbi': 'weddings',
      'wedding': 'weddings',
      'weddings': 'weddings',
      'krushtenie': 'christenings',
      'krushtenia': 'christenings',
      'christening': 'christenings',
      'christenings': 'christenings',
      'party': 'party',
      'all': 'all'
    };
    return map[n] || n;
  }

  function filterGallery(category) {
    const norm = normalizeCategory(category || 'all');
    const items = document.querySelectorAll('.gallery-item');
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
      btn.classList.toggle('active', normalizeCategory(btn.dataset.filter) === norm);
    });

    items.forEach(item => {
      const cats = (item.dataset.category || '').split(',').map(c => normalizeCategory(c));
      if (norm === 'all' || cats.includes(norm)) {
        item.style.display = '';
        item.style.opacity = 0;
        item.style.transform = 'translateY(8px)';
        item.style.transition = 'none';
        requestAnimationFrame(() => {
          item.style.transition = 'opacity 300ms ease, transform 300ms ease';
          item.style.opacity = 1;
          item.style.transform = 'translateY(0)';
        });
      } else {
        item.style.display = 'none';
      }
    });
  }

  // Клик върху бутон филтър
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const cat = this.dataset.filter || 'all';
      const norm = normalizeCategory(cat);
      history.replaceState(null, '', '#' + norm);
      filterGallery(norm);
      const container = document.getElementById('galleryContainer');
      if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // При зареждане и при промяна на hash
  function applyFilterFromHash() {
    const raw = (location.hash || '').replace('#', '');
    const norm = normalizeCategory(raw || 'all');
    filterGallery(norm);
    if (norm !== 'all') {
      const container = document.getElementById('galleryContainer');
      if (container) setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  }

  applyFilterFromHash();
  window.addEventListener('hashchange', applyFilterFromHash);

  // Търсене в галерията по alt текст
  const gallerySearch = document.getElementById('gallerySearch');
  if (gallerySearch) {
    gallerySearch.addEventListener('input', function () {
      const q = this.value.trim().toLowerCase();
      const items = document.querySelectorAll('.gallery-item');
      items.forEach(item => {
        const img = item.querySelector('img');
        const alt = (img && img.alt) ? img.alt.toLowerCase() : '';
        if (!q || alt.includes(q)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Lightbox hook
  const galleryContainer = document.getElementById('gallery');
  if (galleryContainer) {
    galleryContainer.addEventListener('click', function (e) {
      const clickedImg = e.target.closest('img');
      if (!clickedImg) return;
      e.preventDefault();
      const fullSrc = clickedImg.dataset.full || clickedImg.src;
      if (typeof window.openLightbox === 'function') {
        window.openLightbox(fullSrc, clickedImg.alt);
      } else {
        window.open(fullSrc, '_blank');
      }
    });
  }

});

// script.js - филтриране, търсене и модал за единично изображение с описание
document.addEventListener('DOMContentLoaded', function () {

  // --- Филтриране
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const filter = this.dataset.filter || 'all';
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      galleryItems.forEach(item => {
        const cats = (item.dataset.category || '').split(',').map(c => c.trim().toLowerCase());
        if (filter === 'all' || cats.includes(filter.toLowerCase())) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
      // focus to gallery for keyboard users
      const container = document.getElementById('galleryContainer');
      if (container) container.focus();
    });
  });

  // --- Търсене (по alt и по data-caption)
  const searchInput = document.getElementById('gallerySearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const q = this.value.trim().toLowerCase();
      galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const alt = (img && img.alt) ? img.alt.toLowerCase() : '';
        const caption = (item.dataset.caption || '').toLowerCase();
        if (!q || alt.includes(q) || caption.includes(q)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // --- Модал за единично изображение
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // Списък от видими елементи (актуализира се преди навигация)
  function getVisibleItems() {
    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(i => i.offsetParent !== null); // видими в layout
  }

  let currentIndex = -1;

  function openModalForIndex(index) {
    const visible = getVisibleItems();
    if (!visible.length) return;
    if (index < 0) index = 0;
    if (index >= visible.length) index = visible.length - 1;
    currentIndex = index;
    const item = visible[currentIndex];
    const img = item.querySelector('img');
    const src = img.dataset.full || img.src;
    const alt = img.alt || '';
    const caption = item.dataset.caption || alt || '';
    modalImage.src = src;
    modalImage.alt = alt;
    modalCaption.textContent = caption;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('body-lock');
    // focus management
    modalClose.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modalImage.src = '';
    modalImage.alt = '';
    modalCaption.textContent = '';
    document.body.classList.remove('body-lock');
    // return focus to the last opened image if possible
    const visible = getVisibleItems();
    if (visible[currentIndex]) {
      const img = visible[currentIndex].querySelector('img');
      if (img) img.focus();
    }
    currentIndex = -1;
  }

  // Отваряне при клик върху миниатюра
  document.getElementById('galleryContainer').addEventListener('click', function (e) {
    const figure = e.target.closest('.gallery-item');
    if (!figure) return;
    const visible = getVisibleItems();
    const index = visible.indexOf(figure);
    if (index === -1) return;
    openModalForIndex(index);
  });

  // Навигация в модала
  if (prevBtn) prevBtn.addEventListener('click', function () {
    const visible = getVisibleItems();
    if (!visible.length) return;
    openModalForIndex((currentIndex - 1 + visible.length) % visible.length);
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    const visible = getVisibleItems();
    if (!visible.length) return;
    openModalForIndex((currentIndex + 1) % visible.length);
  });

  // Затваряне
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    }
  });

  // Достъпност: направи миниатюрите фокусируеми
  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
      img.setAttribute('tabindex', '0');
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // симулираме клик
          item.click();
        }
      });
    }
  });

});

// modal-gallery.js - отваряне на единична снимка с описание, навигация и клавишни събития
document.addEventListener('DOMContentLoaded', function () {

  const galleryContainer = document.getElementById('galleryContainer');
  if (!galleryContainer) return;

  // Modal елементи
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // Вземаме всички gallery-item (живеят в DOM)
  function allGalleryItems() {
    return Array.from(document.querySelectorAll('.gallery-item'));
  }

  // Връща видимите (нескрити) елементи в текущия layout
  function getVisibleItems() {
    return allGalleryItems().filter(i => i.offsetParent !== null);
  }

  let currentIndex = -1;

  function openModalForIndex(index) {
    const visible = getVisibleItems();
    if (!visible.length) return;
    if (index < 0) index = 0;
    if (index >= visible.length) index = visible.length - 1;
    currentIndex = index;
    const item = visible[currentIndex];
    const img = item.querySelector('img');
    if (!img) return;
    const src = img.dataset.full || img.src;
    const alt = img.alt || '';
    const caption = (item.dataset.caption && item.dataset.caption.trim()) ? item.dataset.caption : alt;
    modalImage.src = src;
    modalImage.alt = alt;
    modalCaption.textContent = caption;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('body-lock');
    // фокус върху бутона за затваряне за достъпност
    modalClose.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modalImage.src = '';
    modalImage.alt = '';
    modalCaption.textContent = '';
    document.body.classList.remove('body-lock');
    // върни фокуса към последната отворена миниатюра, ако е видима
    const visible = getVisibleItems();
    if (visible[currentIndex]) {
      const img = visible[currentIndex].querySelector('img');
      if (img) img.focus();
    }
    currentIndex = -1;
  }

  // Клик върху миниатюра: намираме нейния индекс сред видимите и отваряме модала
  galleryContainer.addEventListener('click', function (e) {
    const figure = e.target.closest('.gallery-item');
    if (!figure) return;
    const visible = getVisibleItems();
    const index = visible.indexOf(figure);
    if (index === -1) return;
    openModalForIndex(index);
  });

  // Навигация
  if (prevBtn) prevBtn.addEventListener('click', function () {
    const visible = getVisibleItems();
    if (!visible.length) return;
    openModalForIndex((currentIndex - 1 + visible.length) % visible.length);
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    const visible = getVisibleItems();
    if (!visible.length) return;
    openModalForIndex((currentIndex + 1) % visible.length);
  });

  // Затваряне
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  // Клавишни събития
  document.addEventListener('keydown', function (e) {
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevBtn && prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn && nextBtn.click();
    }
  });

  // Направи миниатюрите фокусируеми и отваряй модала при Enter/Space
  allGalleryItems().forEach(item => {
    const img = item.querySelector('img');
    if (img) {
      img.setAttribute('tabindex', '0');
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // симулираме клик върху фигурата
          item.click();
        }
      });
    }
  });

});

javascript:(function(){
  var css = "/* Mobile override */ @media (max-width:900px){ .header-container{flex-direction:column!important;align-items:center!important;gap:8px!important;} nav ul.nav-links{flex-direction:column!important;gap:8px!important;width:100%!important;padding:0 12px!important;} nav ul.nav-links li a{display:block!important;width:100%!important;box-sizing:border-box!important;} .search-container{width:100%!important;justify-content:center!important;margin-top:8px!important;} .logo{font-size:22px!important;text-align:center!important;} form{width:100%!important;max-width:100%!important;padding:0 12px!important;} input.neon-input{width:100%!important;max-width:100%!important;} .gallery-container,.gallery{justify-content:center!important;gap:12px!important;padding:12px!important;} .gallery-item,.gallery-container .gallery-item{width:calc(50% - 12px)!important;height:auto!important;margin:6px!important;} .gallery-item img,.gallery-container .gallery-item img{width:100%!important;height:auto!important;object-fit:cover!important;} .lightbox-overlay img{max-width:95%!important;max-height:85%!important;} header{padding:12px 14px!important;} .content{padding:28px 12px!important;} button,.btn{min-height:44px!important;padding:12px 16px!important;font-size:16px!important;} } @media (max-width:420px){ .gallery-item{width:100%!important;} }";
  var id = 'mobile-override-style';
  var existing = document.getElementById(id);
  if(existing){ existing.parentNode.removeChild(existing); }
  var s = document.createElement('style');
  s.id = id;
  s.appendChild(document.createTextNode(css));
  document.head.appendChild(s);
})();
