/* =====================================================================
   MAPA DEL FOOTER (Leaflet + OpenStreetMap)
   ---------------------------------------------------------------------
   Lo usan index.html y especialidadesturnos.html. Requiere que antes se
   cargue Leaflet (CSS y JS) y mapa.css. Se dibuja dentro de cualquier
   elemento con class="mapa-cmp".

   PARA CAMBIAR LA UBICACIÓN:
   Buscar el centro en Google Maps, hacer clic derecho sobre el edificio
   y copiar los números que aparecen (latitud, longitud) en MAPA_CMP.coordenadas.
   ===================================================================== */

const MAPA_CMP = {
  // PROVISORIO: OpenStreetMap ubica la calle 24 de Septiembre en Concepción,
  // pero no el número 2070. Reemplazar por las coordenadas exactas del edificio.
  coordenadas: [-27.3442858, -65.5945140],
  zoom: 16,

  nombre: 'Centro Médico Palacio',
  direccion: '24 de Septiembre 2070, Concepción, Tucumán',
  telefono: '+54 (3865) 425356',
  telefonoLink: '+543865425356',
  logo: 'logoNUEVO.png'
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mapa-cmp').forEach(crearMapaDeUbicacion);
});

// Dibuja el mapa con el marcador del centro, el cartel y el botón "Cómo llegar"
function crearMapaDeUbicacion(contenedor) {
  const destino = encodeURIComponent(MAPA_CMP.direccion);
  const urlComoLlegar = `https://www.google.com/maps/dir/?api=1&destination=${destino}`;

  // Si Leaflet no cargó (sin internet o CDN caído), se deja un enlace simple
  if (typeof L === 'undefined') {
    contenedor.classList.add('mapa-cmp--sin-mapa');
    contenedor.innerHTML = `
      <a href="${urlComoLlegar}" target="_blank" rel="noopener">
        <i class="bi bi-geo-alt-fill"></i> Ver ${MAPA_CMP.direccion} en Google Maps
      </a>`;
    return;
  }

  const mapa = L.map(contenedor, {
    center: MAPA_CMP.coordenadas,
    zoom: MAPA_CMP.zoom,
    scrollWheelZoom: false,          // no atrapa la rueda del mouse al bajar por la página
    dragging: !L.Browser.mobile,     // en celulares se puede seguir scrolleando la página
    tap: !L.Browser.mobile
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(mapa);

  const icono = L.divIcon({
    className: 'mapa-cmp-marcador',
    html: `<div class="mapa-cmp-pin"><img src="${MAPA_CMP.logo}" alt=""></div>`,
    iconSize: [46, 56],
    iconAnchor: [23, 56],
    popupAnchor: [0, -52],
    tooltipAnchor: [0, 6]
  });

  L.marker(MAPA_CMP.coordenadas, { icon: icono, title: MAPA_CMP.nombre })
    .addTo(mapa)
    .bindTooltip(MAPA_CMP.nombre, { permanent: true, direction: 'bottom', className: 'mapa-cmp-etiqueta' })
    .bindPopup(`
      <div class="mapa-cmp-popup">
        <strong>${MAPA_CMP.nombre}</strong>
        <span><i class="bi bi-geo-alt-fill"></i> ${MAPA_CMP.direccion}</span>
        <a href="tel:${MAPA_CMP.telefonoLink}"><i class="bi bi-telephone-fill"></i> ${MAPA_CMP.telefono}</a>
        <a class="mapa-cmp-btn" href="${urlComoLlegar}" target="_blank" rel="noopener">
          <i class="bi bi-sign-turn-right-fill"></i> Cómo llegar
        </a>
      </div>`);

  // Botón fijo "Cómo llegar" en la esquina del mapa
  const control = L.control({ position: 'topright' });
  control.onAdd = () => {
    const div = L.DomUtil.create('div', 'mapa-cmp-control');
    div.innerHTML = `<a href="${urlComoLlegar}" target="_blank" rel="noopener"><i class="bi bi-sign-turn-right-fill"></i> Cómo llegar</a>`;
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  control.addTo(mapa);

  // Con el cartel abierto se oculta el botón de la esquina (ya está dentro del cartel)
  mapa.on('popupopen', () => contenedor.classList.add('mapa-cmp--popup-abierto'));
  mapa.on('popupclose', () => contenedor.classList.remove('mapa-cmp--popup-abierto'));

  // La rueda del mouse solo hace zoom después de hacer clic en el mapa
  mapa.on('click', () => mapa.scrollWheelZoom.enable());
  contenedor.addEventListener('mouseleave', () => mapa.scrollWheelZoom.disable());
}
