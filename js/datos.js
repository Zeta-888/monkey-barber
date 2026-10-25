/* =========================================================
   datos.js — Información del negocio (Monkey Barber)
   Todos los datos están en variables y arrays para poder
   modificarlos en un solo lugar sin tocar el HTML.
   ========================================================= */

const NEGOCIO = {
  nombre: "Monkey Barber",
  barbero: "Brian Altamiranda",
  direccion: "Vieytes 2494, Bahía Blanca",
  whatsapp: "5492915346482",          // formato internacional sin + ni espacios
  whatsappVisible: "+54 9 291 534-6482",
  instagramLocal: "https://www.instagram.com/monkey.barberclub1/",
  instagramBrian: "https://www.instagram.com/altamirandabrai/",
  mapa: "https://maps.app.goo.gl/6WSRA6rQ1h4XJJ6b7"
};

/* Horario de atención: índice = día de la semana de getDay()
   (0 = domingo, 1 = lunes, ... 6 = sábado).
   null = cerrado. Horas en minutos desde las 00:00 (10:30 = 630). */
const HORARIOS = [
  null,                         // domingo: cerrado
  null,                         // lunes: cerrado
  { abre: 630, cierra: 1230 },  // martes 10:30 a 20:30
  { abre: 630, cierra: 1230 },  // miércoles 10:30 a 20:30
  { abre: 630, cierra: 1230 },  // jueves 10:30 a 20:30
  { abre: 630, cierra: 1230 },  // viernes 10:30 a 20:30
  { abre: 540, cierra: 1230 }   // sábado 9:00 a 20:30
];

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
               "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/* Intervalo entre turnos (minutos) */
const INTERVALO_TURNOS = 30;

/* ---------- WiFi para clientes (página local.html) ----------
   DATOS DE EJEMPLO: reemplazar por la red real del local.
   Si se cambian, hay que volver a generar el QR de WiFi del cartel. */
const WIFI = {
  red: "MonkeyBarber_Clientes",
  clave: "monkey2026",
  seguridad: "WPA"
};

/* ---------- Ruleta de premios ----------
   Cada objeto es una porción de la ruleta (todas se ven del mismo tamaño).
   "probabilidad" es el porcentaje real de que salga esa porción.
   La suma de todas las probabilidades tiene que dar 100.
   "premio: false" significa que no gana nada.
   "corto" (opcional) es el texto que se ve en la ruleta si el original es muy largo. */
const PREMIOS = [
  { texto: "Suerte la próxima", corto: "Suerte", probabilidad: 17,   premio: false },
  { texto: "5% OFF",            probabilidad: 12.5, premio: true, descuento: 5 },
  { texto: "10% OFF",           probabilidad: 15,   premio: true, descuento: 10 },
  { texto: "Suerte la próxima", corto: "Suerte", probabilidad: 17,   premio: false },
  { texto: "Corte gratis",      probabilidad: 0.5,  premio: true, descuento: 100, soloServicio: "corte-regular", destacado: true },
  { texto: "15% OFF",           probabilidad: 7,    premio: true, descuento: 15 },
  { texto: "Suerte la próxima", corto: "Suerte", probabilidad: 16,   premio: false },
  { texto: "5% OFF",            probabilidad: 12.5, premio: true, descuento: 5 },
  { texto: "25% OFF",           probabilidad: 2.5,  premio: true, descuento: 25 }
];
/* "descuento" es el porcentaje que se descuenta del precio.
   "soloServicio" (opcional) limita el premio a un servicio: el corte gratis es solo para el corte regular. */

/* Días que dura un premio desde que se gana.
   0 = solo vale ese mismo día, en la visita en que se giró (lo que pidió Brian). */
const VALIDEZ_PREMIO_DIAS = 0;

/* ---------- Código del día para habilitar la ruleta ----------
   La ruleta solo gira si Brian escribe en el celular del cliente el código del día.
   El código cambia todos los días y Brian lo ve en panel.html.
   CLAVE_RULETA es un número secreto: si se cambia, cambian todos los códigos. */
const CLAVE_RULETA = 7349;

function codigoDelDia(fecha) {
  /* Número del día: 19/10/2026 -> 20261019 */
  const numero = fecha.getFullYear() * 10000 + (fecha.getMonth() + 1) * 100 + fecha.getDate();
  /* Cuentas con resto (%) para mezclar los números: así el código de un día
     no da pistas sobre el del día siguiente */
  let x = (numero * CLAVE_RULETA) % 99991;
  x = (x * x + 1543) % 99991;
  return String(x % 10000).padStart(4, "0");
}

/* ---------- Pagos con Mercado Pago (página local.html) ----------
   DATOS DE EJEMPLO: reemplazar por los reales de Brian.
   - alias: el alias de su cuenta de Mercado Pago, para transferir cualquier monto.
   - linkGeneral: un link de pago de Mercado Pago (opcional). Si queda vacío, el botón
     copia el alias y explica cómo transferir.
   Además, cada servicio puede tener su propio "linkPago" con el precio fijo
   (se crean desde la app de Mercado Pago, en la opción de cobrar con link de pago). */
const PAGOS = {
  alias: "monkey.barber.mp",
  titular: "Brian Altamiranda",
  linkGeneral: ""
};

/* ---------- Reseñas de Google ----------
   Copiadas de Google Maps (octubre de 2026). Se muestran con el nombre y la inicial del apellido.
   Cuando haya reseñas nuevas, se actualizan acá a mano: puntaje, cantidad y la lista. */
const RESENAS = {
  puntaje: 4.7,
  cantidad: 21,
  actualizado: "octubre de 2026",
  verEnGoogle: "https://www.google.com/maps/place/?q=place_id:ChIJb-BqEE677ZUR7Nme8vOy5c4",
  escribir: "https://search.google.com/local/writereview?placeid=ChIJb-BqEE677ZUR7Nme8vOy5c4",
  lista: [
    { nombre: "Cristian H.", estrellas: 5, hace: "hace 10 meses", texto: "Excelente su trabajo, chicos muchas gracias. Los felicito!" },
    { nombre: "Nicolás A.",  estrellas: 5, hace: "hace 2 años",   texto: "Buen ambiente, los pibes buena onda, cortan el pelo de 10." },
    { nombre: "Maxy R.",     estrellas: 5, hace: "hace 3 años",   texto: "Excelentes profesionales y muy buen ambiente 🫂" },
    { nombre: "Emiliano S.", estrellas: 5, hace: "hace 3 años",   texto: "Muy buen trabajo y atención, buen precio 😀" },
    { nombre: "Dino R.",     estrellas: 5, hace: "hace 2 años",   texto: "Buena atención y buenos cortes." },
    { nombre: "Kevin R.",    estrellas: 5, hace: "hace 3 años",   texto: "Muy buena barbería, de las mejores." }
  ]
};

/* Lista de servicios: cada servicio es un objeto dentro del array */
const SERVICIOS = [
  {
    id: "corte-regular",
    nombre: "Corte regular",
    descripcion: "High, Mid o Low Fade, Taper, Buzz Cut, Moicano y más, con terminación a navaja. Incluye perfilado de cejas y barba.",
    duracion: 60,
    precio: 18000,
    icono: "tijera",
    imagen: "img/servicios-fotos/corte-regular.jpg",
    linkPago: ""
  },
  {
    id: "corte-nino",
    nombre: "Corte para niños",
    descripcion: "Corte infantil con paciencia y buena onda, para que los más chicos salgan contentos.",
    duracion: 60,
    precio: 12000,
    icono: "nino",
    imagen: "img/servicios-fotos/corte-nino.jpg",
    linkPago: ""
  },
  {
    id: "corte-jubilado",
    nombre: "Corte para jubilados",
    descripcion: "Corte clásico o moderno, a gusto de cada uno, con precio especial para jubilados.",
    duracion: 60,
    precio: 10000,           // PRECIO DE EJEMPLO: confirmar con Brian
    icono: "peine",
    imagen: "img/servicios-fotos/corte-jubilado.jpg",
    linkPago: ""
  }
];

/* ---------- Funciones de ayuda usadas en varias páginas ---------- */

/* Formatea un número como precio: 25000 -> "$ 25.000" */
function formatearPrecio(numero) {
  return "$ " + numero.toLocaleString("es-AR");
}

/* Convierte minutos a texto de hora: 630 -> "10:30" */
function minutosAHora(minutos) {
  let horas = Math.floor(minutos / 60);
  let mins = minutos % 60;
  return String(horas).padStart(2, "0") + ":" + String(mins).padStart(2, "0");
}

/* Texto de duración: 60 -> "1 h", 120 -> "2 h", 10 -> "10 min" */
function formatearDuracion(minutos) {
  if (minutos >= 60 && minutos % 60 === 0) {
    return (minutos / 60) + " h";
  }
  return minutos + " min";
}

/* Arma el enlace de WhatsApp con un mensaje ya escrito */
function enlaceWhatsapp(mensaje) {
  return "https://wa.me/" + NEGOCIO.whatsapp + "?text=" + encodeURIComponent(mensaje);
}

/* Íconos de línea (SVG) para las tarjetas de servicios */
const ICONOS = {
  tijera:   '<circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8.1 15.9 20 4M15.9 15.9 4 4"/>',
  navaja:   '<path d="M3 17l9-9 3 3-9 9H3z"/><path d="M12 8l5-5 4 4-5 5"/>',
  peine:    '<rect x="3" y="7" width="18" height="4" rx="1"/><path d="M5 11v6M8 11v6M11 11v6M14 11v6M17 11v6M20 11v4"/>',
  estrella: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  nino:     '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0"/><path d="M9 9.5h.01M15 9.5h.01"/>',
  brocha:   '<path d="M9 3h6v6H9z"/><path d="M8 9h8l-1 12H9z"/>',
  casa:     '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'
};

function iconoSvg(nombre) {
  return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    ICONOS[nombre] + "</svg>";
}
