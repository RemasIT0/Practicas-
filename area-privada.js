/* =====================================================================
   ÁREA PRIVADA (botón del encabezado en index.html y especialidadesturnos.html)
   ---------------------------------------------------------------------
   Abre una ventana para ingresar la contraseña y, si es correcta, lleva
   al panel de administración (CONFIG.urlPanelAdmin en api-turnos.js).

   Requiere Bootstrap (para la ventana) y api-turnos.js (api.iniciarSesion).

   NOTA PARA EL INGENIERO: hoy la contraseña se verifica con un valor DE
   PRUEBA dentro de api-turnos.js. Esto NO es seguridad real: hay que
   conectar api.iniciarSesion() con el login del servidor y hacer que el
   panel exija la sesión del lado del servidor.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const botones = document.querySelectorAll('[data-area-privada]');
  if (!botones.length) return;

  const modal = crearVentanaAreaPrivada();
  botones.forEach(boton => boton.addEventListener('click', () => abrirAreaPrivada(modal)));
});

// Crea (una sola vez) la ventana con el campo de contraseña
function crearVentanaAreaPrivada() {
  const contenedor = document.createElement('div');
  contenedor.innerHTML = `
    <div class="modal fade ap-modal" id="areaPrivadaModal" tabindex="-1" aria-labelledby="areaPrivadaTitulo" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content ap-contenido" id="areaPrivadaForm" novalidate>
          <button type="button" class="btn-close ap-cerrar" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          <div class="ap-icono"><i class="bi bi-shield-lock-fill"></i></div>
          <h2 class="ap-titulo" id="areaPrivadaTitulo">Área privada</h2>
          <p class="ap-subtitulo">Acceso exclusivo para médicos y administración del Centro Médico Palacio</p>

          <label class="ap-label" for="areaPrivadaClave">Contraseña</label>
          <div class="ap-campo">
            <input type="password" id="areaPrivadaClave" class="ap-input" autocomplete="current-password" placeholder="Ingresá tu contraseña" required>
            <button type="button" class="ap-ver" id="areaPrivadaVer" aria-label="Mostrar contraseña"><i class="bi bi-eye"></i></button>
          </div>
          <p class="ap-error" id="areaPrivadaError" aria-live="polite"></p>

          <button type="submit" class="ap-ingresar" id="areaPrivadaIngresar">
            <i class="bi bi-box-arrow-in-right"></i> Ingresar
          </button>
          <p class="ap-nota"><i class="bi bi-info-circle"></i> Si sos paciente, sacá tu turno desde el botón <strong>Turnos</strong>.</p>
        </form>
      </div>
    </div>`;
  document.body.appendChild(contenedor.firstElementChild);

  const elemento = document.getElementById('areaPrivadaModal');
  const clave = document.getElementById('areaPrivadaClave');

  document.getElementById('areaPrivadaForm').addEventListener('submit', e => {
    e.preventDefault();
    ingresarAlAreaPrivada();
  });
  document.getElementById('areaPrivadaVer').addEventListener('click', alternarVerClave);
  clave.addEventListener('input', () => {
    clave.classList.remove('ap-invalido');
    document.getElementById('areaPrivadaError').textContent = '';
  });
  // Al abrir, el cursor queda listo en el campo de contraseña
  elemento.addEventListener('shown.bs.modal', () => clave.focus());
  // Al cerrar, se borra lo escrito
  elemento.addEventListener('hidden.bs.modal', () => {
    clave.value = '';
    clave.type = 'password';
    clave.classList.remove('ap-invalido');
    document.getElementById('areaPrivadaError').textContent = '';
  });

  return new bootstrap.Modal(elemento);
}

// Abre la ventana (si el menú de celular está abierto, primero lo cierra)
function abrirAreaPrivada(modal) {
  const menu = document.querySelector('.navbar-collapse.show');
  if (menu) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  modal.show();
}

// Muestra u oculta los caracteres de la contraseña
function alternarVerClave() {
  const clave = document.getElementById('areaPrivadaClave');
  const boton = document.getElementById('areaPrivadaVer');
  const visible = clave.type === 'text';
  clave.type = visible ? 'password' : 'text';
  boton.innerHTML = `<i class="bi ${visible ? 'bi-eye' : 'bi-eye-slash'}"></i>`;
  boton.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
}

// Verifica la contraseña con api.iniciarSesion() y, si es correcta, abre el panel
async function ingresarAlAreaPrivada() {
  const clave = document.getElementById('areaPrivadaClave');
  const error = document.getElementById('areaPrivadaError');
  const boton = document.getElementById('areaPrivadaIngresar');

  if (!clave.value) {
    error.textContent = 'Ingresá la contraseña.';
    clave.classList.add('ap-invalido');
    clave.focus();
    return;
  }

  const textoOriginal = boton.innerHTML;
  boton.disabled = true;
  boton.innerHTML = '<i class="bi bi-hourglass-split"></i> Verificando...';

  let respuesta;
  try {
    respuesta = await api.iniciarSesion(clave.value);
  } catch (err) {
    error.textContent = 'No pudimos verificar la contraseña. Intentá nuevamente.';
    return;
  } finally {
    boton.disabled = false;
    boton.innerHTML = textoOriginal;
  }

  if (!respuesta.ok) {
    error.textContent = 'Contraseña incorrecta.';
    clave.classList.add('ap-invalido');
    clave.select();
    return;
  }

  if (!(await panelDisponible(CONFIG.urlPanelAdmin))) {
    error.textContent = 'El panel de administración todavía no está disponible en esta dirección.';
    return;
  }

  boton.innerHTML = '<i class="bi bi-check2-circle"></i> Ingresando...';
  window.location.href = CONFIG.urlPanelAdmin;
}

// Comprueba que la página del panel exista antes de ir (evita la pantalla de error).
// Abriendo los archivos directamente (file://) no se puede comprobar, así que se deja pasar.
async function panelDisponible(url) {
  if (window.location.protocol === 'file:') return true;
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch (err) {
    return false;
  }
}
