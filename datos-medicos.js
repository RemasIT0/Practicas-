/* =====================================================================
   DATOS DE ESPECIALIDADES Y MÉDICOS
   ---------------------------------------------------------------------
   NOTA :
   Estos datos hoy están escritos a mano. Cuando exista la base de datos,
   este objeto puede reemplazarse por lo que devuelva el backend, siempre
   que respete la MISMA FORMA (ver la descripción de cada campo abajo).
   El asistente de turnos (menu.js) solo lee DATA, nunca lo modifica.

   Campos de cada médico:
     id        -> identificador único, sin espacios ni acentos. Se usa en
                  los enlaces de la página de inicio:
                  especialidadesturnos.html?medico=<id>
                  Si se cambia un id, hay que cambiarlo también en index.html.
     name      -> nombre tal cual se muestra.
     avatar    -> letra que se muestra si no hay foto o la foto no carga.
     foto      -> ruta de la imagen (opcional).
     schedule  -> texto del horario que ve el paciente.
     notes     -> obras sociales / aclaraciones (opcional).
     hours     -> horario de atención por día de la semana, usado para
                  generar los turnos disponibles:
                  { númeroDeDía: ["HH:MM inicio", "HH:MM fin"] }
                  Si un día atiende en dos franjas (mañana y tarde):
                  { 2: [["08:00", "12:00"], ["16:00", "20:30"]] }
                  Días: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb.
                  El último turno ofrecido es el que termina justo a la
                  hora de fin (con turnos de 30 min y fin 20:30 -> 20:00).
                  IMPORTANTE: debe coincidir con el texto de "schedule".
     duracionMin -> duración de cada turno en minutos (opcional; si no
                  está, se usa CONFIG.duracionTurnoMin de api-turnos.js).
     indicaciones -> texto inicial de las indicaciones para el paciente
                  (opcional). Se muestran antes de confirmar el turno.
                  Cuando se conecte la base de datos, las indicaciones
                  vienen de api.obtenerIndicaciones() y se editan en el
                  panel de administración ("ADM Médicos").
   ===================================================================== */

const DATA = {
  specialties: {
    "Cardiología": "Diagnóstico y tratamiento de enfermedades del corazón y sistema circulatorio.",
    "Cirugía General": "Procedimientos quirúrgicos para tratar diversas patologías del organismo.",
    "Clínica Médica": "Atención integral del adulto para diagnóstico y tratamiento de enfermedades generales.",
    "Dermatología": "Cuidado y tratamiento de enfermedades de la piel, cabello y uñas.",
    "Endocrinología": "Diagnóstico y tratamiento de trastornos hormonales y metabólicos.",
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
        id: "marcos-palacio",
        name: "Dr. Marcos Antonio Palacio",
        avatar: "P",
        foto: "img/palacio1.jpeg",
        schedule: "Martes, Miércoles y Viernes de 16:30 a 20:30",
        notes: "Particulares",
        hours: { 2: ["16:30", "20:30"], 3: ["16:30", "20:30"], 5: ["16:30", "20:30"] }
      },
      {
        id: "gaston-palacio",
        name: "Dr. Gastón Antonio Palacio",
        avatar: "P",
        foto: "img/palacio2.jpeg",
        schedule: "Lunes, Martes y Viernes de 16:00 a 20:30, Jueves de 14:00 a 18:30",
        notes: "Todas las obras sociales",
        hours: { 1: ["16:00", "20:30"], 2: ["16:00", "20:30"], 4: ["14:00", "18:30"], 5: ["16:00", "20:30"] }
      }
    ],

    "Cardiología": [
      {
        id: "gerardo-palacio",
        name: "Dr. Gerardo Marcos Palacio",
        avatar: "P",
        foto: "img/palacio3.jpeg",
        schedule: "Lunes y Miércoles de 16:00 a 20:30, Martes y Jueves de 14:00 a 18:30",
        notes: "Todas las obras sociales",
        hours: { 1: ["16:00", "20:30"], 2: ["14:00", "18:30"], 3: ["16:00", "20:30"], 4: ["14:00", "18:30"] },
        // Texto de ejemplo del pedido: CONFIRMAR con el médico
        indicaciones: "Recordá traer los estudios anteriores y la documentación médica."
      }
    ],

    "Gastroenterología": [
      {
        id: "zelarayan",
        name: "Dra. Norma Daniela Zelarayán",
        avatar: "Z",
        foto: "img/zalarayan.jpeg",
        schedule: "Martes y Jueves de 14:00 a 18:30",
        notes: "Todas las obras sociales",
        hours: { 2: ["14:00", "18:30"], 4: ["14:00", "18:30"] }
      }
    ],

    "Psicología": [
      {
        id: "sepulveda",
        name: "Lic. María Alejandra Sepúlveda",
        avatar: "S",
        foto: "img/sepulveda.jpeg",
        schedule: "Lunes, Miércoles y Viernes de 16:30 a 20:30",
        hours: { 1: ["16:30", "20:30"], 3: ["16:30", "20:30"], 5: ["16:30", "20:30"] }
      }
    ],

    "Clínica Médica": [
      {
        id: "manzano",
        name: "Dra. Virginia Paula Manzano",
        avatar: "M",
        foto: "img/manzano.jpeg",
        schedule: "Martes de 16:00 a 20:30",
        notes: "Clínica obesidad y diabetes",
        hours: { 2: ["16:00", "20:30"] }
      }
    ],

    "Ginecología": [
      {
        id: "moyano",
        name: "Dra. María Eugenia Moyano",
        avatar: "M",
        foto: "img/moyano.jpeg",
        schedule: "Lunes de 16:00 a 20:30",
        notes: "Ginecología y Obstetricia",
        hours: { 1: ["16:00", "20:30"] }
      }
    ],

    "Obstetricia": [
      {
        id: "moyano",
        name: "Dra. María Eugenia Moyano",
        avatar: "M",
        foto: "img/moyano.jpeg",
        schedule: "Lunes de 16:00 a 20:30",
        notes: "Obstetricia",
        hours: { 1: ["16:00", "20:30"] }
      }
    ],

    "Reumatología": [
      {
        id: "maldonado",
        name: "Dr. Pablo Ramiro Maldonado",
        avatar: "M",
        foto: "img/maldonado.jpeg",
        schedule: "Miércoles de 16:00 a 20:30",
        notes: "Todas las obras sociales",
        hours: { 3: ["16:00", "20:30"] }
      }
    ],

    "Neurología": [
      {
        id: "lara-norry",
        name: "Dr. Rafael Lara Norry",
        avatar: "L",
        foto: "img/laranorry.jpeg",
        schedule: "Lunes de 16:00 a 20:30",
        notes: "Todas las obras sociales",
        hours: { 1: ["16:00", "20:30"] }
      },
      {
        id: "paz",
        name: "Dr. Juan Paz",
        avatar: "P",
        foto: "img/paz.jpeg",
        schedule: "Sábado de 16:00 a 20:30",
        notes: "Todas las obras sociales",
        hours: { 6: ["16:00", "20:30"] }
      },
      {
        id: "diaz",
        name: "Dra. Verónica Díaz",
        avatar: "D",
        foto: "img/diaz.jpeg",
        schedule: "Miércoles de 14:00 a 20:30",
        notes: "Electromiograma",
        hours: { 3: ["14:00", "20:30"] }
      }
    ],

    "Dermatología": [
      {
        id: "norry",
        name: "Dr. Gabriel Norry",
        avatar: "N",
        foto: "img/norry.jpeg",
        schedule: "Miércoles de 18:00 a 20:30",
        notes: "Todas las obras sociales",
        hours: { 3: ["18:00", "20:30"] }
      },
      {
        id: "kollrich",
        name: "Dra. Florencia Kollrich",
        avatar: "K",
        foto: "img/nuevokollrich.png",
        schedule: "Lunes de 16:00 a 20:30",
        notes: "Todas las obras sociales",
        hours: { 1: ["16:00", "20:30"] }
      }
    ],

    "Odontología": [
      {
        id: "de-la-fuente",
        name: "Dra. Jimena De la Fuente",
        avatar: "D",
        foto: "img/delafuente.jpeg",
        schedule: "Lunes a Viernes de 16:00 a 20:30",
        notes: "Ortodoncia",
        hours: { 1: ["16:00", "20:30"], 2: ["16:00", "20:30"], 3: ["16:00", "20:30"], 4: ["16:00", "20:30"], 5: ["16:00", "20:30"] },
        // Texto de ejemplo del pedido: CONFIRMAR con la médica
        indicaciones: "Por favor, asistir con ropa cómoda."
      }
    ],

    "Cirugía General": [
      {
        id: "carrizo",
        name: "Dr. Gustavo Carrizo",
        avatar: "C",
        foto: "img/carrizo.jpeg",
        schedule: "Lunes, Miércoles y Viernes de 16:00 a 20:30",
        notes: "Laparoscopía",
        hours: { 1: ["16:00", "20:30"], 3: ["16:00", "20:30"], 5: ["16:00", "20:30"] }
      }
    ],

    "Infectología": [
      {
        id: "elias-grane",
        name: "Dra. Lourdes Elías Grane",
        avatar: "E",
        foto: "img/eliasgrane.jpeg",
        schedule: "Martes y Viernes de 16:00 a 20:30",
        notes: "Clínica - Infectología",
        hours: { 2: ["16:00", "20:30"], 5: ["16:00", "20:30"] }
      }
    ],

    "Endocrinología": [
      {
        id: "diaz-alvarez",
        name: "Dra. Noel Diaz Álvarez",
        avatar: "D",
        foto: "img/diazalvarez.png",
        schedule: "Miércoles de 16:00 a 20:30",
        notes: "Todas las obras sociales",
        hours: { 3: ["16:00", "20:30"] }
      }
    ],

    "Nutrición": [
      {
        id: "fernandez",
        name: "Lic. Paulina Fernández",
        avatar: "F",
        foto: "img/fernandez.jpeg",
        schedule: "Lunes de 16:00 a 20:30",
        hours: { 1: ["16:00", "20:30"] }
      }
    ]
  }
};
