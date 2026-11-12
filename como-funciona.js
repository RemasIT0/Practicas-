/* =====================================================================
   "¿CÓMO FUNCIONA?" (index.html): demostración animada de los 5 pasos
   ---------------------------------------------------------------------
   Cada paso de la lista tiene una "escena" en el celular dibujado.
   Este archivo solo decide qué escena se ve; los movimientos dentro de
   cada escena (tipeo, toques, selecciones) están hechos con CSS en
   styles.css (sección "¿CÓMO FUNCIONA?").

   - Avanza solo cada DURACION_PASO ms (debe coincidir con --cf-dur del CSS).
   - Al tocar un paso se muestra esa escena.
   - Arranca recién cuando la sección aparece en pantalla.
   - Si el sistema pide "reducir movimiento", no avanza solo.
   ===================================================================== */

const DURACION_PASO = 4000;

document.addEventListener('DOMContentLoaded', iniciarComoFunciona);

// Prepara la demostración: pasos, escenas y arranque al verse
function iniciarComoFunciona() {
  const demo = document.getElementById('comoFunciona');
  if (!demo) return;

  const pasos = [...demo.querySelectorAll('.cf-paso')];
  const escenas = [...demo.querySelectorAll('.cf-escena')];
  const puntos = [...demo.querySelectorAll('.cf-mini-stepper i')];
  // Si el sistema pide "reducir movimiento", los pasos no avanzan solos
  const avanzarSolo = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let actual = 0;
  let temporizador = null;
  let visible = false;

  // Muestra el paso indicado y vuelve a reproducir su escena desde el principio
  function mostrarPaso(indice) {
    actual = indice;
    pasos.forEach((paso, i) => {
      paso.classList.toggle('activo', i === indice);
      paso.classList.toggle('hecho', i < indice);
      paso.setAttribute('aria-selected', String(i === indice));
    });
    escenas.forEach((escena, i) => {
      escena.classList.remove('activa');
      if (i === indice) {
        void escena.offsetWidth; // reinicia las animaciones CSS de la escena
        escena.classList.add('activa');
      }
    });
    puntos.forEach((punto, i) => punto.classList.toggle('hecho', i <= indice));
    programarSiguiente();
  }

  // Programa el paso siguiente (vuelve al primero después del último)
  function programarSiguiente() {
    clearTimeout(temporizador);
    if (!avanzarSolo || !visible) return;
    temporizador = setTimeout(() => mostrarPaso((actual + 1) % pasos.length), DURACION_PASO);
  }

  pasos.forEach((paso, i) => paso.addEventListener('click', () => mostrarPaso(i)));

  // Arranca cuando la sección entra en pantalla y se detiene cuando sale
  new IntersectionObserver(entradas => {
    const estabaVisible = visible;
    visible = entradas[0].isIntersecting;
    if (visible && !estabaVisible) mostrarPaso(actual);
    if (!visible) clearTimeout(temporizador);
  }, { threshold: 0.35 }).observe(demo);
}
