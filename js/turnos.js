/* =========================================================
   turnos.js — Reserva de turnos en 3 pasos
   1) Elegir servicio  2) Elegir fecha y horario  3) Datos
   Al final se arma un mensaje y se envía por WhatsApp a Brian.
   ========================================================= */

/* ---------- Estado de la reserva ---------- */
let servicioElegido = null;   // objeto del array SERVICIOS
let fechaElegida = "";        // texto "aaaa-mm-dd"
let horaElegida = null;       // minutos desde las 00:00

/* ---------- Elementos del HTML ---------- */
const listaServicios = document.getElementById("lista-servicios");
const inputFecha = document.getElementById("fecha");
const avisoFecha = document.getElementById("aviso-fecha");
const grillaHorarios = document.getElementById("grilla-horarios");
const formTurno = document.getElementById("form-turno");
const resumen = document.getElementById("resumen");
const paso2 = document.getElementById("paso-2");
const paso3 = document.getElementById("paso-3");

/* =========================================================
   FECHAS
   ========================================================= */

/* Convierte un objeto Date a texto "aaaa-mm-dd" (formato del input date) */
function fechaATexto(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

/* Convierte "aaaa-mm-dd" a Date (en horario local, sin problemas de zona horaria) */
function textoAFecha(texto) {
  const partes = texto.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

/* "2026-10-20" -> "Martes 20 de octubre" */
function fechaLarga(texto) {
  const fecha = textoAFecha(texto);
  return DIAS[fecha.getDay()] + " " + fecha.getDate() + " de " + MESES[fecha.getMonth()];
}

/* Configura el calendario: desde hoy hasta 30 días después */
function configurarCalendario() {
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + 30);
  inputFecha.min = fechaATexto(hoy);
  inputFecha.max = fechaATexto(limite);
}

/* =========================================================
   TURNOS OCUPADOS
   Sin un servidor no podemos saber los turnos reales, así que:
   - generamos turnos ocupados de EJEMPLO para cada día, y
   - guardamos en el navegador los turnos que reserva el usuario.
   ========================================================= */

/* Turnos de ejemplo: se calculan a partir del número de día,
   así cada fecha muestra siempre los mismos horarios ocupados. */
function turnosDeEjemplo(texto) {
  const fecha = textoAFecha(texto);
  const horario = HORARIOS[fecha.getDay()];
  const ocupados = [];
  if (horario === null) return ocupados;

  let indice = 0;
  for (let m = horario.abre; m < horario.cierra; m += INTERVALO_TURNOS) {
    if ((fecha.getDate() * 7 + indice * 5) % 9 < 2) {
      ocupados.push({ inicio: m, fin: m + INTERVALO_TURNOS });
    }
    indice++;
  }
  return ocupados;
}

/* Turnos guardados por el usuario en este navegador */
function leerTurnosGuardados() {
  try {
    const datos = localStorage.getItem("turnosMonkey");
    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    return [];
  }
}

function guardarTurno(turno) {
  const turnos = leerTurnosGuardados();
  turnos.push(turno);
  try {
    localStorage.setItem("turnosMonkey", JSON.stringify(turnos));
  } catch (error) {
    /* Si el navegador no permite guardar, el turno igual se envía por WhatsApp */
  }
}

/* Junta los turnos de ejemplo con los guardados para una fecha */
function turnosOcupados(texto) {
  const ocupados = turnosDeEjemplo(texto);
  const guardados = leerTurnosGuardados();
  for (let i = 0; i < guardados.length; i++) {
    if (guardados[i].fecha === texto) {
      ocupados.push({ inicio: guardados[i].inicio, fin: guardados[i].inicio + guardados[i].duracion });
    }
  }
  return ocupados;
}

/* Un horario está libre si el servicio completo no se superpone con ningún turno */
function estaLibre(inicio, duracion, ocupados) {
  const fin = inicio + duracion;
  for (let i = 0; i < ocupados.length; i++) {
    if (inicio < ocupados[i].fin && fin > ocupados[i].inicio) {
      return false;
    }
  }
  return true;
}

/* =========================================================
   PASO 1 — SERVICIOS
   ========================================================= */
function mostrarOpcionesServicio() {
  let html = "";
  for (let i = 0; i < SERVICIOS.length; i++) {
    const s = SERVICIOS[i];
    html +=
      '<label class="opcion-servicio">' +
        '<input type="radio" name="servicio" value="' + s.id + '">' +
        '<span class="opcion-contenido">' +
          '<span class="opcion-nombre">' + s.nombre + "</span>" +
          '<span class="opcion-detalle">' + formatearDuracion(s.duracion) + " · " + formatearPrecio(s.precio) + "</span>" +
        "</span>" +
      "</label>";
  }
  listaServicios.innerHTML = html;

  const radios = document.querySelectorAll('input[name="servicio"]');
  for (let i = 0; i < radios.length; i++) {
    radios[i].addEventListener("change", function () {
      elegirServicio(this.value);
    });
  }
}

function elegirServicio(id) {
  servicioElegido = SERVICIOS.find(function (s) { return s.id === id; });
  horaElegida = null;
  paso2.classList.remove("bloqueado");
  paso3.classList.add("bloqueado");
  resumen.hidden = true;
  if (fechaElegida !== "") {
    mostrarHorariosDisponibles();
  }
}

/* =========================================================
   PASO 2 — FECHA Y HORARIO
   ========================================================= */
inputFecha.addEventListener("change", function () {
  fechaElegida = "";
  horaElegida = null;
  grillaHorarios.innerHTML = "";
  paso3.classList.add("bloqueado");
  resumen.hidden = true;
  avisoFecha.textContent = "";

  if (this.value === "") return;

  const fecha = textoAFecha(this.value);
  const hoy = textoAFecha(fechaATexto(new Date()));

  if (fecha < hoy) {
    avisoFecha.textContent = "No podés elegir una fecha pasada.";
    return;
  }
  if (HORARIOS[fecha.getDay()] === null) {
    let nombreDia = DIAS[fecha.getDay()].toLowerCase();
    if (!nombreDia.endsWith("s")) nombreDia += "s";   // domingo -> domingos
    avisoFecha.textContent = "Los " + nombreDia + " estamos cerrados. Atendemos de martes a sábados.";
    return;
  }

  fechaElegida = this.value;
  mostrarHorariosDisponibles();
});

function mostrarHorariosDisponibles() {
  const fecha = textoAFecha(fechaElegida);
  const horario = HORARIOS[fecha.getDay()];
  const ocupados = turnosOcupados(fechaElegida);

  /* Si la fecha es hoy, no se muestran los horarios que ya pasaron */
  const ahora = new Date();
  const esHoy = fechaElegida === fechaATexto(ahora);
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  let html = "";
  let cantidadLibres = 0;

  for (let m = horario.abre; m < horario.cierra; m += INTERVALO_TURNOS) {
    const terminaATiempo = m + servicioElegido.duracion <= horario.cierra;
    const yaPaso = esHoy && m <= minutosAhora;
    const libre = terminaATiempo && !yaPaso && estaLibre(m, servicioElegido.duracion, ocupados);

    if (libre) cantidadLibres++;
    html += '<button type="button" class="hora" data-minutos="' + m + '"' +
            (libre ? "" : " disabled") + ">" + minutosAHora(m) + "</button>";
  }

  grillaHorarios.innerHTML = html;

  if (cantidadLibres === 0) {
    avisoFecha.textContent = "No quedan horarios libres para este día. Probá con otra fecha.";
  } else {
    avisoFecha.textContent = cantidadLibres + " horarios disponibles para " + fechaLarga(fechaElegida) + ".";
  }

  const botones = grillaHorarios.querySelectorAll(".hora");
  for (let i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click", function () {
      elegirHora(this);
    });
  }
}

function elegirHora(boton) {
  const anterior = grillaHorarios.querySelector(".seleccionado");
  if (anterior) anterior.classList.remove("seleccionado");
  boton.classList.add("seleccionado");

  horaElegida = Number(boton.dataset.minutos);
  paso3.classList.remove("bloqueado");
  resumen.hidden = true;
  paso3.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =========================================================
   PASO 3 — DATOS Y CONFIRMACIÓN
   ========================================================= */
formTurno.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (servicioElegido === null || fechaElegida === "" || horaElegida === null) {
    alert("Completá el servicio, la fecha y el horario antes de confirmar.");
    return;
  }

  const nombre = document.getElementById("t-nombre").value.trim();
  const telefono = document.getElementById("t-telefono").value.trim();
  const comentario = document.getElementById("t-comentario").value.trim();

  /* Mensaje que le llega a Brian por WhatsApp */
  let mensaje =
    "¡Hola Brian! Quiero reservar un turno en Monkey Barber 💈\n\n" +
    "✂️ Servicio: " + servicioElegido.nombre + "\n" +
    "📅 Día: " + fechaLarga(fechaElegida) + "\n" +
    "🕐 Hora: " + minutosAHora(horaElegida) + " hs\n" +
    "💲 Precio: " + formatearPrecio(servicioElegido.precio) + "\n" +
    "👤 Nombre: " + nombre + "\n" +
    "📱 Teléfono: " + telefono;
  if (comentario !== "") {
    mensaje += "\n📝 Comentario: " + comentario;
  }

  /* Mostramos el resumen en la página */
  document.getElementById("r-servicio").textContent = servicioElegido.nombre;
  document.getElementById("r-fecha").textContent = fechaLarga(fechaElegida);
  document.getElementById("r-hora").textContent = minutosAHora(horaElegida) + " hs";
  document.getElementById("r-precio").textContent = formatearPrecio(servicioElegido.precio);
  document.getElementById("r-nombre").textContent = nombre;
  document.getElementById("boton-whatsapp").href = enlaceWhatsapp(mensaje);
  resumen.hidden = false;
  resumen.scrollIntoView({ behavior: "smooth", block: "start" });

  /* Guardamos el turno para que ese horario aparezca ocupado */
  guardarTurno({
    fecha: fechaElegida,
    inicio: horaElegida,
    duracion: servicioElegido.duracion,
    servicio: servicioElegido.id,
    nombre: nombre
  });
});

/* Botón para reservar otro turno */
document.getElementById("boton-otro").addEventListener("click", function () {
  window.location.href = "turnos.html";
});

/* =========================================================
   INICIO
   ========================================================= */
configurarCalendario();
mostrarOpcionesServicio();

/* Si se llegó desde "Reservar" en un servicio (turnos.html?servicio=corte-barba),
   ese servicio queda elegido de entrada */
const parametros = new URLSearchParams(window.location.search);
const servicioDesdeUrl = parametros.get("servicio");
if (servicioDesdeUrl) {
  const radio = document.querySelector('input[name="servicio"][value="' + servicioDesdeUrl + '"]');
  if (radio) {
    radio.checked = true;
    elegirServicio(servicioDesdeUrl);
  }
}
