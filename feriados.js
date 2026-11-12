/* =====================================================================
   FERIADOS (días sin atención)
   ---------------------------------------------------------------------
   El asistente de turnos (menu.js) marca estos días como "FERIADO" y no
   permite reservarlos.

   PARA ACTUALIZAR: agregar las fechas de cada año con el formato
   "AAAA-MM-DD": "Nombre". Fuente oficial:
   https://www.argentina.gob.ar/interior/feriados

   Los feriados "trasladables" se calcularon con la regla de la Ley 27.399
   (si caen martes o miércoles pasan al lunes anterior; jueves o viernes,
   al lunes siguiente), pero el Gobierno puede cambiarlos por decreto:
   los marcados con VERIFICAR deben confirmarse con el calendario oficial.

   Si el centro tampoco atiende otros días (feriados provinciales o
   locales, cierres por vacaciones, días no laborables), agregarlos acá.
   ===================================================================== */

const FERIADOS = {
  // ---------- 2026 ----------
  '2026-01-01': 'Año Nuevo',
  '2026-02-16': 'Carnaval',
  '2026-02-17': 'Carnaval',
  '2026-03-24': 'Día Nacional de la Memoria por la Verdad y la Justicia',
  '2026-04-02': 'Día del Veterano y de los Caídos en la Guerra de Malvinas',
  '2026-04-03': 'Viernes Santo',
  '2026-05-01': 'Día del Trabajador',
  '2026-05-25': 'Día de la Revolución de Mayo',
  '2026-06-15': 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes (trasladado del 17/6)',
  '2026-06-20': 'Paso a la Inmortalidad del Gral. Manuel Belgrano',
  '2026-07-09': 'Día de la Independencia',
  '2026-08-17': 'Paso a la Inmortalidad del Gral. José de San Martín',
  '2026-10-12': 'Día del Respeto a la Diversidad Cultural',
  '2026-11-23': 'Día de la Soberanía Nacional (trasladado del 20/11)',
  '2026-12-08': 'Inmaculada Concepción de María',
  '2026-12-25': 'Navidad',

  // ---------- 2027 ----------
  '2027-01-01': 'Año Nuevo',
  '2027-02-08': 'Carnaval',
  '2027-02-09': 'Carnaval',
  '2027-03-24': 'Día Nacional de la Memoria por la Verdad y la Justicia',
  '2027-03-26': 'Viernes Santo',
  '2027-04-02': 'Día del Veterano y de los Caídos en la Guerra de Malvinas',
  '2027-05-01': 'Día del Trabajador',
  '2027-05-25': 'Día de la Revolución de Mayo',
  '2027-06-21': 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes (VERIFICAR traslado)',
  '2027-06-20': 'Paso a la Inmortalidad del Gral. Manuel Belgrano',
  '2027-07-09': 'Día de la Independencia',
  '2027-08-16': 'Paso a la Inmortalidad del Gral. José de San Martín (VERIFICAR traslado)',
  '2027-10-11': 'Día del Respeto a la Diversidad Cultural (VERIFICAR traslado)',
  '2027-11-20': 'Día de la Soberanía Nacional (VERIFICAR traslado)',
  '2027-12-08': 'Inmaculada Concepción de María',
  '2027-12-25': 'Navidad',
};

// Devuelve el nombre del feriado si la fecha ("AAAA-MM-DD") es feriado, o null
function nombreDelFeriado(fecha) {
  return FERIADOS[fecha] || null;
}
