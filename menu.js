/* =====================================================================
   ASISTENTE DE TURNOS (especialidadesturnos.html)
   ---------------------------------------------------------------------
   Requiere que antes se carguen:
     - datos-medicos.js  -> DATA (especialidades y médicos)
     - api-turnos.js     -> api y CONFIG (conexión con el backend)

   Pasos: 1 DNI -> 2 Especialidad -> 3 Médico -> 4 Fecha y hora -> 5 Confirmar.
   El DNI SIEMPRE se pide primero.

   PRESELECCIÓN DESDE LA PÁGINA DE INICIO
   Los botones de index.html abren esta página con parámetros en la URL:
     especialidadesturnos.html?especialidad=cardiologia
         -> después del DNI salta directo a elegir médico (paso 3).
     especialidadesturnos.html?medico=gerardo-palacio
         -> después del DNI salta directo a fecha y hora (paso 4).
   "especialidad" es el nombre sin acentos, en minúsculas y con guiones
   (ver normalizar()). "medico" es el campo "id" de datos-medicos.js.
   Si el parámetro no coincide con ningún dato, se ignora y se sigue
   el recorrido normal.
   ===================================================================== */

// ===== UTILIDADES =====
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// "Cirugía General" -> "cirugia-general"
function normalizar(texto) {
  return String(texto)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function aHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Fecha local en formato "AAAA-MM-DD" (no usar toISOString: usa UTC)
function fechaISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// "AAAA-MM-DD" -> "DD/MM/AAAA"
function formatearFecha(iso) {
  return iso.split('-').reverse().join('/');
}

// "AAAA-MM-DD" -> "jueves 5 de noviembre"
function formatearFechaLarga(iso) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia)
    .toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(',', '');
}

function icono(clase) {
  return `<i class="bi ${clase}"></i>`;
}

// Permite activar con teclado (Enter / Espacio) elementos que no son <button>
function hacerClickeable(el, accion) {
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.addEventListener('click', accion);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); accion(); }
  });
}

// Animación de entrada escalonada para elementos generados por JS
function animarEntrada(el, indice) {
  el.classList.add('wiz-anim-item');
  el.style.setProperty('--i', indice);
}

function sacudir(el) {
  if (!el) return;
  el.classList.remove('wiz-shake');
  void el.offsetWidth; // reinicia la animación
  el.classList.add('wiz-shake');
}

// Foto del médico, o su letra si no tiene foto o la foto no carga
function crearAvatar(doc) {
  const letra = document.createElement('div');
  letra.className = 'wiz-doc-avatar';
  letra.textContent = doc.avatar;
  if (!doc.foto) return letra;

  const img = document.createElement('img');
  img.className = 'wiz-doc-avatar wiz-doc-photo';
  img.src = doc.foto;
  img.alt = doc.name;
  img.loading = 'lazy';
  img.onerror = () => img.replaceWith(letra);
  return img;
}

function buscarEspecialidad(valor) {
  const buscado = normalizar(valor);
  return Object.keys(DATA.doctors).find(nombre => normalizar(nombre) === buscado) || null;
}

// Devuelve { specialty, doctor } o null. Si el médico atiende en varias
// especialidades, se prioriza "especialidadPreferida".
function buscarMedico(id, especialidadPreferida) {
  const buscado = normalizar(id);
  const especialidades = Object.keys(DATA.doctors);
  if (especialidadPreferida) {
    especialidades.sort((a, b) => (b === especialidadPreferida) - (a === especialidadPreferida));
  }
  for (const specialty of especialidades) {
    const doctor = DATA.doctors[specialty].find(d => d.id === buscado);
    if (doctor) return { specialty, doctor };
  }
  return null;
}

// Horarios de atención de un médico para una fecha (sin los ya pasados si es hoy)
function generarHorarios(doctor, date) {
  const rango = doctor.hours[date.getDay()];
  if (!rango) return [];

  const inicio = aMinutos(rango[0]);
  const fin = aMinutos(rango[1]);
  const ahora = new Date();
  const esHoy = fechaISO(date) === fechaISO(ahora);
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  const horarios = [];
  for (let m = inicio; m < fin; m += CONFIG.duracionTurnoMin) {
    if (esHoy && m <= minutosAhora) continue;
    horarios.push(aHora(m));
  }
  return horarios;
}

// ===== ESTADO DEL ASISTENTE =====
let currentStep = 1;
const totalSteps = 5;
const formData = { dni: '', specialty: '', doctor: null, date: '', time: '' };
let preseleccion = { specialty: '', doctor: null };

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('specialtyGrid')) return; // no es la página de turnos

  leerPreseleccion();
  renderSpecialties();
  setupEventListeners();
});

function leerPreseleccion() {
  const params = new URLSearchParams(window.location.search);
  const specialty = params.get('especialidad') ? buscarEspecialidad(params.get('especialidad')) : null;
  const encontrado = params.get('medico') ? buscarMedico(params.get('medico'), specialty) : null;

  if (encontrado) {
    preseleccion = { specialty: encontrado.specialty, doctor: encontrado.doctor };
  } else if (specialty) {
    preseleccion = { specialty, doctor: null };
  }

  const aviso = document.getElementById('preselectInfo');
  if (!aviso || !preseleccion.specialty) return;

  aviso.innerHTML = preseleccion.doctor
    ? `${icono('bi-person-badge')} Turno con <strong>${escaparHTML(preseleccion.doctor.name)}</strong> · ${escaparHTML(preseleccion.specialty)}`
    : `${icono('bi-heart-pulse')} Especialidad: <strong>${escaparHTML(preseleccion.specialty)}</strong>`;
  aviso.hidden = false;
}

function setupEventListeners() {
  const dniInput = document.getElementById('dniInput');
  dniInput.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    document.getElementById('dniError').innerHTML = '';
    e.target.classList.remove('is-invalid');
  });

  document.getElementById('nextFromDni').addEventListener('click', continuarDesdeDni);
  document.getElementById('dniForm').addEventListener('submit', e => {
    e.preventDefault();
    continuarDesdeDni();
  });
}

// ===== RENDERIZADO =====
function renderSpecialties() {
  const grid = document.getElementById('specialtyGrid');
  grid.innerHTML = '';

  Object.keys(DATA.specialties).forEach((name, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wiz-spec-btn';
    btn.textContent = name;
    btn.dataset.specialty = name;
    btn.onclick = () => selectSpecialty(name, btn);
    animarEntrada(btn, i);
    grid.appendChild(btn);
  });
}

function renderDoctors(specialty) {
  const list = document.getElementById('doctorList');
  list.innerHTML = '';

  (DATA.doctors[specialty] || []).forEach((doc, i) => {
    const card = document.createElement('div');
    card.className = 'wiz-doc-card';
    if (formData.doctor && formData.doctor.id === doc.id) card.classList.add('selected');

    card.innerHTML = `
      <div class="wiz-doc-info">
        <div class="wiz-doc-name">${escaparHTML(doc.name)}</div>
        <div class="wiz-doc-spec">${escaparHTML(specialty)}${doc.notes ? ' · ' + escaparHTML(doc.notes) : ''}</div>
        <div class="wiz-doc-schedule">${escaparHTML(doc.schedule)}</div>
      </div>
    `;

    card.prepend(crearAvatar(doc));

    hacerClickeable(card, () => selectDoctor(doc, card));
    animarEntrada(card, i);
    list.appendChild(card);
  });
}

function renderAvailableDays() {
  const container = document.getElementById('daysGrid');
  const hint = document.getElementById('daysHint');
  const hoursSection = document.getElementById('hoursSection');

  container.innerHTML = '';
  hoursSection.style.display = 'none';
  formData.date = '';
  formData.time = '';
  ocultarSolicitud();
  if (!formData.doctor) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let availableCount = 0;

  for (let i = 0; i < CONFIG.diasABuscar && availableCount < CONFIG.maxDiasMostrados; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (generarHorarios(formData.doctor, date).length === 0) continue;

    const chip = document.createElement('div');
    chip.className = 'wiz-day-chip';
    chip.innerHTML = `
      <span class="wiz-day-name">${DIAS_CORTOS[date.getDay()]}</span>
      <span class="wiz-day-number">${date.getDate()}</span>
      <span class="wiz-day-month">${MESES_CORTOS[date.getMonth()]}</span>`;
    hacerClickeable(chip, () => selectDay(date, chip));
    animarEntrada(chip, availableCount);
    container.appendChild(chip);
    availableCount++;
  }

  if (availableCount === 0) {
    hint.innerHTML = `${icono('bi-x-circle')} Sin disponibilidad en los próximos ${CONFIG.diasABuscar} días`;
    hint.style.color = '#dc3545';
  } else {
    hint.textContent = `Próximos ${availableCount} días disponibles`;
    hint.style.color = '#888';
  }
}

async function renderTimeSlots() {
  const container = document.getElementById('timeSlots');
  const error = document.getElementById('datetimeError');
  const doctor = formData.doctor;
  const fecha = formData.date;
  if (!doctor || !fecha) return;

  container.innerHTML = '';
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const horarios = generarHorarios(doctor, new Date(anio, mes - 1, dia));

  let ocupados = [];
  try {
    ocupados = await api.obtenerTurnosOcupados(doctor.id, fecha);
  } catch (err) {
    error.innerHTML = `${icono('bi-exclamation-triangle-fill')} No pudimos consultar los horarios. Intentá nuevamente.`;
    return;
  }
  // El usuario pudo cambiar de día mientras se esperaba la respuesta
  if (formData.date !== fecha || formData.doctor !== doctor) return;

  horarios.forEach((time, i) => {
    const slot = document.createElement('div');
    slot.className = 'wiz-time-slot';
    slot.textContent = time;
    animarEntrada(slot, i);

    if (ocupados.includes(time)) {
      slot.classList.add('disabled');
      slot.setAttribute('aria-disabled', 'true');
      slot.title = 'Horario no disponible';
    } else {
      if (time === formData.time) slot.classList.add('selected');
      hacerClickeable(slot, () => selectTime(time, slot));
    }
    container.appendChild(slot);
  });

  // Si el horario elegido ya no está disponible (lo tomó otro paciente), se descarta
  if (formData.time && (ocupados.includes(formData.time) || !horarios.includes(formData.time))) {
    formData.time = '';
  }
  document.getElementById('requestTurnBtn').classList.toggle('d-none', !formData.time);
}

// ===== SELECCIONES =====
function selectSpecialty(name, btn) {
  document.querySelectorAll('.wiz-spec-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  if (formData.specialty !== name) formData.doctor = null;
  formData.specialty = name;
  document.getElementById('selectedSpecialtyName').textContent = name;

  setTimeout(() => changeStep(3), 300);
}

function selectDoctor(doc, card) {
  document.querySelectorAll('.wiz-doc-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');

  formData.doctor = doc;
  document.getElementById('selectedDoctorName').textContent = doc.name;

  setTimeout(() => changeStep(4), 300);
}

function selectDay(date, chip) {
  document.querySelectorAll('.wiz-day-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');

  formData.date = fechaISO(date);
  formData.time = '';
  ocultarSolicitud();
  document.getElementById('datetimeError').innerHTML = '';
  document.getElementById('selectedDayLabel').textContent =
    `${DIAS_CORTOS[date.getDay()]} ${date.getDate()} de ${MESES_CORTOS[date.getMonth()]}`;

  const hoursSection = document.getElementById('hoursSection');
  hoursSection.style.display = 'block';
  renderTimeSlots();
  setTimeout(() => hoursSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 200);
}

function selectTime(time, slot) {
  document.querySelectorAll('.wiz-time-slot').forEach(s => s.classList.remove('selected'));
  slot.classList.add('selected');

  formData.time = time;
  document.getElementById('datetimeError').innerHTML = '';
  document.getElementById('requestTurnBtn').classList.remove('d-none');
}

// Oculta el botón "Continuar" del paso 4
function ocultarSolicitud() {
  document.getElementById('requestTurnBtn').classList.add('d-none');
}

// Marca en el paso 2 la especialidad elegida (útil al volver atrás)
function marcarEspecialidadSeleccionada() {
  document.querySelectorAll('.wiz-spec-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.specialty === formData.specialty);
  });
}

// ===== NAVEGACIÓN ENTRE PASOS =====
function prevStep() {
  if (currentStep > 1) changeStep(currentStep - 1);
}

function changeStep(target) {
  const currentSlide = document.getElementById(`slide-${currentStep}`);
  const targetSlide = document.getElementById(`slide-${target}`);
  if (currentSlide) currentSlide.classList.remove('active');
  if (targetSlide) {
    targetSlide.classList.add('active');
    targetSlide.scrollTop = 0;
  }

  document.querySelectorAll('.wiz-step').forEach(step => {
    const num = parseInt(step.dataset.step, 10);
    step.classList.remove('active', 'completed');
    if (num < target) step.classList.add('completed');
    else if (num === target) step.classList.add('active');
  });

  const stepper = document.querySelector('.wiz-stepper');
  stepper.style.setProperty('--progress', `${((target - 1) / (totalSteps - 1)) * 100}%`);

  if (target === 2) marcarEspecialidadSeleccionada();
  if (target === 3) renderDoctors(formData.specialty);
  // Al volver desde el paso 5 se conservan el día y el horario elegidos
  if (target === 4 && currentStep < 4) renderAvailableDays();
  if (target === 4 && currentStep === 5) renderTimeSlots();

  currentStep = target;
  mantenerAsistenteVisible();
}

// Si el asistente quedó fuera de la vista (por ejemplo en celulares), lo acerca
function mantenerAsistenteVisible() {
  const wrapper = document.querySelector('.wizard-wrapper');
  const header = document.querySelector('.header-turnos');
  const alturaHeader = header ? header.offsetHeight : 0;
  const top = wrapper.getBoundingClientRect().top;

  if (top < alturaHeader || top > window.innerHeight * 0.35) {
    window.scrollTo({ top: window.scrollY + top - alturaHeader - 12, behavior: 'smooth' });
  }
}

// ===== PASO 1: DNI =====
function validarFormatoDni() {
  const dniInput = document.getElementById('dniInput');
  const error = document.getElementById('dniError');
  const dni = dniInput.value.trim();

  let mensaje = '';
  if (dni.length < 7) mensaje = 'Ingresá tu DNI (7 a 9 dígitos)';
  else if (!/^\d{7,9}$/.test(dni)) mensaje = 'El DNI debe tener entre 7 y 9 números';

  if (mensaje) {
    error.innerHTML = `${icono('bi-exclamation-triangle-fill')} ${mensaje}`;
    dniInput.classList.add('is-invalid');
    sacudir(dniInput);
    return null;
  }
  return dni;
}

async function continuarDesdeDni() {
  const dni = validarFormatoDni();
  if (!dni) return;

  const dniInput = document.getElementById('dniInput');
  const error = document.getElementById('dniError');
  const btn = document.getElementById('nextFromDni');
  const textoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `${icono('bi-hourglass-split')} Verificando...`;

  let registrado;
  try {
    registrado = await api.verificarPaciente(dni);
  } catch (err) {
    error.innerHTML = `${icono('bi-exclamation-triangle-fill')} No pudimos verificar tu DNI. Intentá nuevamente.`;
    return;
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }

  if (!registrado) {
    error.innerHTML = `
      ${icono('bi-x-circle-fill')} DNI no registrado <br>
      <a href="https://wa.me/${CONFIG.whatsappContacto}" target="_blank" rel="noopener" class="btn-wsp">
        ${icono('bi-whatsapp')} Contactar por WhatsApp
      </a>`;
    dniInput.classList.add('is-invalid');
    sacudir(dniInput);
    return;
  }

  error.innerHTML = '';
  dniInput.classList.remove('is-invalid');
  formData.dni = dni;
  irDespuesDelDni();
}

// Después del DNI se saltean los pasos que ya se eligieron en el inicio
function irDespuesDelDni() {
  if (preseleccion.specialty) {
    formData.specialty = preseleccion.specialty;
    document.getElementById('selectedSpecialtyName').textContent = preseleccion.specialty;
  }

  if (preseleccion.doctor) {
    formData.doctor = preseleccion.doctor;
    document.getElementById('selectedDoctorName').textContent = preseleccion.doctor.name;
    changeStep(4);
  } else if (preseleccion.specialty) {
    changeStep(3);
  } else {
    changeStep(2);
  }
}

// ===== PASO 5: CONFIRMACIÓN =====
function validarFechaHora() {
  const error = document.getElementById('datetimeError');
  if (!formData.date || !formData.time) {
    error.innerHTML = `${icono('bi-exclamation-triangle-fill')} Seleccioná un día y un horario`;
    return false;
  }
  error.innerHTML = '';
  return true;
}

// Completa el resumen y pasa al paso 5
function showConfirmCard() {
  if (!validarFechaHora()) return;

  const fechaLarga = formatearFechaLarga(formData.date);
  document.getElementById('cAvatar').replaceChildren(crearAvatar(formData.doctor));
  document.getElementById('cDoctor').textContent = formData.doctor.name;
  document.getElementById('cSpecialty').textContent = formData.specialty;
  document.getElementById('cDate').textContent = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1);
  document.getElementById('cTime').textContent = `${formData.time} hs`;
  document.getElementById('cDni').textContent = formData.dni;
  document.getElementById('confirmError').innerHTML = '';

  mostrarVistaConfirmacion(false);
  changeStep(5);
}

// Alterna dentro del paso 5 entre el resumen y la pantalla de éxito
function mostrarVistaConfirmacion(exito) {
  document.getElementById('confirmView').classList.toggle('d-none', exito);
  document.getElementById('successView').classList.toggle('d-none', !exito);
  document.getElementById('slide-5').scrollTop = 0;
}

async function confirmAppointment() {
  const btn = document.getElementById('confirmTurnBtn');
  const error = document.getElementById('confirmError');
  const textoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `${icono('bi-hourglass-split')} Guardando...`;

  try {
    await api.guardarTurno({
      dni: formData.dni,
      especialidad: formData.specialty,
      medicoId: formData.doctor.id,
      medicoNombre: formData.doctor.name,
      fecha: formData.date,
      hora: formData.time
    });
  } catch (err) {
    // Por ejemplo, si otro paciente tomó el horario: "Cambiar horario"
    // vuelve al paso 4, donde los horarios se recargan.
    error.innerHTML = `${icono('bi-exclamation-triangle-fill')} ${escaparHTML(err.message || 'No se pudo guardar el turno. Intentá nuevamente.')}`;
    return;
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }

  generarPDF();

  document.getElementById('sFecha').textContent = formatearFechaLarga(formData.date);
  document.getElementById('sHora').textContent = formData.time;
  // Espacio no separable para que "Dr." no quede solo al final de una línea
  document.getElementById('sMedico').textContent = formData.doctor.name.replace(/^(\S+\.) /, '$1\u00a0');
  mostrarVistaConfirmacion(true);

  // La barra de progreso queda completa
  document.querySelector('.wiz-step[data-step="5"]').classList.replace('active', 'completed');
}

function generarPDF() {
  if (!window.jspdf) return; // la librería no cargó (sin internet)
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Comprobante de Turno Médico", 20, 20);

  doc.setFontSize(12);
  doc.text(`DNI: ${formData.dni}`, 20, 40);
  doc.text(`Especialidad: ${formData.specialty}`, 20, 50);
  doc.text(`Médico: ${formData.doctor.name}`, 20, 60);
  doc.text(`Fecha: ${formatearFecha(formData.date)}`, 20, 70);
  doc.text(`Hora: ${formData.time}`, 20, 80);
  doc.text("Por favor asistir 10 minutos antes del turno.", 20, 100);
  doc.text("Centro Médico Palacio", 20, 115);

  doc.save(`Turno_${formData.dni}.pdf`);
}

// Vuelve al paso 1 con todo vacío (también descarta la preselección del inicio)
function resetWizard() {
  // Oculta el paso actual sin transición para que no se superponga con el paso 1
  const currentSlide = document.getElementById(`slide-${currentStep}`);
  if (currentSlide) {
    currentSlide.style.transition = 'none';
    currentSlide.classList.remove('active');
  }

  Object.assign(formData, { dni: '', specialty: '', doctor: null, date: '', time: '' });
  preseleccion = { specialty: '', doctor: null };
  history.replaceState(null, '', window.location.pathname);

  document.getElementById('dniInput').value = '';
  document.getElementById('preselectInfo').hidden = true;
  document.querySelectorAll('.wiz-spec-btn, .wiz-doc-card, .wiz-time-slot, .wiz-day-chip')
    .forEach(el => el.classList.remove('selected'));
  ocultarSolicitud();
  document.getElementById('hoursSection').style.display = 'none';

  void document.body.offsetWidth;
  requestAnimationFrame(() => {
    if (currentSlide) currentSlide.style.transition = '';
    changeStep(1);
    mostrarVistaConfirmacion(false);
  });
}

/* =====================================================================
   PÁGINA ANTIGUA (TurnosPagina.html): tarjetas desplegables y menú móvil.
   No se usa en especialidadesturnos.html; se deja para no romperla.
   ===================================================================== */
document.querySelectorAll('.btn-toggle').forEach(boton => {
  boton.addEventListener('click', () => {
    const card = boton.closest('.card');
    document.querySelectorAll('.card').forEach(c => {
      if (c !== card) c.classList.remove('active');
    });
    card.classList.toggle('active');
  });
});

(() => {
  const nav = document.querySelector('#nav');
  const abrir = document.querySelector('#abrir');
  const cerrar = document.querySelector('#cerrar');
  if (!nav || !abrir || !cerrar) return;

  abrir.addEventListener('click', () => {
    nav.classList.add('visible');
    abrir.style.display = 'none';
    document.body.style.overflow = 'hidden';
  });

  cerrar.addEventListener('click', () => {
    nav.classList.remove('visible');
    abrir.style.display = 'block';
    document.body.style.overflow = 'auto';
  });
})();
