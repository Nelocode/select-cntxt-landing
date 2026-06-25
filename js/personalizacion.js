/* ============================================
   PERSONALIZACION.JS — Conversational form + style switcher
   4 interior styles per house model
   ============================================ */

const FORM_PREGUNTAS = [
  {
    num: '01',
    texto: '¿Cuántas habitaciones necesitas?',
    campo: 'habitaciones',
    opciones: ['2', '3', '4', '5 o más'],
  },
  {
    num: '02',
    texto: '¿Trabajas desde casa?',
    campo: 'trabajo',
    opciones: [
      'Sí, necesito una oficina',
      'A veces, con un rincón basta',
      'No',
    ],
  },
  {
    num: '03',
    texto: '¿Tienes hijos o los planeas?',
    campo: 'hijos',
    opciones: [
      'Sí, son parte del diseño',
      'No por ahora',
    ],
  },
  {
    num: '04',
    texto: '¿Hay algún hobby que necesite espacio?',
    campo: 'hobby',
    opciones: ['Música', 'Deporte en casa', 'Taller o estudio', 'Ninguno'],
  },
];

/*
  4 interior styles — images at:
  assets/renders/estilos/{modelo}/{modelo}_int_{file}.jpg
  Example: assets/renders/estilos/bassalto/bassalto_int_tropical.jpg
*/
const ESTILOS = [
  { key: 'tropical',    label: 'Tropical Cálido',       file: 'tropical' },
  { key: 'rustico',     label: 'Rústico Contemporáneo',  file: 'rustico' },
  { key: 'industrial',  label: 'Industrial Natural',     file: 'industrial' },
  { key: 'minimalista', label: 'Minimalismo Silvestre',   file: 'minimalista' },
];

let formPreguntaActual = 0;
let estiloActivo = 'tropical';

/* ── DOM refs ── */
let persQuiz, persQuestionEls, persProgSegs, persSwitcher;

function initPersonalizacion() {
  persQuiz        = document.querySelector('.pers__quiz');
  persQuestionEls = document.querySelectorAll('.pers__question');
  persProgSegs    = document.querySelectorAll('.pers__prog-seg');
  persSwitcher    = document.querySelector('.pers__switcher');

  document.querySelectorAll('.pers__opt').forEach(btn => {
    btn.addEventListener('click', () => {
      handleFormAnswer(parseInt(btn.dataset.q, 10), btn.dataset.campo, btn.dataset.valor, btn);
    });
  });
}

function handleFormAnswer(qi, campo, valor, btn) {
  btn.parentElement.querySelectorAll('.pers__opt').forEach(b => b.classList.remove('is-selected'));
  btn.classList.add('is-selected');

  if (window.SelectNav) {
    window.SelectNav.state.personalizacion[campo] = valor;
  }

  setTimeout(() => {
    qi < FORM_PREGUNTAS.length - 1 ? showFormQuestion(qi + 1) : showSwitcher();
  }, 280);
}

function showFormQuestion(n) {
  formPreguntaActual = n;
  persQuestionEls.forEach((el, i) => el.classList.toggle('is-active', i === n));
  persProgSegs.forEach((seg, i) => {
    seg.classList.toggle('is-done', i < n);
    seg.classList.toggle('is-current', i === n);
  });
}

function showSwitcher() {
  persQuiz.style.display = 'none';

  const modelo = (window.SelectNav && window.SelectNav.state.matchResultado) || 'bassalto';
  const nombre = modelo.charAt(0).toUpperCase() + modelo.slice(1);

  /* Build switcher DOM dynamically */
  const imgWrap = persSwitcher.querySelector('.pers__switcher-img-wrap');
  const tabsWrap = persSwitcher.querySelector('.pers__style-tabs');
  const labelEl = persSwitcher.querySelector('.pers__switcher-label');

  if (labelEl) labelEl.textContent = `Casa ${nombre} — Interior`;

  /* Clear old images and tabs */
  imgWrap.querySelectorAll('.pers__switcher-img').forEach(el => el.remove());
  tabsWrap.innerHTML = '';

  /* Create 4 images + 4 tabs */
  ESTILOS.forEach((est, i) => {
    const img = document.createElement('img');
    img.className = 'pers__switcher-img';
    img.dataset.estilo = est.key;
    img.src = `assets/renders/estilos/${modelo}_int_${est.file}.jpg`;
    img.alt = `Casa ${nombre} — ${est.label}`;
    if (i === 0) img.classList.add('is-active');
    imgWrap.insertBefore(img, imgWrap.querySelector('.pers__switcher-overlay'));

    const tab = document.createElement('button');
    tab.className = 'pers__style-tab';
    tab.dataset.estilo = est.key;
    tab.textContent = est.label;
    if (i === 0) tab.classList.add('is-active');
    tab.addEventListener('click', () => switchEstilo(est.key));
    tabsWrap.appendChild(tab);
  });

  estiloActivo = 'tropical';
  persSwitcher.classList.add('is-active');
}

function switchEstilo(estilo) {
  if (estilo === estiloActivo) return;
  estiloActivo = estilo;

  persSwitcher.querySelectorAll('.pers__switcher-img').forEach(img =>
    img.classList.toggle('is-active', img.dataset.estilo === estilo)
  );
  persSwitcher.querySelectorAll('.pers__style-tab').forEach(tab =>
    tab.classList.toggle('is-active', tab.dataset.estilo === estilo)
  );

  if (window.SelectNav) {
    window.SelectNav.state.personalizacion.estilo = estilo;
  }
}

function resetPersonalizacion() {
  formPreguntaActual = 0;
  estiloActivo = 'tropical';

  if (!persQuiz) initPersonalizacion();

  persQuiz.style.display = 'flex';
  persSwitcher.classList.remove('is-active');

  persQuestionEls.forEach(el => el.classList.remove('is-active'));
  persQuestionEls[0].classList.add('is-active');

  persProgSegs.forEach((seg, i) => {
    seg.classList.toggle('is-current', i === 0);
    seg.classList.remove('is-done');
  });

  document.querySelectorAll('.pers__opt').forEach(b => b.classList.remove('is-selected'));
}

document.addEventListener('DOMContentLoaded', initPersonalizacion);
window.SelectPersonalizacion = { resetPersonalizacion };
