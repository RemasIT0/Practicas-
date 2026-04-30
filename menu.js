const nav = document.querySelector("#nav");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");
const pacientesRegistrados = [
  "12345678",
  "30111222",
  "44555666"
];
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
    "Cirugía General": "Procedimientos quirúrgicos para tratar diversas patologías del organismo.",
    "Clínica Médica": "Atención integral del adulto para diagnóstico y tratamiento de enfermedades generales.",
    "Dermatología": "Cuidado y tratamiento de enfermedades de la piel, cabello y uñas.",
    "Gastroenterología": "Diagnóstico y tratamiento de enfermedades del sistema digestivo.",
    "Ginecología": "Atención médica especializada en la salud femenina.",
    "Infectología": "Diagnóstico y tratamiento de enfermedades infecciosas.",
    "Neurología": "Estudio y tratamiento de enfermedades del sistema nervioso.",
    "Nutrición": "Asesoramiento nutricional y planes alimentarios personalizados.",
    "Obstetricia": "Control del embarazo, parto y salud materna.",
    "Odontología": "Cuidado, diagnóstico y tratamiento de la salud bucal.",
    "Otorrinolaringología": "Tratamiento de enfermedades de oído, nariz y garganta.",
    "Psicología": "Atención y acompañamiento en la salud mental.",
    "Reumatología": "Diagnóstico y tratamiento de enfermedades articulares y autoinmunes."
  },

  doctors: {
    "Otorrinolaringología": [
      {
        name: "Dr. Marcos Antonio Palacio",
        avatar: "P",
        schedule: "Martes, Miércoles y Viernes de 16:30 a 20:30",
        notes: "Particulares",
        days:[2,3,5]
      },
      {
        name: "Dr. Gastón Antonio Palacio",
        avatar: "P",
        schedule: "Lunes, Martes, Jueves y Viernes de 16:00 a 20:30",
        notes: "Todas las obras sociales",
        days:[1,2,4,5]
      }
    ],

    "Cardiología": [
      {
        name: "Dr. Gerardo Marcos Palacio",
        avatar: "P",
        schedule: "Lunes, Miércoles y Viernes de 16:00 a 20:30",
        notes: "Todas las obras sociales",
        days:[1,3,5]
      }
    ],

    "Gastroenterología": [
      {
        name: "Dra. Norma Daniela Zelarayán",
        avatar: "Z",
        schedule: "Martes y Jueves de 16:00 a 20:30",
        notes: "Todas las obras sociales",
        days:[2,4]
      }
    ],

    "Psicología": [
      {
        name: "Lic. María Alejandra Sepúlveda",
        avatar: "S",
        schedule: "Lunes, Miércoles y Viernes de 16:30 a 20:30",
        days:[1,3,5]
      }
    ],

    "Clínica Médica": [
      {
        name: "Dra. Virginia Paula Manzano",
        avatar: "M",
        schedule: "Martes de 16:00 a 20:30",
        notes: "Clínica obesidad y diabetes",
        days:[2]
      }
    ],

    "Ginecología": [
      {
        name: "Dra. María Eugenia Moyano",
        avatar: "M",
        schedule: "Lunes de 16:00 a 20:30",
        notes: "Ginecología y Obstetricia",
        days:[1]
      }
    ],

    "Reumatología": [
      {
        name: "Dr. Pablo Ramiro Maldonado",
        avatar: "M",
        schedule: "Miércoles de 16:00 a 20:30",
        days:[3]
      }
    ],

    "Neurología": [
      {
        name: "Dr. Rafael Lara Norry",
        avatar: "L",
        schedule: "Lunes de 16:00 a 20:30",
        days:[1]
      },
      {
        name: "Dr. Juan Paz",
        avatar: "P",
        schedule: "Sábado de 16:00 a 20:30",
        days:[6]
      },
      {
        name: "Dra. Verónica Díaz",
        avatar: "D",
        schedule: "Jueves de 14:00 a 20:30",
        notes: "Electromiograma",
        days:[4]
      }
    ],

    "Dermatología": [
      {
        name: "Dr. Gabriel Norry",
        avatar: "N",
        schedule: "Miércoles de 16:00 a 20:30",
        days:[3]
      },
      {
        name: "Dra. Florencia Kollrich",
        avatar: "K",
        schedule: "Lunes de 16:00 a 20:30",
        days:[1]
      }
    ],
    "Obstetricia": [
    {
    name: "Dra. María Eugenia Moyano",
    avatar: "M",
    schedule: "Lunes de 16:00 a 20:30",
    notes: "Obstetricia",
    days:[1]
    }
   ],

    "Odontología": [
      {
        name: "Dra. Jimena De la Fuente",
        avatar: "D",
        schedule: "Lunes a Viernes de 16:00 a 20:30",
        notes: "Ortodoncia",  
        days:[1,2,3,4,5]
      }
    ],

    "Cirugía General": [
      {
        name: "Dr. Gustavo Carrizo",
        avatar: "C",
        schedule: "Lunes, Miércoles y Viernes de 16:00 a 20:30",
        notes: "Laparoscopía",
        days:[1,3,5]
      }
    ],

    "Infectología": [
      {
        name: "Dra. Lourdes Elías Grane",
        avatar: "E",
        schedule: "Martes y Viernes de 16:00 a 20:30",
        days:[2,5]
      }
    ],

    "Nutrición": [
      {
        name: "Lic. Paulina Fernández",
        avatar: "F",
        schedule: "Lunes de 16:00 a 20:30",
        days:[1]
      },
      {
        name: "Lic. María Belén Almirón",
        avatar: "A",
        schedule: "Miércoles, Jueves y Viernes de 16:00 a 20:30",
        days:[3,4,5]
      }
    ]
  },

  timeSlots: [
    "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00"
  ]
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
        <div class="wiz-doc-schedule">${doc.schedule}</div>
      </div>
    `;
    card.onclick = () => selectDoctor(doc, card);
    list.appendChild(card);
  });
}

function renderTimeSlots() {
  const container = document.getElementById('timeSlots');
  if (!container || !formData.doctor) return;

  container.innerHTML = '';

  // 🔥 extrae horas del texto
  const match = formData.doctor.schedule.match(/(\d{2}:\d{2}) a (\d{2}:\d{2})/);

  if (!match) return;

  let [h, m] = match[1].split(':').map(Number);
  const [endH, endM] = match[2].split(':').map(Number);

  while (h < endH || (h === endH && m < endM)) {

    const time = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;

    const slot = document.createElement('div');
    slot.className = 'wiz-time-slot';
    slot.textContent = time;

    slot.onclick = () => {
      document.querySelectorAll('.wiz-time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      formData.time = time;
    };

    container.appendChild(slot);

    m += 30;
    if (m >= 60) {
      m = 0;
      h++;
    }
  }
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

function selectDoctor(doc, card) {
  document.querySelectorAll('.wiz-doc-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  
  formData.doctor = doc; // ✅ ahora sí guarda bien

  const docName = document.getElementById('selectedDoctorName');
  if (docName) docName.textContent = doc.name;

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

  // ===== PASO 1: DNI =====
  if (step === 1) {
    const dniInput = document.getElementById('dniInput');
    const error = document.getElementById('dniError');
    const dni = dniInput?.value.trim() || '';

    if (/^\d{7,9}$/.test(dni)) {

  if (!pacientesRegistrados.includes(dni)) {

    const error = document.getElementById('dniError');

    if (error) {
      error.innerHTML = `
        ❌ DNI no registrado <br>
       <a href="https://wa.me/5493815551234" target="_blank" class="btn-wsp">
         📲 Contactar por WhatsApp
       </a>
      `;
    }

    return; // ⛔ NO avanza
  }

  formData.dni = dni;
  setTimeout(() => changeStep(2), 300);
}

    if (error) error.textContent = '';
    if (dniInput) dniInput.classList.remove('is-invalid');

    formData.dni = dni;
    return true;
  }

  // ===== PASO 2: ESPECIALIDAD =====
  if (step === 2 && !formData.specialty) {
    alert('Selecciona una especialidad para continuar');
    return false;
  }

  // ===== PASO 3: MÉDICO =====
  if (step === 3 && !formData.doctor) {
    alert('Selecciona un médico para continuar');
    return false;
  }

  // ===== PASO 4: FECHA Y HORA =====
  if (step === 4) {
    const dateInput = document.getElementById('dateInput');
    const error = document.getElementById('datetimeError');
    const date = dateInput?.value || '';
    
    const [year, month, dayNum] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, dayNum);
    const day = selectedDate.getDay();

    if (!formData.doctor.days.includes(day)) {
    if (error) error.textContent = "❌ Este médico no atiende ese día";
    return false;
    }

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

  const confirmBtn = document.getElementById('confirmBtn');
  if (confirmBtn) {
    confirmBtn.onclick = submitWizard;
  }

  const dateInput = document.getElementById('dateInput');
  if (dateInput) {
    dateInput.addEventListener('change', e => {
      formData.date = e.target.value;
    });
  }

} // ✅ SOLO UNA LLAVE PARA CERRAR

function confirmAppointment() {
  generarPDF();

  alert("Turno confirmado y comprobante descargado ✅");

  document.getElementById("confirmCard").classList.add("d-none");

  resetWizard();
}

function showConfirmCard() {
  if (!validateStep(4)) return;

  const card = document.getElementById("confirmCard");
  card.classList.remove("d-none");

  document.getElementById("cDni").textContent = formData.dni;
  document.getElementById("cSpecialty").textContent = formData.specialty;
  document.getElementById("cDoctor").textContent = formData.doctor.name;

  const fecha = formData.date.split('-').reverse().join('/');
  document.getElementById("cDate").textContent = fecha;

  document.getElementById("cTime").textContent = formData.time;
  
}


function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Comprobante de Turno Médico", 20, 20);

  doc.setFontSize(12);
  doc.text(`DNI: ${formData.dni}`, 20, 40);
  doc.text(`Especialidad: ${formData.specialty}`, 20, 50);
  doc.text(`Médico: ${formData.doctor.name}`, 20, 60);

  const fecha = formData.date.split('-').reverse().join('/');
  doc.text(`Fecha: ${fecha}`, 20, 70);

  doc.text(`Hora: ${formData.time}`, 20, 80);

  doc.text("Centro Médico Palacio", 20, 100);

  doc.save(`Turno_${formData.dni}.pdf`);
}