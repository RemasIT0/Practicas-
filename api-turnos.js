/* =====================================================================
   CONEXIÓN CON EL BACKEND / BASE DE DATOS
   ---------------------------------------------------------------------
   NOTA :
   Este es el ÚNICO archivo que hace falta modificar para conectar el
   sistema de turnos con la base de datos. El resto de la página
   (menu.js) solo llama a las funciones de abajo y espera la respuesta.

   Hoy las funciones trabajan con datos de prueba en memoria (no se
   guarda nada). Para conectarlas:
     1. Completar CONFIG.urlApi con la dirección del backend.
     2. Reemplazar el cuerpo de cada función por la llamada real
        (hay un ejemplo con fetch comentado en cada una).
     3. Mantener lo que devuelve cada función (está documentado),
        así la interfaz sigue funcionando sin cambios.

   Todas las funciones son async (devuelven una Promise). Si algo falla
   (sin conexión, error del servidor) deben lanzar un Error: la página
   ya muestra un mensaje al paciente en ese caso.

   SEGURIDAD: la validación del DNI y la disponibilidad de horarios
   también deben controlarse en el servidor; lo que se valida aquí en el
   navegador puede ser salteado por cualquiera.
   ===================================================================== */

const CONFIG = {
  // Dirección base del backend. Ej: "https://api.centromedicopalacio.com"
  urlApi: "",

  // Número de WhatsApp al que se deriva al paciente si su DNI no está
  // registrado (formato internacional, sin "+" ni espacios).
  // VERIFICAR: es distinto al que figura en el pie de página.
  whatsappContacto: "5493815551234",

  // Cuántos días hacia adelante se buscan fechas disponibles,
  // y cuántas fechas como máximo se muestran.
  diasABuscar: 21,
  maxDiasMostrados: 8,

  // Duración de cada turno en minutos.
  duracionTurnoMin: 30
};

// ---------------------------------------------------------------------
// DATOS DE PRUEBA (borrar cuando se conecte la base de datos)
// ---------------------------------------------------------------------
const PACIENTES_DE_PRUEBA = ["12345678", "87654321", "40111222"];
const turnosDePrueba = []; // { dni, medicoId, especialidad, fecha, hora }

const api = {

  /**
   * Verifica si un DNI corresponde a un paciente registrado.
   * @param {string} dni  Solo números, 7 a 9 dígitos (ya validado).
   * @returns {Promise<boolean>} true si está registrado.
   */
  async verificarPaciente(dni) {
    // EJEMPLO con backend:
    // const res = await fetch(`${CONFIG.urlApi}/pacientes/${dni}`);
    // if (res.status === 404) return false;
    // if (!res.ok) throw new Error("Error al verificar el paciente");
    // return true;

    return PACIENTES_DE_PRUEBA.includes(dni);
  },

  /**
   * Devuelve los horarios YA RESERVADOS de un médico en una fecha,
   * para mostrarlos como no disponibles.
   * @param {string} medicoId  El "id" del médico (ver datos-medicos.js).
   * @param {string} fecha     Formato "AAAA-MM-DD".
   * @returns {Promise<string[]>} Ej: ["16:00", "17:30"]
   */
  async obtenerTurnosOcupados(medicoId, fecha) {
    // EJEMPLO con backend:
    // const res = await fetch(`${CONFIG.urlApi}/turnos?medico=${medicoId}&fecha=${fecha}`);
    // if (!res.ok) throw new Error("Error al consultar turnos");
    // const turnos = await res.json();
    // return turnos.map(t => t.hora);

    return turnosDePrueba
      .filter(t => t.medicoId === medicoId && t.fecha === fecha)
      .map(t => t.hora);
  },

  /**
   * Guarda un turno nuevo.
   * @param {{dni:string, especialidad:string, medicoId:string,
   *          medicoNombre:string, fecha:string, hora:string}} turno
   *        fecha en formato "AAAA-MM-DD", hora "HH:MM".
   * @returns {Promise<void>} Debe lanzar Error si no se pudo guardar
   *          (por ejemplo, si otro paciente tomó el horario recién).
   */
  async guardarTurno(turno) {
    // EJEMPLO con backend:
    // const res = await fetch(`${CONFIG.urlApi}/turnos`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(turno)
    // });
    // if (res.status === 409) throw new Error("Ese horario ya fue reservado. Elegí otro.");
    // if (!res.ok) throw new Error("No se pudo guardar el turno");

    turnosDePrueba.push({
      dni: turno.dni,
      medicoId: turno.medicoId,
      especialidad: turno.especialidad,
      fecha: turno.fecha,
      hora: turno.hora
    });
  }
};
