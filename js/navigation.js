/* ============================================
   NAVIGATION.JS — Step-based navigation system
   ============================================ */

const STEPS = [
  'hero',
  'cta',
  'match',
  'personalizacion',
  'resumen',
];

const TOTAL = STEPS.length;

/* --- Global state --- */
const state = {
  pasoActual: 0,           // 0-indexed
  matchResultado: null,    // set by match.js
  estiloSeleccionado: null,// set by match.js
  personalizacion: {},     // set by personalizacion.js
};

/* --- DOM refs (resolved on DOMContentLoaded) --- */
let wrapper, progressBar, dots;

/* --- Core: go to step n --- */
function goToStep(n) {
  if (n < 0 || n >= TOTAL) return;

  const prev = state.pasoActual;
  state.pasoActual = n;

  // Slide the wrapper
  wrapper.style.transform = `translateX(-${n * 100}vw)`;

  // Add animation classes
  const steps = wrapper.querySelectorAll('.step');
  steps.forEach((el, i) => {
    el.classList.remove('is-entering', 'is-leaving');
    if (i === n) el.classList.add('is-entering');
    if (i === prev && prev !== n) el.classList.add('is-leaving');
  });

  // Update progress bar (percentage of journey done)
  const pct = ((n) / (TOTAL - 1)) * 100;
  progressBar.style.width = `${pct}%`;

  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.toggle('is-active', i === n);
    dot.classList.toggle('is-done', i < n);
    dot.classList.remove('is-done'); // reset then re-apply
    if (i < n) dot.classList.add('is-done');
    if (i === n) {
      dot.classList.add('is-active');
      dot.classList.remove('is-done');
    }
    if (i > n) {
      dot.classList.remove('is-active', 'is-done');
    }
  });

  // Announce for screen readers
  const stepEl = steps[n];
  stepEl.setAttribute('tabindex', '-1');
  stepEl.focus({ preventScroll: true });

  // Scroll the step to top in case it was scrolled
  stepEl.scrollTop = 0;

  // Trigger section-specific init/reset hooks
  // Init plan selection when entering step 1
  if (n === 1) initPlanes();

  if (n === 2 && window.SelectMatch)           window.SelectMatch.resetMatch();
  if (n === 3 && window.SelectPersonalizacion) window.SelectPersonalizacion.resetPersonalizacion();

  // Populate summary when entering step 4
  if (n === 4) populateResumen();

}

function nextStep() {
  goToStep(state.pasoActual + 1);
}

function prevStep() {
  goToStep(state.pasoActual - 1);
}

/* Swipe and keyboard navigation disabled — steps advance only via buttons */

/* --- Build progress dots --- */
function buildDots(container) {
  STEPS.forEach((id, i) => {
    const dot = document.createElement('span');
    dot.className = 'progress-dot';
    dot.setAttribute('aria-label', `Paso ${i + 1} de ${TOTAL}`);
    container.appendChild(dot);
  });
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  wrapper     = document.getElementById('steps-wrapper');
  progressBar = document.getElementById('progress-bar');
  const dotsContainer = document.getElementById('progress-dots');

  buildDots(dotsContainer);
  dots = dotsContainer.querySelectorAll('.progress-dot');

  // Wire continuar buttons
  document.querySelectorAll('[data-action="next"]').forEach(btn => {
    btn.addEventListener('click', nextStep);
  });

  document.querySelectorAll('[data-action="prev"]').forEach(btn => {
    btn.addEventListener('click', prevStep);
  });

  // Init at step 0
  goToStep(0);
});


/* --- Porque stagger animation (step 1) --- */
function triggerPorqueAnimation() {
  const items  = document.querySelectorAll('.porque__item');
  const footer = document.querySelector('.porque__footer');

  items.forEach(el => el.classList.remove('is-visible'));
  if (footer) footer.classList.remove('is-visible');

  items.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('is-visible');
      if (i === items.length - 1) {
        setTimeout(() => { if (footer) footer.classList.add('is-visible'); }, 400);
      }
    }, 400 + i * 600);
  });
}

/* --- Resumen (step 4) --- */
const CASA_SPECS = {
  bassalto:  { area: '65',  hab: '3', banos: '2.5', niveles: '1', clima: 'Frío' },
  cumbre:    { area: '130', hab: '2', banos: '3',   niveles: '1', clima: 'Templado' },
  origen:    { area: '120', hab: '3', banos: '4',   niveles: '1', clima: 'Templado' },
  meandro:   { area: '130', hab: '3', banos: '3',   niveles: '2', clima: 'Templado' },
  brisa:     { area: '185', hab: '2', banos: '3',   niveles: '1', clima: 'Cálido' },
  marea:     { area: '120', hab: '2', banos: '3',   niveles: '1', clima: 'Cálido' },
};

function populateResumen() {
  const modelo = state.matchResultado;
  if (!modelo || !window.SelectMatch) return;

  const info  = window.SelectMatch.MODELOS[modelo];
  const specs = CASA_SPECS[modelo];
  if (!info || !specs) return;

  const pers = state.personalizacion || {};

  // House image + info
  document.getElementById('resumen-casa-img').src = info.bg;
  document.getElementById('resumen-casa-img').alt = info.nombre;
  document.getElementById('resumen-casa-nombre').textContent = info.nombre;
  document.getElementById('resumen-casa-meta').textContent = `Clima ${specs.clima}`;
  document.getElementById('resumen-casa-desc').textContent = info.desc;
  document.getElementById('resumen-casa-badge').textContent = 'Tu Select';

  // Specs row
  const specsEl = document.getElementById('resumen-specs');
  specsEl.innerHTML = '';
  const specItems = [
    { value: `${specs.area} m²`, label: 'Área' },
    { value: specs.hab, label: 'Habitaciones' },
    { value: specs.banos, label: 'Baños' },
    { value: specs.niveles, label: 'Niveles' },
  ];
  specItems.forEach(({ value, label }) => {
    const li = document.createElement('li');
    li.className = 'resumen__spec';
    li.innerHTML = `<span class="resumen__spec-value">${value}</span><span class="resumen__spec-label">${label}</span>`;
    specsEl.appendChild(li);
  });

  // Interior style
  const estiloKey = pers.estilo || 'tropical';
  const estiloLabels = {
    tropical: 'Tropical Cálido',
    rustico: 'Rústico Contemporáneo',
    industrial: 'Industrial Natural',
    minimalista: 'Minimalismo Silvestre',
  };
  document.getElementById('resumen-estilo-img').src =
    `assets/renders/estilos/${modelo}_int_${estiloKey}.jpg`;
  document.getElementById('resumen-estilo-img').alt =
    `${info.nombre} — ${estiloLabels[estiloKey]}`;
  document.getElementById('resumen-estilo-nombre').textContent =
    estiloLabels[estiloKey] || estiloKey;

  // Profile details
  const habLabels = { '2': '2', '3': '3', '4': '4', '5+': '5 o más' };
  const trabajoLabels = { oficina: 'Sí, necesita oficina', rincon: 'A veces, rincón', no: 'No' };
  const hijosLabels = { si: 'Sí, parte del diseño', no: 'No por ahora' };
  const hobbyLabels = { musica: 'Música', deporte: 'Deporte en casa', taller: 'Taller o estudio', ninguno: 'Ninguno' };

  const items = [
    { label: 'Habitaciones', value: habLabels[pers.habitaciones] || pers.habitaciones || '—' },
    { label: 'Trabajo en casa', value: trabajoLabels[pers.trabajo] || pers.trabajo || '—' },
    { label: 'Hijos', value: hijosLabels[pers.hijos] || pers.hijos || '—' },
    { label: 'Hobby', value: hobbyLabels[pers.hobby] || pers.hobby || '—' },
  ];

  const lista = document.getElementById('resumen-lista');
  lista.innerHTML = '';
  items.forEach(({ label, value }) => {
    const li = document.createElement('li');
    li.className = 'resumen__item';
    li.innerHTML = `<span class="resumen__item-label">${label}</span><span class="resumen__item-value">${value}</span>`;
    lista.appendChild(li);
  });
}

/* --- Plan selection (step 7) --- */
function initPlanes() {
  const planes = document.querySelectorAll('.cta__plan');
  const waLink = document.getElementById('cta-whatsapp');

  planes.forEach(plan => {
    plan.addEventListener('click', () => {
      planes.forEach(p => p.classList.remove('is-selected'));
      plan.classList.add('is-selected');
      updateWhatsAppLink(plan.dataset.plan);
    });
  });

  updateWhatsAppLink(null);
}

function updateWhatsAppLink(planKey) {
  if (planKey) state.planElegido = planKey;

  const planLabels = {
    esencial: 'Esencial',
    avanzado: 'Avanzado',
    premium:  'Premium',
  };

  const plan = planKey || state.planElegido;
  let msg = 'Hola CNTXT, estoy interesad@ en un diseño';
  if (plan && planLabels[plan]) {
    msg += ` ${planLabels[plan]}`;
  }
  msg += ' de Select';

  const encoded = encodeURIComponent(msg);
  const url = `https://wa.me/573104745936?text=${encoded}`;

  // Update ALL WhatsApp links
  const waLink = document.getElementById('cta-whatsapp');
  if (waLink) waLink.href = url;

  const waBubble = document.getElementById('wa-bubble');
  if (waBubble) waBubble.href = url;

  const revealWa = document.querySelector('.match__reveal-wa');
  if (revealWa) revealWa.href = url;
}

/* --- Exports (for match.js, personalizacion.js) --- */
window.SelectNav = { state, goToStep, nextStep, prevStep };
