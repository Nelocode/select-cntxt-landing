/* ============================================
   MATCH.JS — Style quiz · 6 models · 4 questions
   Returns top 3 results, user picks one
   ============================================ */

const PREGUNTAS = [
  {
    num: '01',
    texto: '¿Tu vivienda es para qué clima?',
    opciones: [
      { label: 'Quiero una vivienda diseñada para clima cálido', key: 'A' },
      { label: 'Quiero una vivienda diseñada para clima frío',   key: 'B' },
    ],
  },
  {
    num: '02',
    texto: '¿En qué estilo sueñas tu vivienda?',
    opciones: [
      { label: 'Tropical Cálido',           key: 'A' },
      { label: 'Rústico Contemporáneo',      key: 'B' },
      { label: 'Industrial Natural',         key: 'C' },
      { label: 'Minimalismo Silvestre',       key: 'D' },
    ],
  },
  {
    num: '03',
    texto: '¿Qué forma tiene tu lote?',
    opciones: [
      { label: 'Lote plano',      key: 'A' },
      { label: 'Lote pendiente',   key: 'B' },
      { label: 'No tengo lote',    key: 'C' },
    ],
  },
];

const PUNTOS = [
  { A: { brisa:3, marea:3, cumbre:2 },    B: { bassalto:3, meandro:3, origen:2 } },
  { A: { cumbre:2, brisa:2, marea:1 },    B: { origen:2, meandro:2, bassalto:1 }, C: { meandro:2, bassalto:2, origen:1 }, D: { cumbre:1, brisa:1, marea:2, origen:1 } },
  { A: { bassalto:2, brisa:2, origen:2, marea:2 },  B: { meandro:3, cumbre:2 },  C: { bassalto:1, meandro:1, cumbre:1, brisa:1, origen:1, marea:1 } },
];

const TIEBREAK_ORDER = ['brisa', 'origen', 'marea', 'cumbre', 'meandro', 'bassalto'];

const MODELOS = {
  bassalto: {
    nombre: 'Casa Bassalto',
    area: '65 m²',
    clima: 'Clima frío',
    desc: 'Refugio íntimo entre pinos. Madera oscura, vidrio y conexión total con la montaña.',
    bg: 'assets/renders/match/bassalto_ext_base.jpg',
  },
  meandro: {
    nombre: 'Casa Meandro',
    area: '130 m²',
    clima: 'Clima templado',
    desc: 'Dos volúmenes en ladera. Dramático, elevado, con ventanales que enmarcan el bosque.',
    bg: 'assets/renders/match/meandro_ext_base.jpg',
  },
  cumbre: {
    nombre: 'Casa Cumbre',
    area: '130 m²',
    clima: 'Clima templado',
    desc: 'Planta lineal con lamas de madera cálida. Ligera, integrada al paisaje tropical.',
    bg: 'assets/renders/match/cumbre_ext_base.jpg',
  },
  brisa: {
    nombre: 'Casa Brisa',
    area: '185 m²',
    clima: 'Clima cálido',
    desc: 'Pabellón abierto. Acero, vidrio y madera donde el jardín y la sala son lo mismo.',
    bg: 'assets/renders/match/brisa_ext_base.jpg',
  },
  origen: {
    nombre: 'Casa Origen',
    area: '120 m²',
    clima: 'Clima templado',
    desc: 'Piedra, concreto claro y celosías de madera. Arquitectura noble y atemporal.',
    bg: 'assets/renders/match/origen_ext_base.jpg',
  },
  marea: {
    nombre: 'Casa Marea',
    area: '120 m²',
    clima: 'Clima cálido',
    desc: 'Gran cubierta volada y piedra. Ventilación natural y sombra generosa.',
    bg: 'assets/renders/match/marea_ext_base.jpg',
  },
};

/* ── State ── */
let respuestas = [];
let preguntaActual = 0;
let seleccionada = null;

/* ── DOM refs ── */
let quizEl, questionEls, progSegs, loadingEl, revealEl;

function initMatch() {
  quizEl      = document.querySelector('.match__quiz');
  questionEls = document.querySelectorAll('.match__question');
  progSegs    = document.querySelectorAll('.match__prog-seg');
  loadingEl   = document.querySelector('.match__loading');
  revealEl    = document.querySelector('.match__reveal');

  document.querySelectorAll('.match__opt, .match__swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      selectOption(parseInt(btn.dataset.q, 10), btn.dataset.key, btn);
    });
  });

  document.querySelectorAll('.match__q-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const qi = parseInt(btn.dataset.q, 10);
      if (respuestas[qi]) {
        qi < PREGUNTAS.length - 1 ? showQuestion(qi + 1) : showLoading();
      }
    });
  });

  const backBtn = document.querySelector('.match__reveal-back');
  if (backBtn) backBtn.addEventListener('click', resetMatch);

  document.getElementById('match-prev')?.addEventListener('click', () => goToSlide(carouselIndex - 1));
  document.getElementById('match-next')?.addEventListener('click', () => goToSlide(carouselIndex + 1));
  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => goToLightboxSlide(lightboxIndex - 1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => goToLightboxSlide(lightboxIndex + 1));
}

function selectOption(qi, key, btn) {
  btn.parentElement.querySelectorAll('.match__opt, .match__swatch').forEach(s => s.classList.remove('is-selected'));
  btn.classList.add('is-selected');
  respuestas[qi] = key;

  // Show background image for this option
  const question = btn.closest('.match__question');
  const bgImg = question.querySelector('.match__q-bg');
  const imgSrc = bgImg.dataset[`bg${key}`];
  const isSwatch = btn.classList.contains('match__swatch');

  if (imgSrc) {
    if (bgImg.src.includes(imgSrc)) return;
    if (isSwatch) {
      bgImg.src = imgSrc;
      bgImg.classList.add('is-visible');
    } else {
      bgImg.classList.remove('is-visible');
      setTimeout(() => {
        bgImg.src = imgSrc;
        bgImg.onload = () => bgImg.classList.add('is-visible');
        if (bgImg.complete) bgImg.classList.add('is-visible');
      }, 300);
    }
  } else {
    bgImg.classList.remove('is-visible');
  }

  // Enable "Siguiente" button
  const nextBtn = question.querySelector('.match__q-next');
  if (nextBtn) {
    nextBtn.disabled = false;
    question.querySelector('.match__q-footer').classList.add('is-visible');
  }
}

function showQuestion(n) {
  preguntaActual = n;
  questionEls.forEach((el, i) => el.classList.toggle('is-active', i === n));
  progSegs.forEach((seg, i) => {
    seg.classList.toggle('is-done', i < n);
    seg.classList.toggle('is-current', i === n);
  });

  // Preload swatch images when entering P2
  if (n === 1) {
    const bg = questionEls[1].querySelector('.match__q-bg');
    ['A','B','C','D'].forEach(k => {
      const src = bg.dataset[`bg${k}`];
      if (src) { const img = new Image(); img.src = src; }
    });
  }
}

function calcularTop3() {
  const score = { bassalto:0, meandro:0, cumbre:0, brisa:0, origen:0, marea:0 };
  respuestas.forEach((key, i) => {
    const pts = PUNTOS[i][key];
    if (pts) Object.entries(pts).forEach(([m, v]) => { score[m] += v; });
  });

  return Object.entries(score)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return TIEBREAK_ORDER.indexOf(b[0]) - TIEBREAK_ORDER.indexOf(a[0]);
    })
    .slice(0, 3)
    .map(([key]) => key);
}

function showLoading() {
  quizEl.style.display = 'none';
  loadingEl.classList.add('is-active');
  setTimeout(() => {
    loadingEl.classList.remove('is-active');
    showReveal(calcularTop3());
  }, 1500);
}

const HOUSE_SPECS = {
  bassalto: { area: '65 m²',  hab: '3', banos: '2.5', ext: ['bassalto_ext_base.jpg','bassalto_ext2.jpg','bassalto_ext3.jpg'] },
  meandro:  { area: '130 m²', hab: '3', banos: '3',   ext: ['meandro_ext_base.jpg','meandro_ext2.jpg','meandro_ext3.jpg'] },
  cumbre:   { area: '130 m²', hab: '2', banos: '3',   ext: ['cumbre_ext_base.jpg','cumbre_ext2.jpg'] },
  brisa:    { area: '185 m²', hab: '2', banos: '3',   ext: ['brisa_ext_base.jpg','brisa_ext2.jpg'] },
  origen:   { area: '120 m²', hab: '3', banos: '4',   ext: ['origen_ext_base.jpg','origen_ext2.jpg','origen_ext3.jpg'] },
  marea:    { area: '120 m²', hab: '2', banos: '3',   ext: ['marea_ext_base.jpg','marea_ext2.jpg','marea_ext3.jpg'] },
};

const ESTILO_KEYS = { A: 'tropical', B: 'rustico', C: 'industrial', D: 'minimalista' };

let carouselIndex = 0;
let carouselResults = [];
let carouselTouchX = 0;
let lightboxIndex = 0;
let lightboxImages = [];
let lightboxTouchX = 0;

function showReveal(top2) {
  carouselResults = top2.slice(0, 3);
  carouselIndex = 0;

  const carousel = document.getElementById('match-carousel');
  const dotsWrap = document.getElementById('match-reveal-dots');
  carousel.innerHTML = '';
  dotsWrap.innerHTML = '';

  const estiloKey = ESTILO_KEYS[respuestas[1]] || 'tropical';

  carouselResults.forEach((key, i) => {
    const m = MODELOS[key];
    const s = HOUSE_SPECS[key];

    const slide = document.createElement('div');
    slide.className = 'match__slide';
    slide.dataset.model = key;
    slide.innerHTML = `
      <img class="match__slide-img" src="${m.bg}" alt="${m.nombre}" />
      <div class="match__slide-overlay"></div>
      ${i === 0 ? '<span class="match__slide-badge">Mejor match</span>' : ''}
      <div class="match__slide-info">
        <h3 class="match__slide-nombre">${m.nombre}</h3>
        <p class="match__slide-meta">${s.area} · ${s.hab} hab · ${s.banos} baños · ${m.clima}</p>
        <p class="match__slide-desc">${m.desc}</p>
        <p class="match__slide-tap">Toca para ver galería</p>
      </div>
    `;

    const galleryImgs = [
      ...s.ext.map(f => `assets/renders/match/${f}`),
      `assets/renders/estilos/${key}_int_${estiloKey}.jpg`,
    ];
    slide.addEventListener('click', () => openLightbox(galleryImgs, m.nombre));
    carousel.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = 'match__reveal-dot';
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });

  carousel.addEventListener('touchstart', (e) => { carouselTouchX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - carouselTouchX;
    if (Math.abs(dx) < 50) return;
    dx < 0 ? goToSlide(carouselIndex + 1) : goToSlide(carouselIndex - 1);
  }, { passive: true });

  document.getElementById('match-prev').classList.add('is-hidden');
  if (window.SelectNav) {
    window.SelectNav.state.matchResultado = carouselResults[0];
  }

  revealEl.classList.add('is-active');

  const waBubble = document.getElementById('wa-bubble');
  if (waBubble) waBubble.style.display = 'flex';
}

function goToSlide(n) {
  if (n < 0 || n >= carouselResults.length) return;
  carouselIndex = n;

  const carousel = document.getElementById('match-carousel');
  const slide = carousel.querySelector('.match__slide');
  if (!slide) return;
  const slideW = slide.offsetWidth;
  const gap = parseInt(getComputedStyle(carousel).gap) || 0;
  carousel.style.transform = `translateX(-${n * (slideW + gap)}px)`;

  document.querySelectorAll('.match__reveal-dot').forEach((d, i) => d.classList.toggle('is-active', i === n));
  document.getElementById('match-prev').classList.toggle('is-hidden', n === 0);
  document.getElementById('match-next').classList.toggle('is-hidden', n === carouselResults.length - 1);

  if (window.SelectNav) {
    window.SelectNav.state.matchResultado = carouselResults[n];
  }
}

/* ── Lightbox ── */
function openLightbox(images, alt) {
  lightboxImages = images;
  lightboxIndex = 0;

  const lightbox = document.getElementById('match-lightbox');
  const track = document.getElementById('lightbox-track');
  const dots = document.getElementById('lightbox-dots');

  track.innerHTML = '';
  dots.innerHTML = '';

  const messages = [
    'Elige tu estilo.\nNosotros diseñamos.',
    'Precio fijo.\nSin sorpresas.',
    'Tu casa.\nTu método.',
  ];
  const positions = ['top-right', 'bottom-left', 'top-right', 'bottom-left'];
  const shuffled = [...messages].sort(() => Math.random() - 0.5);

  images.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'match__lightbox-slide';
    let cardHTML = '';
    if (i < shuffled.length) {
      const pos = positions[i % positions.length];
      cardHTML = `<div class="lightbox__msg lightbox__msg--${pos}">${shuffled[i].replace('\n','<br>')}</div>`;
    }
    slide.innerHTML = `<img src="${src}" alt="${alt}" />${cardHTML}`;
    slide.querySelector('img').addEventListener('click', (e) => {
      e.stopPropagation();
      e.target.classList.toggle('is-zoomed');
    });
    track.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = 'match__lightbox-dot';
    if (i === 0) dot.classList.add('is-active');
    dots.appendChild(dot);
  });

  track.style.transform = 'translateX(0)';

  track.addEventListener('touchstart', (e) => { lightboxTouchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - lightboxTouchX;
    if (Math.abs(dx) < 50) return;
    goToLightboxSlide(dx < 0 ? lightboxIndex + 1 : lightboxIndex - 1);
  }, { passive: true });

  document.getElementById('lightbox-prev').classList.add('is-hidden');
  document.getElementById('lightbox-next').classList.toggle('is-hidden', images.length <= 1);

  lightbox.classList.add('is-open');
}

function goToLightboxSlide(n) {
  if (n < 0 || n >= lightboxImages.length) return;
  lightboxIndex = n;
  document.getElementById('lightbox-track').style.transform = `translateX(-${n * 100}%)`;
  document.querySelectorAll('.match__lightbox-dot').forEach((d, i) => d.classList.toggle('is-active', i === n));
  document.getElementById('lightbox-prev').classList.toggle('is-hidden', n === 0);
  document.getElementById('lightbox-next').classList.toggle('is-hidden', n === lightboxImages.length - 1);
}

function closeLightbox() {
  document.getElementById('match-lightbox').classList.remove('is-open');
}

function resetMatch() {
  respuestas = [];
  preguntaActual = 0;
  seleccionada = null;
  if (!quizEl) initMatch();
  quizEl.style.display = 'flex';
  loadingEl.classList.remove('is-active');
  revealEl.classList.remove('is-active');
  questionEls.forEach(el => el.classList.remove('is-active'));
  questionEls[0].classList.add('is-active');
  progSegs.forEach((seg, i) => {
    seg.classList.toggle('is-current', i === 0);
    seg.classList.remove('is-done');
  });
  document.querySelectorAll('.match__opt, .match__swatch').forEach(b => b.classList.remove('is-selected'));
  document.querySelectorAll('.match__q-bg').forEach(bg => { bg.classList.remove('is-visible'); bg.src = ''; });
  document.querySelectorAll('.match__q-next').forEach(btn => btn.disabled = true);
  document.querySelectorAll('.match__q-footer').forEach(f => f.classList.remove('is-visible'));

  const waBubble = document.getElementById('wa-bubble');
  if (waBubble) waBubble.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', initMatch);
window.SelectMatch = { resetMatch, MODELOS };
