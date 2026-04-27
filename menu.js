const nav = document.querySelector("#nav");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");

abrir.addEventListener("click", () => {
   nav.classList.add("visible");
});

cerrar.addEventListener("click", () => {
   nav.classList.remove("visible");
});

// Tarjetas (se mantiene igual, no usa clases del wizard)
const botones = document.querySelectorAll(".btn-toggle");
botones.forEach(boton => {
    boton.addEventListener("click", () => {
        const card = boton.closest(".card");
        document.querySelectorAll(".card").forEach(c => {
            if(c !== card) c.classList.remove("active");
        });
        card.classList.toggle("active");
    });
});

/* ================================================== */

// ===== DATOS DE EJEMPLO =====
const DATA = {
  specialties: {
    "Cardiología": "Diagnóstico y tratamiento de enfermedades del corazón y sistema circulatorio.",
    "Pediatría": "Atención médica especializada para niños desde recién nacidos hasta adolescentes.",
    "Dermatología": "Cuidado integral de piel, cabello, uñas y tratamiento de enfermedades dermatológicas.",
    "Traumatología": "Tratamiento de lesiones musculoesqueléticas, fracturas, esguinces y rehabilitación.",
    "Oftalmología": "Diagnóstico y tratamiento de enfermedades de la vista y cirugía ocular."
  },
  doctors: {
    "Cardiología": [
      { name: "Dra. Martínez", avatar: "M" },
      { name: "Dr. López", avatar: "L" },
      { name: "Dr. Ruiz", avatar: "R" }
    ],
    "Pediatría": [
      { name: "Dra. Gómez", avatar: "G" },
      { name: "Dr. Fernández", avatar: "F" },
      { name: "Dra. Silva", avatar: "S" }
    ],
    "Dermatología": [
      { name: "Dra. Rojas", avatar: "R" },
      { name: "Dr. Silva", avatar: "S" },
      { name: "Dra. Vega", avatar: "V" },
      { name: "Dr. Castro", avatar: "C" }
    ],
    "Traumatología": [
      { name: "Dr. Castro", avatar: "C" },
      { name: "Dra. Méndez", avatar: "M" }
    ],
    "Oftalmología": [
      { name: "Dra. Torres", avatar: "T" },
      { name: "Dr. Díaz", avatar: "D" },
      { name: "Dra. Pérez", avatar: "P" }
    ]
  },
  timeSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "16:00", "16:30", "17:00", "17:30", "18:00"]
};

// ===== ESTADO DEL WIZARD =====
let currentStep = 1;
const totalSteps = 4; // ✅ CAMBIADO: ahora son 4 pasos
const formData = { dni: '', specialty: '', doctor: '', date: '', time: '' };

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('dateInput');
  if (dateInput) dateInput.min = today;
  
  renderSpecialties();
  setupEventListeners();
});

// ===== RENDERIZADO DINÁMICO =====
function renderSpecialties() {
  const grid = document.getElementById('specialtyGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  Object.keys(DATA.specialties).forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'wiz-spec-btn';
    btn.textContent = name;
    btn.onclick = () => selectSpecialty(name, btn);
    grid.appendChild(btn);
  });
}

function renderDoctors(specialty) {
  const list = document.getElementById('doctorList');
  if (!list) return;
  list.innerHTML = '';
  
  DATA.doctors[specialty].forEach(doc => {
    const card = document.createElement('div');
    card.className = 'wiz-doc-card';
    card.innerHTML = `
      <div class="wiz-doc-avatar">${doc.avatar}</div>
      <div class="wiz-doc-info">
        <div class="wiz-doc-name">${doc.name}</div>
        <div class="wiz-doc-spec">${specialty}</div>
      </div>
    `;
    card.onclick = () => selectDoctor(doc.name, card);
    list.appendChild(card);
  });
}

function renderTimeSlots() {
  const container = document.getElementById('timeSlots');
  if (!container) return;
  container.innerHTML = '';
  
  DATA.timeSlots.forEach(time => {
    const slot = document.createElement('div');
    slot.className = 'wiz-time-slot';
    slot.textContent = time;
    slot.onclick = () => selectTime(time, slot);
    container.appendChild(slot);
  });
}

// ===== SELECCIÓN DE DATOS =====
function selectSpecialty(name, btn) {
  document.querySelectorAll('.wiz-spec-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  
  const desc = document.getElementById('specialtyDesc');
  if (desc) desc.innerHTML = `<strong>${name}</strong><br>${DATA.specialties[name]}`;
  
  formData.specialty = name;
  const specName = document.getElementById('selectedSpecialtyName');
  if (specName) specName.textContent = name;
  const nextBtn = document.getElementById('nextFromSpecialty');
  if (nextBtn) nextBtn.disabled = false;
}

function selectDoctor(name, card) {
  document.querySelectorAll('.wiz-doc-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  
  formData.doctor = name;
  const docName = document.getElementById('selectedDoctorName');
  if (docName) docName.textContent = name;
  const nextBtn = document.getElementById('nextFromDoctor');
  if (nextBtn) nextBtn.disabled = false;
}

function selectTime(time, slot) {
  document.querySelectorAll('.wiz-time-slot').forEach(s => s.classList.remove('selected'));
  slot.classList.add('selected');
  
  formData.time = time;
  const nextBtn = document.getElementById('nextFromDatetime');
  if (nextBtn) nextBtn.disabled = false;
}

// ===== NAVEGACIÓN ENTRE PASOS =====
function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < totalSteps) changeStep(currentStep + 1);
}

function prevStep() {
  if (currentStep > 1) changeStep(currentStep - 1);
}

function changeStep(target) {
  // Ocultar paso actual, mostrar nuevo
  const currentSlide = document.getElementById(`slide-${currentStep}`);
  const targetSlide = document.getElementById(`slide-${target}`);
  if (currentSlide) currentSlide.classList.remove('active');
  if (targetSlide) targetSlide.classList.add('active');
  
  // Actualizar stepper
  document.querySelectorAll('.wiz-step').forEach(step => {
    const num = parseInt(step.dataset.step);
    step.classList.remove('active', 'completed');
    if (num < target) step.classList.add('completed');
    else if (num === target) step.classList.add('active');
  });
  
  // Animar barra de progreso
  const progress = ((target - 1) / (totalSteps - 1)) * 100;
  const stepper = document.querySelector('.wiz-stepper');
  if (stepper) stepper.style.setProperty('--progress', `${progress}%`);
  
  // Preparar contenido del nuevo paso
  if (target === 3) renderDoctors(formData.specialty);
  if (target === 4) renderTimeSlots();
  // ✅ ELIMINADO: if (target === 5) fillSummary();
  
  currentStep = target;
}

// ===== VALIDACIÓN POR PASO =====
function validateStep(step) {
  if (step === 1) {
    const dniInput = document.getElementById('dniInput');
    const error = document.getElementById('dniError');
    const dni = dniInput?.value.trim() || '';
    
    if (!/^\d{7,9}$/.test(dni)) {
      if (error) error.textContent = '⚠️ DNI inválido (7-9 dígitos)';
      if (dniInput) dniInput.classList.add('is-invalid');
      return false;
    }
    
    if (error) error.textContent = '';
    if (dniInput) dniInput.classList.remove('is-invalid');
    formData.dni = dni;
    return true;
  }
  
  if (step === 2 && !formData.specialty) {
    alert('Selecciona una especialidad para continuar');
    return false;
  }
  
  if (step === 3 && !formData.doctor) {
    alert('Selecciona un médico para continuar');
    return false;
  }
  
  if (step === 4) {
    const dateInput = document.getElementById('dateInput');
    const error = document.getElementById('datetimeError');
    const date = dateInput?.value || '';
    
    if (!date || !formData.time) {
      if (error) error.textContent = '⚠️ Selecciona fecha y hora';
      return false;
    }
    
    if (error) error.textContent = '';
    formData.date = date;
    return true;
  }
  
  return true;
}

// ===== RESUMEN FINAL (se usa en submitWizard) =====
function fillSummary() {
  const fields = ['sumDni', 'sumSpecialty', 'sumDoctor', 'sumDate', 'sumTime'];
  const values = [formData.dni, formData.specialty, formData.doctor, '', formData.time];
  
  if (formData.date) {
    const [year, month, day] = formData.date.split('-');
    values[3] = `${day}/${month}/${year}`;
  }
  
  fields.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.textContent = values[i] || '-';
  });
}




// ===== SUBMIT FINAL =====
function submitWizard() {
  // Validar paso 4 antes de confirmar
  if (!validateStep(4)) return;
  
  const btn = document.getElementById('confirmBtn');
  if (!btn) return;
  
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Procesando...';
  btn.disabled = true;
  
  setTimeout(() => {
    // ✅ Aquí después podrás redirigir a tu página de comprobante:
    // window.location.href = `confirmacion.html?dni=${formData.dni}&especialidad=${encodeURIComponent(formData.specialty)}&medico=${encodeURIComponent(formData.doctor)}&fecha=${formData.date}&hora=${formData.time}`;
    
    
    resetWizard();
  }, 1500);
}








function resetWizard() {
  // 1️⃣ Primero, oculta visualmente el slide actual SIN animación
  const currentSlide = document.getElementById(`slide-${currentStep}`);
  if (currentSlide) {
    currentSlide.style.transition = 'none'; // Desactiva animación temporalmente
    currentSlide.style.opacity = '0';
    currentSlide.style.visibility = 'hidden';
    currentSlide.classList.remove('active');
  }
  
  // 2️⃣ Limpia datos
  currentStep = 1;
  Object.keys(formData).forEach(k => formData[k] = '');
  
  const dniInput = document.getElementById('dniInput');
  if (dniInput) dniInput.value = '';
  
  document.querySelectorAll('.wiz-spec-btn, .wiz-doc-card, .wiz-time-slot').forEach(el => el.classList.remove('selected'));
  
  const desc = document.getElementById('specialtyDesc');
  if (desc) desc.innerHTML = '<p class="text-muted">Selecciona una especialidad para ver más detalles</p>';
  
  ['nextFromSpecialty', 'nextFromDoctor', 'nextFromDatetime'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = true;
  });
  
  // 3️⃣ Fuerza un reflow para que el navegador aplique los cambios ANTES de animar
  void document.body.offsetWidth;
  
  // 4️⃣ Restaura la transición y muestra el paso 1
  requestAnimationFrame(() => {
    if (currentSlide) {
      currentSlide.style.transition = ''; // Restaura animación
    }
    changeStep(1);
  });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  const dniInput = document.getElementById('dniInput');
  if (dniInput) {
    dniInput.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      const error = document.getElementById('dniError');
      if (error) error.textContent = '';
      e.target.classList.remove('is-invalid');
    });
  }
  
  const nextFromDni = document.getElementById('nextFromDni');
  if (nextFromDni) {
    nextFromDni.onclick = () => { if (validateStep(1)) changeStep(2); };
  }
  
  const nextFromSpecialty = document.getElementById('nextFromSpecialty');
  if (nextFromSpecialty) nextFromSpecialty.onclick = () => changeStep(3);
  
  const nextFromDoctor = document.getElementById('nextFromDoctor');
  if (nextFromDoctor) nextFromDoctor.onclick = () => changeStep(4);
  
  // ✅ CAMBIADO: El botón del paso 4 ahora ejecuta submitWizard directo
  const nextFromDatetime = document.getElementById('nextFromDatetime');
  if (nextFromDatetime) {
    nextFromDatetime.style.display = 'none'; // Ocultamos el botón "Continuar" del paso 4
  }
  
  const confirmBtn = document.getElementById('confirmBtn');
  if (confirmBtn) {
    confirmBtn.onclick = submitWizard; // "Agendar Turno" ejecuta la confirmación
  }
  
  const dateInput = document.getElementById('dateInput');
  if (dateInput) {
    dateInput.addEventListener('change', e => {
      formData.date = e.target.value;
      if (formData.date) {
        document.querySelectorAll('.wiz-time-slot.disabled').forEach(slot => slot.classList.remove('disabled'));
      }
    });
  }
}