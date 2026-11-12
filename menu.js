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
   (ver normalizarTexto()). "medico" es el campo "id" de datos-medicos.js.
   Si el parámetro no coincide con ningún dato, se ignora y se sigue
   el recorrido normal.
   ===================================================================== */

// ===== UTILIDADES =====
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// "Cirugía General" -> "cirugia-general"
function normalizarTexto(texto) {
  return String(texto)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Evita que un texto se interprete como HTML
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

// "16:30" -> 990 minutos
function horaAMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// 990 minutos -> "16:30"
function minutosAHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Fecha local en formato "AAAA-MM-DD" (no usar toISOString: usa UTC)
function fechaAFormatoISO(date) {
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

// HTML de un ícono de Bootstrap Icons
function htmlIcono(clase) {
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

// Sacudida corta para marcar un campo con error
function sacudirCampo(el) {
  if (!el) return;
  el.classList.remove('wiz-shake');
  void el.offsetWidth; // reinicia la animación
  el.classList.add('wiz-shake');
}

// Foto del médico, o su letra si no tiene foto o la foto no carga
function crearFotoDelMedico(doc) {
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

// Busca una especialidad por su nombre en la URL ("cirugia-general")
function buscarEspecialidad(valor) {
  const buscado = normalizarTexto(valor);
  return Object.keys(DATA.doctors).find(nombre => normalizarTexto(nombre) === buscado) || null;
}

// Devuelve { specialty, doctor } o null. Si el médico atiende en varias
// especialidades, se prioriza "especialidadPreferida".
function buscarMedico(id, especialidadPreferida) {
  const buscado = normalizarTexto(id);
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

// Franjas de atención de un médico en un día de la semana, en minutos y ordenadas
// (acepta una franja ["16:00", "20:30"] o varias [["08:00", "12:00"], ["16:00", "20:30"]])
function franjasDelDia(doctor, diaSemana) {
  const dato = doctor.hours[diaSemana];
  if (!dato) return [];
  const franjas = Array.isArray(dato[0]) ? dato : [dato];
  return franjas
    .map(([inicio, fin]) => [horaAMinutos(inicio), horaAMinutos(fin)])
    .filter(([inicio, fin]) => inicio < fin)   // descarta franjas mal cargadas
    .sort((a, b) => a[0] - b[0]);
}

// Horarios de atención de un médico para una fecha (sin los ya pasados si es hoy)
function generarHorariosDelDia(doctor, date) {
  const duracion = doctor.duracionMin || CONFIG.duracionTurnoMin;
  const ahora = new Date();
  const esHoy = fechaAFormatoISO(date) === fechaAFormatoISO(ahora);
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  const inicios = new Set(); // Set: un mismo horario nunca aparece dos veces
  let finAnterior = 0;
  for (const [inicio, fin] of franjasDelDia(doctor, date.getDay())) {
    // Si una franja se superpone con la anterior, arranca donde terminó la otra
    // Cada turno debe terminar dentro de la franja (inicio + duración <= fin)
    for (let m = Math.max(inicio, finAnterior); m + duracion <= fin; m += duracion) {
      if (esHoy && m <= minutosAhora) continue;
      inicios.add(m);
    }
    finAnterior = Math.max(finAnterior, fin);
  }
  return [...inicios].sort((a, b) => a - b).map(minutosAHora);
}

// ===== ESTADO DEL ASISTENTE =====
let currentStep = 1;
const totalSteps = 5;
const formData = { dni: '', paciente: null, specialty: '', doctor: null, date: '', time: '' };
let preseleccion = { specialty: '', doctor: null };

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('specialtyGrid')) return; // no es la página de turnos

  leerPreseleccionDeLaURL();
  mostrarEspecialidades();
  configurarEventosDelDni();
});

// Lee ?especialidad= o ?medico= de la URL y muestra el aviso en el paso 1
function leerPreseleccionDeLaURL() {
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
    ? `${htmlIcono('bi-person-badge')} Turno con <strong>${escaparHTML(preseleccion.doctor.name)}</strong> · ${escaparHTML(preseleccion.specialty)}`
    : `${htmlIcono('bi-heart-pulse')} Especialidad: <strong>${escaparHTML(preseleccion.specialty)}</strong>`;
  aviso.hidden = false;
}

// Eventos del campo DNI y del botón "Continuar"
function configurarEventosDelDni() {
  const dniInput = document.getElementById('dniInput');
  dniInput.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    document.getElementById('dniError').innerHTML = '';
    e.target.classList.remove('is-invalid');
  });

  document.getElementById('nextFromDni').addEventListener('click', verificarDniYContinuar);
  document.getElementById('dniForm').addEventListener('submit', e => {
    e.preventDefault();
    verificarDniYContinuar();
  });
}

// ===== RENDERIZADO =====
// Paso 2: crea los botones de especialidades
function mostrarEspecialidades() {
  const grid = document.getElementById('specialtyGrid');
  grid.innerHTML = '';

  Object.keys(DATA.specialties).forEach((name, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wiz-spec-btn';
    btn.textContent = name;
    btn.dataset.specialty = name;
    btn.onclick = () => elegirEspecialidad(name, btn);
    animarEntrada(btn, i);
    grid.appendChild(btn);
  });
}

// Paso 3: crea las tarjetas de los médicos de la especialidad
function mostrarMedicos(specialty) {
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

    card.prepend(crearFotoDelMedico(doc));

    hacerClickeable(card, () => elegirMedico(doc, card));
    animarEntrada(card, i);
    list.appendChild(card);
  });
}

// Paso 4: muestra los próximos días en que atiende el médico, marcando
// los disponibles, los que no tienen turnos y los feriados
async function mostrarDiasDisponibles() {
  const container = document.getElementById('daysGrid');
  const hint = document.getElementById('daysHint');
  const hoursSection = document.getElementById('hoursSection');
  const doctor = formData.doctor;

  container.innerHTML = '';
  hoursSection.style.display = 'none';
  formData.date = '';
  formData.time = '';
  ocultarBotonContinuar();
  ocultarAvisoDeFecha();
  if (!doctor) return;

  hint.textContent = 'Buscando días disponibles...';
  hint.style.color = '#888';

  let dias;
  try {
    dias = await calcularDiasDelMedico(doctor);
  } catch (err) {
    hint.innerHTML = `${htmlIcono('bi-exclamation-triangle-fill')} No pudimos consultar la disponibilidad. Intentá nuevamente.`;
    hint.style.color = '#dc3545';
    return;
  }
  if (formData.doctor !== doctor) return; // el paciente cambió de médico mientras se esperaba

  dias.forEach((dia, i) => container.appendChild(crearChipDeDia(dia, i)));

  const disponibles = dias.filter(d => d.estado === 'disponible').length;
  if (disponibles === 0) {
    hint.innerHTML = `${htmlIcono('bi-x-circle')} Sin disponibilidad en los próximos ${CONFIG.diasABuscar} días`;
    hint.style.color = '#dc3545';
  } else {
    hint.textContent = `Próximos ${disponibles} días disponibles`;
    hint.style.color = '#888';
  }
}

// Recorre los próximos días y clasifica cada día de atención del médico
// como 'disponible', 'sin-turnos' (todo ocupado o ya pasado) o 'feriado'
async function calcularDiasDelMedico(doctor) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = [];
  let disponibles = 0;

  for (let i = 0; i < CONFIG.diasABuscar && disponibles < CONFIG.maxDiasMostrados; i++) {
    const date = new Date(hoy);
    date.setDate(hoy.getDate() + i);
    if (franjasDelDia(doctor, date.getDay()).length === 0) continue; // ese día no atiende

    const fecha = fechaAFormatoISO(date);
    const feriado = nombreDelFeriado(fecha);
    if (feriado) {
      dias.push({ date, estado: 'feriado', feriado });
      continue;
    }

    const horarios = generarHorariosDelDia(doctor, date);
    let libres = horarios.length;
    if (libres > 0) {
      const ocupados = await api.obtenerTurnosOcupados(doctor.id, fecha);
      libres = horarios.filter(h => !ocupados.includes(h)).length;
    }
    dias.push({ date, estado: libres > 0 ? 'disponible' : 'sin-turnos' });
    if (libres > 0) disponibles++;
  }
  return dias;
}

// Tarjeta de un día; los feriados y los días sin turnos no se pueden elegir
function crearChipDeDia(dia, indice) {
  const { date, estado, feriado } = dia;
  const chip = document.createElement('div');
  chip.className = 'wiz-day-chip' + (estado === 'disponible' ? '' : ` wiz-day-${estado}`);
  const etiqueta = estado === 'feriado' ? 'FERIADO' : (estado === 'sin-turnos' ? 'Sin turnos' : '');
  chip.innerHTML = `
    <span class="wiz-day-name">${DIAS_CORTOS[date.getDay()]}</span>
    <span class="wiz-day-number">${date.getDate()}</span>
    <span class="wiz-day-month">${MESES_CORTOS[date.getMonth()]}</span>
    ${etiqueta ? `<span class="wiz-day-tag">${etiqueta}</span>` : ''}`;

  if (estado === 'disponible') {
    hacerClickeable(chip, () => elegirDia(date, chip));
  } else {
    chip.setAttribute('aria-disabled', 'true');
    chip.title = estado === 'feriado' ? `Feriado: ${feriado}` : 'No hay turnos disponibles para esta fecha';
    hacerClickeable(chip, () => avisarFechaNoDisponible(dia, chip));
  }
  animarEntrada(chip, indice);
  return chip;
}

// Al tocar un feriado o un día sin turnos: explica por qué no se puede elegir
function avisarFechaNoDisponible(dia, chip) {
  document.querySelectorAll('.wiz-day-chip').forEach(c => c.classList.remove('selected'));
  formData.date = '';
  formData.time = '';
  ocultarBotonContinuar();
  document.getElementById('hoursSection').style.display = 'none';

  const aviso = document.getElementById('fechaAviso');
  const fecha = `${DIAS_CORTOS[dia.date.getDay()]} ${dia.date.getDate()} de ${MESES_CORTOS[dia.date.getMonth()]}`;
  aviso.className = `wiz-fecha-aviso wiz-fecha-aviso-${dia.estado}`;
  aviso.innerHTML = dia.estado === 'feriado'
    ? `${htmlIcono('bi-calendar-x')} <strong>FERIADO</strong> — ${escaparHTML(fecha)}: ${escaparHTML(dia.feriado)}. Ese día no hay atención.`
    : `${htmlIcono('bi-calendar-minus')} No hay turnos disponibles para esta fecha (${escaparHTML(fecha)}).`;
  aviso.hidden = false;
  sacudirCampo(chip);
}

// Oculta el aviso de fecha no disponible
function ocultarAvisoDeFecha() {
  const aviso = document.getElementById('fechaAviso');
  if (aviso) aviso.hidden = true;
}

// Paso 4: muestra los horarios del día elegido (los ocupados, deshabilitados)
async function mostrarHorariosDisponibles() {
  const container = document.getElementById('timeSlots');
  const error = document.getElementById('datetimeError');
  const doctor = formData.doctor;
  const fecha = formData.date;
  if (!doctor || !fecha) return;

  container.innerHTML = '';
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const horarios = generarHorariosDelDia(doctor, new Date(anio, mes - 1, dia));

  let ocupados = [];
  try {
    ocupados = await api.obtenerTurnosOcupados(doctor.id, fecha);
  } catch (err) {
    error.innerHTML = `${htmlIcono('bi-exclamation-triangle-fill')} No pudimos consultar los horarios. Intentá nuevamente.`;
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
      hacerClickeable(slot, () => elegirHorario(time, slot));
    }
    container.appendChild(slot);
  });

  // Si no quedó ningún horario libre (por ejemplo, se ocuparon mientras elegía)
  if (!horarios.some(h => !ocupados.includes(h))) {
    container.innerHTML = `<p class="wiz-sin-turnos">${htmlIcono('bi-calendar-minus')} No hay turnos disponibles para esta fecha</p>`;
  }

  // Si el horario elegido ya no está disponible (lo tomó otro paciente), se descarta
  if (formData.time && (ocupados.includes(formData.time) || !horarios.includes(formData.time))) {
    formData.time = '';
  }
  document.getElementById('requestTurnBtn').classList.toggle('d-none', !formData.time);
}

// ===== SELECCIONES =====
// Paso 2: el paciente elige una especialidad
function elegirEspecialidad(name, btn) {
  document.querySelectorAll('.wiz-spec-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  if (formData.specialty !== name) formData.doctor = null;
  formData.specialty = name;
  document.getElementById('selectedSpecialtyName').textContent = name;

  setTimeout(() => irAlPaso(3), 300);
}

// Paso 3: el paciente elige un médico
function elegirMedico(doc, card) {
  document.querySelectorAll('.wiz-doc-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');

  formData.doctor = doc;
  document.getElementById('selectedDoctorName').textContent = doc.name;

  setTimeout(() => irAlPaso(4), 300);
}

// Paso 4: el paciente elige un día
function elegirDia(date, chip) {
  document.querySelectorAll('.wiz-day-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');

  formData.date = fechaAFormatoISO(date);
  formData.time = '';
  ocultarBotonContinuar();
  ocultarAvisoDeFecha();
  document.getElementById('datetimeError').innerHTML = '';
  document.getElementById('selectedDayLabel').textContent =
    `${DIAS_CORTOS[date.getDay()]} ${date.getDate()} de ${MESES_CORTOS[date.getMonth()]}`;

  const hoursSection = document.getElementById('hoursSection');
  hoursSection.style.display = 'block';
  mostrarHorariosDisponibles();
  setTimeout(() => hoursSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 200);
}

// Paso 4: el paciente elige un horario
function elegirHorario(time, slot) {
  document.querySelectorAll('.wiz-time-slot').forEach(s => s.classList.remove('selected'));
  slot.classList.add('selected');

  formData.time = time;
  document.getElementById('datetimeError').innerHTML = '';
  document.getElementById('requestTurnBtn').classList.remove('d-none');
}

// Oculta el botón "Continuar" del paso 4
function ocultarBotonContinuar() {
  document.getElementById('requestTurnBtn').classList.add('d-none');
}

// Marca en el paso 2 la especialidad elegida (útil al volver atrás)
function marcarEspecialidadSeleccionada() {
  document.querySelectorAll('.wiz-spec-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.specialty === formData.specialty);
  });
}

// ===== NAVEGACIÓN ENTRE PASOS =====
// Botón "Atrás"
function volverPasoAnterior() {
  if (currentStep > 1) irAlPaso(currentStep - 1);
}

// Cambia de paso: muestra el paso pedido y actualiza la barra de progreso
function irAlPaso(target) {
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
  if (target === 3) mostrarMedicos(formData.specialty);
  // Al volver desde el paso 5 se conservan el día y el horario elegidos
  if (target === 4 && currentStep < 4) mostrarDiasDisponibles();
  if (target === 4 && currentStep === 5) mostrarHorariosDisponibles();

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
// Controla que el DNI tenga entre 7 y 9 números
function validarFormatoDni() {
  const dniInput = document.getElementById('dniInput');
  const error = document.getElementById('dniError');
  const dni = dniInput.value.trim();

  let mensaje = '';
  if (dni.length < 7) mensaje = 'Ingresá tu DNI (7 a 9 dígitos)';
  else if (!/^\d{7,9}$/.test(dni)) mensaje = 'El DNI debe tener entre 7 y 9 números';

  if (mensaje) {
    error.innerHTML = `${htmlIcono('bi-exclamation-triangle-fill')} ${mensaje}`;
    dniInput.classList.add('is-invalid');
    sacudirCampo(dniInput);
    return null;
  }
  return dni;
}

// Botón "Continuar" del paso 1: verifica el DNI con el servidor
async function verificarDniYContinuar() {
  const dni = validarFormatoDni();
  if (!dni) return;

  const dniInput = document.getElementById('dniInput');
  const error = document.getElementById('dniError');
  const btn = document.getElementById('nextFromDni');
  const textoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `${htmlIcono('bi-hourglass-split')} Verificando...`;

  let paciente;
  try {
    paciente = await api.obtenerPaciente(dni);
  } catch (err) {
    error.innerHTML = `${htmlIcono('bi-exclamation-triangle-fill')} No pudimos verificar tu DNI. Intentá nuevamente.`;
    return;
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }

  if (!paciente) {
    // Paciente no registrado: se lo deriva al centro (sin WhatsApp si el número no está confirmado)
    error.innerHTML = CONFIG.whatsappContacto
      ? `${htmlIcono('bi-x-circle-fill')} DNI no registrado <br>
        <a href="https://wa.me/${CONFIG.whatsappContacto}" target="_blank" rel="noopener" class="btn-wsp">
          ${htmlIcono('bi-whatsapp')} Contactar por WhatsApp
        </a>`
      : `${htmlIcono('bi-x-circle-fill')} DNI no registrado. Comunicate con la administración del centro para registrarte.`;
    dniInput.classList.add('is-invalid');
    sacudirCampo(dniInput);
    return;
  }

  error.innerHTML = '';
  dniInput.classList.remove('is-invalid');
  formData.dni = dni;
  formData.paciente = paciente;
  mostrarPaciente(paciente);
  saltarPasosPreseleccionados();
}

// Muestra el nombre del paciente encontrado arriba del asistente
function mostrarPaciente(paciente) {
  const barra = document.getElementById('pacienteInfo');
  barra.innerHTML = `${htmlIcono('bi-person-check-fill')} Paciente: <strong>${escaparHTML(nombreCompleto(paciente))}</strong> · DNI ${escaparHTML(paciente.dni)}`;
  barra.hidden = false;
}

// "Nombre Apellido" del paciente
function nombreCompleto(paciente) {
  return `${paciente.nombre} ${paciente.apellido}`.trim();
}

// Después del DNI se saltean los pasos que ya se eligieron en el inicio
function saltarPasosPreseleccionados() {
  if (preseleccion.specialty) {
    formData.specialty = preseleccion.specialty;
    document.getElementById('selectedSpecialtyName').textContent = preseleccion.specialty;
  }

  if (preseleccion.doctor) {
    formData.doctor = preseleccion.doctor;
    document.getElementById('selectedDoctorName').textContent = preseleccion.doctor.name;
    irAlPaso(4);
  } else if (preseleccion.specialty) {
    irAlPaso(3);
  } else {
    irAlPaso(2);
  }
}

// ===== PASO 5: CONFIRMACIÓN =====
// Controla que se haya elegido día y horario
function validarFechaYHoraElegidas() {
  const error = document.getElementById('datetimeError');
  if (!formData.date || !formData.time) {
    error.innerHTML = `${htmlIcono('bi-exclamation-triangle-fill')} Seleccioná un día y un horario`;
    return false;
  }
  error.innerHTML = '';
  return true;
}

// Completa el resumen y pasa al paso 5
async function mostrarResumenDelTurno() {
  if (!validarFechaYHoraElegidas()) return;

  const fechaLarga = formatearFechaLarga(formData.date);
  document.getElementById('cAvatar').replaceChildren(crearFotoDelMedico(formData.doctor));
  document.getElementById('cDoctor').textContent = formData.doctor.name;
  document.getElementById('cSpecialty').textContent = formData.specialty;
  document.getElementById('cDate').textContent = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1);
  document.getElementById('cTime').textContent = `${formData.time} hs`;
  document.getElementById('cPaciente').textContent = nombreCompleto(formData.paciente);
  document.getElementById('cDni').textContent = `DNI ${formData.dni}`;
  document.getElementById('confirmError').innerHTML = '';
  document.getElementById('cIndicaciones').hidden = true;

  alternarResumenYExito(false);
  irAlPaso(5);
  mostrarIndicacionesDelMedico(formData.doctor);
}

// Muestra (solo lectura) las indicaciones que dejó el médico para el paciente
async function mostrarIndicacionesDelMedico(doctor) {
  const caja = document.getElementById('cIndicaciones');
  let texto = '';
  try {
    texto = (await api.obtenerIndicaciones(doctor.id)).trim();
  } catch (err) {
    return; // si no se pudieron consultar, el turno se puede confirmar igual
  }
  if (!texto || formData.doctor !== doctor) return;
  document.getElementById('cIndicacionesTexto').textContent = texto;
  caja.hidden = false;
}

// Alterna dentro del paso 5 entre el resumen y la pantalla de éxito
function alternarResumenYExito(exito) {
  document.getElementById('confirmView').classList.toggle('d-none', exito);
  document.getElementById('successView').classList.toggle('d-none', !exito);
  document.getElementById('slide-5').scrollTop = 0;
}

// Botón "Confirmar turno": guarda el turno y muestra la pantalla de éxito
async function confirmarTurno() {
  const btn = document.getElementById('confirmTurnBtn');
  const error = document.getElementById('confirmError');
  const textoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `${htmlIcono('bi-hourglass-split')} Guardando...`;

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
    error.innerHTML = `${htmlIcono('bi-exclamation-triangle-fill')} ${escaparHTML(err.message || 'No se pudo guardar el turno. Intentá nuevamente.')}`;
    return;
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }

  descargarComprobantePDF();

  document.getElementById('sFecha').textContent = formatearFechaLarga(formData.date);
  document.getElementById('sHora').textContent = formData.time;
  // Espacio no separable para que "Dr." no quede solo al final de una línea
  document.getElementById('sMedico').textContent = formData.doctor.name.replace(/^(\S+\.) /, '$1\u00a0');
  alternarResumenYExito(true);

  // La barra de progreso queda completa
  document.querySelector('.wiz-step[data-step="5"]').classList.replace('active', 'completed');
}

// Arma y descarga el comprobante del turno en PDF
function descargarComprobantePDF() {
  if (!window.jspdf) return; // la librería no cargó (sin internet)
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const ancho = doc.internal.pageSize.getWidth(); // 210 mm
  const margen = 20;
  const azul = [0, 149, 218];      // color del logo CMP
  const grisTexto = [90, 98, 110];
  const oscuro = [33, 37, 41];

  // ---- Encabezado: logo + nombre del centro ----
  const logoAncho = 26;
  let logoAlto = 0;
  if (typeof LOGO_PDF !== 'undefined') {
    logoAlto = logoAncho * LOGO_PDF.alto / LOGO_PDF.ancho; // respeta la proporción original
    doc.addImage(LOGO_PDF.data, 'PNG', margen, 14, logoAncho, logoAlto);
  }
  const xTexto = logoAlto ? margen + logoAncho + 6 : margen;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...azul);
  doc.text('Centro Médico Palacio', xTexto, 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...grisTexto);
  doc.text('24 de Septiembre 2070', xTexto, 31.5);
  doc.text('Tel.: +54 (3865) 425356  ·  admin@centromedicopalacio.com', xTexto, 36.5);

  const yLinea = Math.max(14 + logoAlto, 40) + 5;
  doc.setDrawColor(...azul);
  doc.setLineWidth(0.8);
  doc.line(margen, yLinea, ancho - margen, yLinea);

  // ---- Título ----
  let y = yLinea + 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...oscuro);
  doc.text('COMPROBANTE DE TURNO', ancho / 2, y, { align: 'center' });
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grisTexto);
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.text(`Emitido el ${hoy}`, ancho / 2, y, { align: 'center' });

  // ---- Datos del turno ----
  const filas = [
    ['Paciente', `${nombreCompleto(formData.paciente)} (DNI ${formData.dni})`],
    ['Especialidad', formData.specialty],
    ['Profesional', formData.doctor.name],
    ['Fecha', `${formatearFecha(formData.date)} (${formatearFechaLarga(formData.date)})`],
    ['Hora', `${formData.time} hs`],
    ['Lugar', 'Centro Médico Palacio - 24 de Septiembre 2070']
  ];
  const altoFila = 11;
  const yCaja = y + 10;
  const anchoCaja = ancho - margen * 2;
  doc.setFillColor(244, 249, 253);
  doc.setDrawColor(205, 226, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margen, yCaja, anchoCaja, filas.length * altoFila + 6, 3, 3, 'FD');

  y = yCaja + 3;
  const xValor = margen + 50;
  filas.forEach(([etiqueta, valor], i) => {
    const yBase = y + i * altoFila + 7.5;
    if (i > 0) {
      doc.setDrawColor(220, 232, 242);
      doc.line(margen + 6, y + i * altoFila, ancho - margen - 6, y + i * altoFila);
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...grisTexto);
    doc.text(etiqueta.toUpperCase(), margen + 6, yBase);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...oscuro);
    // Si el valor es muy largo, se recorta al ancho disponible en una sola línea
    const maxAncho = ancho - margen - 6 - xValor;
    doc.text(doc.splitTextToSize(String(valor), maxAncho)[0], xValor, yBase);
  });

  // ---- Aviso ----
  y = yCaja + filas.length * altoFila + 6 + 10;
  doc.setFillColor(230, 244, 252);
  doc.rect(margen, y, anchoCaja, 14, 'F');
  doc.setFillColor(...azul);
  doc.rect(margen, y, 1.5, 14, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...oscuro);
  doc.text('Por favor asistir 10 minutos antes del turno con su DNI.', margen + 7, y + 8.8);

  // ---- Pie de página con contacto ----
  const alto = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...azul);
  doc.setLineWidth(0.4);
  doc.line(margen, alto - 30, ancho - margen, alto - 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...azul);
  doc.text('Centro Médico Palacio', ancho / 2, alto - 23, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grisTexto);
  doc.text('24 de Septiembre 2070  ·  Tel.: +54 (3865) 425356  ·  admin@centromedicopalacio.com',
    ancho / 2, alto - 17.5, { align: 'center' });
  doc.text('Horario de atención: Lunes a Viernes de 16:00 a 20:30', ancho / 2, alto - 12.5, { align: 'center' });

  doc.save(`Turno_${formData.dni}.pdf`);
}

// Vuelve al paso 1 con todo vacío (también descarta la preselección del inicio)
function reiniciarAsistente() {
  // Oculta el paso actual sin transición para que no se superponga con el paso 1
  const currentSlide = document.getElementById(`slide-${currentStep}`);
  if (currentSlide) {
    currentSlide.style.transition = 'none';
    currentSlide.classList.remove('active');
  }

  Object.assign(formData, { dni: '', paciente: null, specialty: '', doctor: null, date: '', time: '' });
  document.getElementById('pacienteInfo').hidden = true;
  preseleccion = { specialty: '', doctor: null };
  history.replaceState(null, '', window.location.pathname);

  document.getElementById('dniInput').value = '';
  document.getElementById('preselectInfo').hidden = true;
  document.querySelectorAll('.wiz-spec-btn, .wiz-doc-card, .wiz-time-slot, .wiz-day-chip')
    .forEach(el => el.classList.remove('selected'));
  ocultarBotonContinuar();
  document.getElementById('hoursSection').style.display = 'none';

  void document.body.offsetWidth;
  requestAnimationFrame(() => {
    if (currentSlide) currentSlide.style.transition = '';
    irAlPaso(1);
    alternarResumenYExito(false);
  });
}

/* =====================================================================
   PÁGINA ANTIGUA (TurnosPagina.html): tarjetas desplegables y menú móvil.
   No se usa en especialidadesturnos.html; se deja para no romperla.
   ===================================================================== */
// Tarjetas "Ver más": abre una y cierra las demás
function activarTarjetasDesplegables() {
  document.querySelectorAll('.btn-toggle').forEach(boton => {
    boton.addEventListener('click', () => {
      const card = boton.closest('.card');
      document.querySelectorAll('.card').forEach(c => {
        if (c !== card) c.classList.remove('active');
      });
      card.classList.toggle('active');
    });
  });
}

// Botones para abrir y cerrar el menú en celulares
function activarMenuMovilAntiguo() {
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
}

activarTarjetasDesplegables();
activarMenuMovilAntiguo();
