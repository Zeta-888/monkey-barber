/* =========================================================
   ruleta.js — Página del local (local.html)
   1) Precios (con el descuento aplicado si el cliente ganó un premio)
   2) Pago con Mercado Pago
   3) Ruleta: sorteo con probabilidades, una tirada por día
   4) WiFi
   ========================================================= */

/* =========================================================
   FUNCIONES DE AYUDA
   ========================================================= */

/* Copia un texto al portapapeles y cambia el texto del botón un momento */
function copiarTexto(texto, boton, textoOriginal) {
  function listo() {
    boton.textContent = "¡Copiado!";
    boton.classList.add("copiado");
    setTimeout(function () {
      boton.textContent = textoOriginal;
      boton.classList.remove("copiado");
    }, 2500);
  }

  function alternativo() {
    /* Método viejo para navegadores que no tienen la API del portapapeles */
    const campo = document.createElement("textarea");
    campo.value = texto;
    document.body.appendChild(campo);
    campo.select();
    try {
      document.execCommand("copy");
      listo();
    } catch (error) {
      boton.textContent = "Copialo a mano";
    }
    campo.remove();
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).then(listo, alternativo);
  } else {
    alternativo();
  }
}

function hoyTexto() {
  const hoy = new Date();
  return hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
         String(hoy.getDate()).padStart(2, "0");
}

function fechaCorta(fecha) {
  return String(fecha.getDate()).padStart(2, "0") + "/" + String(fecha.getMonth() + 1).padStart(2, "0") +
         "/" + fecha.getFullYear();
}

/* Lee y guarda datos en el navegador (si no se puede, no pasa nada) */
function leerGuardado(clave) {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
  } catch (error) {
    return null;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    /* Si el navegador no permite guardar, la página igual funciona */
  }
}

/* =========================================================
   PREMIO VIGENTE
   Se guarda aparte de la tirada del día porque dura varios días.
   ========================================================= */
function premioVigente() {
  const premio = leerGuardado("premioMonkey");
  if (premio === null) return null;

  /* Si ya venció, no cuenta */
  if (new Date() > new Date(premio.venceISO)) return null;
  return premio;
}

/* Precio final de un servicio según el premio vigente */
function precioConDescuento(servicio, premio) {
  if (premio === null) return null;
  if (premio.soloServicio && premio.soloServicio !== servicio.id) return null;
  return Math.round(servicio.precio * (100 - premio.descuento) / 100);
}

function mostrarAvisoPremio() {
  const aviso = document.getElementById("aviso-premio");
  const premio = premioVigente();

  if (premio === null) {
    aviso.hidden = true;
    return;
  }
  aviso.innerHTML =
    "<p><strong>Tenés " + premio.texto + "</strong> · código <span>" + premio.codigo + "</span></p>" +
    "<p>Válido hoy (" + premio.vence + "), en el servicio de esta visita. Ya lo ves aplicado en los precios.</p>";
  aviso.hidden = false;
}

/* =========================================================
   1) PRECIOS
   ========================================================= */
function mostrarPrecios() {
  const lista = document.getElementById("lista-precios");
  const premio = premioVigente();
  let html = "";

  for (let i = 0; i < SERVICIOS.length; i++) {
    const s = SERVICIOS[i];
    const final = precioConDescuento(s, premio);

    let precioHtml = '<span class="precio-lista">' + formatearPrecio(s.precio) + "</span>";
    if (final !== null) {
      const textoFinal = (final === 0) ? "GRATIS" : formatearPrecio(final);
      precioHtml =
        '<span class="precio-tachado">' + formatearPrecio(s.precio) + "</span>" +
        '<span class="precio-lista precio-descuento">' + textoFinal + "</span>";
    }

    /* Si el servicio tiene su propio link de Mercado Pago, aparece el botón Pagar */
    let botonPago = "";
    if (s.linkPago !== "" && final === null) {
      botonPago = '<a class="pagar-servicio" href="' + s.linkPago + '" target="_blank" rel="noopener">Pagar</a>';
    }

    html +=
      "<li>" +
        '<div class="precio-info">' +
          '<span class="precio-nombre">' + s.nombre + "</span>" +
          '<span class="precio-duracion">' + formatearDuracion(s.duracion) + "</span>" +
        "</div>" +
        '<div class="precio-valores">' + precioHtml + botonPago + "</div>" +
      "</li>";
  }
  lista.innerHTML = html;
}

/* =========================================================
   2) MERCADO PAGO
   ========================================================= */
document.getElementById("pago-alias").textContent = PAGOS.alias;
document.getElementById("pago-titular").textContent = PAGOS.titular;

const botonMp = document.getElementById("boton-mp");
const botonAlias = document.getElementById("boton-copiar-alias");

if (PAGOS.linkGeneral !== "") {
  /* Hay un link de pago: el botón lo abre */
  botonMp.href = PAGOS.linkGeneral;
} else {
  /* No hay link: el botón copia el alias para transferir */
  botonMp.removeAttribute("target");
  botonMp.addEventListener("click", function (evento) {
    evento.preventDefault();
    copiarTexto(PAGOS.alias, botonMp, "Pagar con Mercado Pago");
    document.getElementById("ayuda-pago").classList.add("resaltado");
  });
}

botonAlias.addEventListener("click", function () {
  copiarTexto(PAGOS.alias, botonAlias, "Copiar alias");
});

/* =========================================================
   3) RULETA
   ========================================================= */
const rueda = document.getElementById("rueda");
const botonGirar = document.getElementById("boton-girar");
const resultado = document.getElementById("resultado");

const CANTIDAD = PREMIOS.length;
const GRADOS_PORCION = 360 / CANTIDAD;
let rotacionActual = 0;

/* Dibuja la ruleta: un conic-gradient con una porción por premio
   y los textos girados hasta el centro de cada porción */
function dibujarRuleta() {
  let colores = [];
  let etiquetas = "";

  for (let i = 0; i < CANTIDAD; i++) {
    let color = (i % 2 === 0) ? "#16231e" : "#0d1512";
    if (PREMIOS[i].destacado) color = "#c98a4b";

    const inicio = i * GRADOS_PORCION;
    const fin = inicio + GRADOS_PORCION;
    colores.push(color + " " + inicio + "deg " + fin + "deg");

    const angulo = inicio + GRADOS_PORCION / 2;
    etiquetas +=
      '<span class="porcion-texto' + (PREMIOS[i].destacado ? " destacado" : "") +
      '" style="transform: rotate(' + angulo + 'deg)"><span>' +
      (PREMIOS[i].corto || PREMIOS[i].texto) + "</span></span>";
  }

  rueda.style.background = "conic-gradient(" + colores.join(", ") + ")";
  rueda.innerHTML = etiquetas;
}

/* Sorteo con probabilidades: un número al azar entre 0 y 100 y se recorren
   los premios sumando sus probabilidades hasta pasar ese número */
function sortearIndice() {
  let total = 0;
  for (let i = 0; i < CANTIDAD; i++) {
    total += PREMIOS[i].probabilidad;
  }

  const azar = Math.random() * total;
  let acumulado = 0;
  for (let i = 0; i < CANTIDAD; i++) {
    acumulado += PREMIOS[i].probabilidad;
    if (azar < acumulado) {
      return i;
    }
  }
  return CANTIDAD - 1;
}

/* Código del premio. Ejemplo: MB-1019-K7Q (MB + mes y día + 3 caracteres al azar) */
function generarCodigo() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // sin O, 0, I, 1 para no confundir
  let azar = "";
  for (let i = 0; i < 3; i++) {
    azar += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  const hoy = new Date();
  const mmdd = String(hoy.getMonth() + 1).padStart(2, "0") + String(hoy.getDate()).padStart(2, "0");
  return "MB-" + mmdd + "-" + azar;
}

function mostrarResultado(tirada) {
  const premio = PREMIOS[tirada.indice];

  if (!premio.premio) {
    resultado.innerHTML =
      '<p class="resultado-titulo">Suerte la próxima 🙈</p>' +
      "<p>Hoy no salió nada, pero mañana podés volver a girar.</p>";
  } else {
    resultado.innerHTML =
      '<p class="resultado-etiqueta">¡Ganaste!</p>' +
      '<p class="resultado-titulo">' + premio.texto + "</p>" +
      '<p class="resultado-codigo">' + tirada.codigo + "</p>" +
      '<p class="resultado-hora">Girado el ' + tirada.vence + " a las " + tirada.hora + "</p>" +
      "<p>Mostrale esta pantalla a Brian: el premio vale <strong>hoy, en este corte</strong>.</p>" +
      '<a href="#precios" class="enlace-flecha">Ver precios con tu descuento &uarr;</a>';
  }
  resultado.hidden = false;
  resultado.classList.toggle("gano", premio.premio);
}

function bloquearPorHoy() {
  document.getElementById("desbloqueo").hidden = true;
  botonGirar.hidden = false;
  botonGirar.disabled = true;
  botonGirar.textContent = "Ya giraste hoy";
}

/* ---------- Desbloqueo con el código del día ----------
   Brian escribe el código en el celular del cliente. Si es correcto,
   aparece el botón para girar (una sola vez). */
const inputCodigo = document.getElementById("codigo-brian");
const avisoCodigo = document.getElementById("aviso-codigo");

function habilitarTirada() {
  if (inputCodigo.value.trim() === codigoDelDia(new Date())) {
    document.getElementById("desbloqueo").hidden = true;
    botonGirar.hidden = false;
    botonGirar.disabled = false;
    botonGirar.focus();
  } else {
    avisoCodigo.textContent = "Código incorrecto. Pedíselo a Brian.";
    inputCodigo.value = "";
    inputCodigo.focus();
  }
}

document.getElementById("boton-habilitar").addEventListener("click", habilitarTirada);

/* También se puede habilitar apretando Enter en el teclado */
inputCodigo.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    evento.preventDefault();   // evita que el Enter también "toque" el botón de girar
    habilitarTirada();
  }
});

botonGirar.addEventListener("click", function () {
  const anterior = leerGuardado("ruletaMonkey");
  if (anterior && anterior.fecha === hoyTexto()) {
    mostrarResultado(anterior);
    bloquearPorHoy();
    return;
  }

  botonGirar.disabled = true;
  botonGirar.textContent = "Girando…";
  resultado.hidden = true;

  const indice = sortearIndice();

  /* Ángulo para que el centro de la porción ganadora quede debajo del indicador.
     Se suma un desvío al azar dentro de la porción para que no frene siempre en el medio. */
  const centroPorcion = indice * GRADOS_PORCION + GRADOS_PORCION / 2;
  const desvio = (Math.random() - 0.5) * GRADOS_PORCION * 0.6;
  const vueltas = 6 * 360;
  const destino = vueltas + (360 - centroPorcion) - desvio;

  rotacionActual = rotacionActual - (rotacionActual % 360) + destino;
  rueda.style.transform = "rotate(" + rotacionActual + "deg)";

  /* Cuando termina la animación (5 segundos) se muestra el resultado */
  setTimeout(function () {
    const vence = new Date();
    vence.setDate(vence.getDate() + VALIDEZ_PREMIO_DIAS);
    vence.setHours(23, 59, 59);
    const ahora = new Date();

    const tirada = {
      fecha: hoyTexto(),
      indice: indice,
      codigo: generarCodigo(),
      vence: fechaCorta(vence),
      hora: String(ahora.getHours()).padStart(2, "0") + ":" + String(ahora.getMinutes()).padStart(2, "0")
    };
    guardar("ruletaMonkey", tirada);

    /* Si ganó, se guarda el premio vigente y se actualizan los precios */
    const premio = PREMIOS[indice];
    if (premio.premio) {
      guardar("premioMonkey", {
        texto: premio.texto,
        descuento: premio.descuento,
        soloServicio: premio.soloServicio || null,
        codigo: tirada.codigo,
        vence: tirada.vence,
        venceISO: vence.toISOString()
      });
      mostrarAvisoPremio();
      mostrarPrecios();
    }

    mostrarResultado(tirada);
    bloquearPorHoy();
  }, 5200);
});

/* Tabla de probabilidades: se agrupan las porciones con el mismo texto */
function mostrarProbabilidades() {
  const textos = [];
  const sumas = [];

  for (let i = 0; i < CANTIDAD; i++) {
    const posicion = textos.indexOf(PREMIOS[i].texto);
    if (posicion === -1) {
      textos.push(PREMIOS[i].texto);
      sumas.push(PREMIOS[i].probabilidad);
    } else {
      sumas[posicion] += PREMIOS[i].probabilidad;
    }
  }

  let html = "";
  for (let i = 0; i < textos.length; i++) {
    html += "<li><span>" + textos[i] + "</span><span>" +
            sumas[i].toString().replace(".", ",") + " %</span></li>";
  }
  document.getElementById("lista-probabilidades").innerHTML = html;
}

/* =========================================================
   4) WIFI
   ========================================================= */
document.getElementById("wifi-red").textContent = WIFI.red;
document.getElementById("wifi-clave").textContent = WIFI.clave;

const botonCopiar = document.getElementById("boton-copiar");
botonCopiar.addEventListener("click", function () {
  copiarTexto(WIFI.clave, botonCopiar, "Copiar contraseña");
});

/* =========================================================
   INICIO
   ========================================================= */
mostrarAvisoPremio();
mostrarPrecios();
dibujarRuleta();
mostrarProbabilidades();

/* Si ya giró hoy, la ruleta queda frenada en su premio */
const tiradaDeHoy = leerGuardado("ruletaMonkey");
if (tiradaDeHoy && tiradaDeHoy.fecha === hoyTexto()) {
  const centro = tiradaDeHoy.indice * GRADOS_PORCION + GRADOS_PORCION / 2;
  rotacionActual = 360 - centro;
  rueda.style.transition = "none";
  rueda.style.transform = "rotate(" + rotacionActual + "deg)";
  mostrarResultado(tiradaDeHoy);
  bloquearPorHoy();
}
