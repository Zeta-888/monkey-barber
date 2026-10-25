/* =========================================================
   main.js — Funciones generales que usan todas las páginas
   ========================================================= */

/* ---------- Menú de navegación en celulares ---------- */
const botonMenu = document.getElementById("boton-menu");
const menu = document.getElementById("menu");

if (botonMenu) {
  botonMenu.addEventListener("click", function () {
    menu.classList.toggle("abierto");
    botonMenu.setAttribute("aria-expanded", menu.classList.contains("abierto"));
  });
}

/* ---------- Año actual en el pie de página ---------- */
const spanAnio = document.getElementById("anio");
if (spanAnio) {
  spanAnio.textContent = new Date().getFullYear();
}

/* ---------- Enlaces de WhatsApp genéricos ---------- */
const enlacesWhatsapp = document.querySelectorAll("[data-whatsapp]");
for (let i = 0; i < enlacesWhatsapp.length; i++) {
  enlacesWhatsapp[i].href = enlaceWhatsapp("¡Hola Brian! Te escribo desde la página de Monkey Barber.");
}

/* ---------- Tabla de horarios (resalta el día de hoy) ---------- */
function mostrarHorarios() {
  const lista = document.getElementById("lista-horarios");
  if (!lista) return;

  const hoy = new Date().getDay();
  /* Recorremos de lunes (1) a domingo (0) para mostrarlo en orden argentino */
  const orden = [1, 2, 3, 4, 5, 6, 0];
  let html = "";

  for (let i = 0; i < orden.length; i++) {
    const dia = orden[i];
    const horario = HORARIOS[dia];
    let texto = "Cerrado";
    if (horario !== null) {
      texto = minutosAHora(horario.abre) + " — " + minutosAHora(horario.cierra);
    }
    let clases = "";
    if (dia === hoy) clases += " hoy";
    if (horario === null) clases += " cerrado";

    html += '<li class="' + clases.trim() + '"><span>' + DIAS[dia] + "</span><span>" + texto + "</span></li>";
  }
  lista.innerHTML = html;

  /* Estado actual: abierto o cerrado en este momento */
  const estado = document.getElementById("estado-local");
  if (estado) {
    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    const horarioHoy = HORARIOS[hoy];
    if (horarioHoy !== null && minutosAhora >= horarioHoy.abre && minutosAhora < horarioHoy.cierra) {
      estado.textContent = "Abierto ahora";
      estado.classList.add("abierto");
    } else {
      estado.textContent = "Cerrado ahora";
      estado.classList.add("cerrado");
    }
  }
}

/* ---------- Tarjetas de servicios ---------- */
function crearTarjetaServicio(servicio) {
  return (
    '<article class="tarjeta-servicio' + (servicio.imagen ? " con-foto" : "") + '">' +
      (servicio.imagen
        ? '<div class="tarjeta-foto"><img src="' + servicio.imagen + '" alt="" loading="lazy"></div>'
        : "") +
      '<span class="icono-circulo">' + iconoSvg(servicio.icono) + "</span>" +
      "<h3>" + servicio.nombre + "</h3>" +
      "<p>" + servicio.descripcion + "</p>" +
      '<div class="tarjeta-precio">' +
        '<span class="precio">' + formatearPrecio(servicio.precio).replace(" ", "") + "</span>" +
        '<span class="duracion">' + formatearDuracion(servicio.duracion) + "</span>" +
      "</div>" +
      '<a class="enlace-reservar" href="turnos.html?servicio=' + servicio.id + '">Reservar &rarr;</a>' +
    "</article>"
  );
}

function mostrarServicios(idContenedor, cantidad) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  let html = "";
  let limite = cantidad || SERVICIOS.length;
  for (let i = 0; i < limite && i < SERVICIOS.length; i++) {
    html += crearTarjetaServicio(SERVICIOS[i]);
  }
  contenedor.innerHTML = html;
}

/* ---------- Formulario de contacto ---------- */
const formContacto = document.getElementById("form-contacto");
if (formContacto) {
  formContacto.addEventListener("submit", function (evento) {
    /* Todavía no hay backend: armamos el mensaje y lo enviamos por WhatsApp */
    evento.preventDefault();

    const nombre = document.getElementById("c-nombre").value.trim();
    const motivo = document.getElementById("c-motivo").value;
    const mensaje = document.getElementById("c-mensaje").value.trim();

    const texto = "¡Hola Brian! Soy " + nombre + ".\nMotivo: " + motivo + "\n" + mensaje;
    const aviso = document.getElementById("aviso-contacto");
    aviso.innerHTML = '¡Gracias, ' + nombre + '! Tu mensaje está listo. ' +
      '<a href="' + enlaceWhatsapp(texto) + '" target="_blank" rel="noopener">Enviarlo por WhatsApp</a>';
    aviso.hidden = false;
  });
}

/* ---------- Reseñas de Google ---------- */
function estrellasTexto(cantidad) {
  let texto = "";
  for (let i = 1; i <= 5; i++) {
    texto += (i <= cantidad) ? "★" : "☆";
  }
  return texto;
}

function mostrarResenas() {
  const contenedor = document.getElementById("lista-resenas");
  if (!contenedor) return;

  /* Resumen: puntaje, estrellas y cantidad */
  document.getElementById("resenas-puntaje").textContent = RESENAS.puntaje.toString().replace(".", ",");
  document.getElementById("resenas-estrellas").textContent = estrellasTexto(Math.round(RESENAS.puntaje));
  document.getElementById("resenas-cantidad").textContent =
    RESENAS.cantidad + " reseñas en Google · actualizado en " + RESENAS.actualizado;

  /* Tarjetas */
  let html = "";
  for (let i = 0; i < RESENAS.lista.length; i++) {
    const r = RESENAS.lista[i];
    html +=
      '<article class="tarjeta-resena">' +
        '<p class="resena-estrellas" aria-label="' + r.estrellas + ' de 5 estrellas">' + estrellasTexto(r.estrellas) + "</p>" +
        '<blockquote class="resena-texto">“' + r.texto + "”</blockquote>" +
        '<p class="resena-autor"><strong>' + r.nombre + "</strong> · " + r.hace + "</p>" +
      "</article>";
  }
  contenedor.innerHTML = html;

  /* Enlaces a Google (puede haber varios en la página) */
  const enlacesVer = document.querySelectorAll("[data-resenas-ver]");
  for (let i = 0; i < enlacesVer.length; i++) enlacesVer[i].href = RESENAS.verEnGoogle;
}

/* Botones "Dejá tu reseña" (también se usan en local.html, sin la lista) */
const enlacesEscribir = document.querySelectorAll("[data-resena-escribir]");
for (let i = 0; i < enlacesEscribir.length; i++) {
  enlacesEscribir[i].href = RESENAS.escribir;
}

/* ---------- Carrusel de fotos (sección "El barbero") ----------
   Muestra una foto por vez: cambia sola cada 5 segundos (solo mientras
   la sección está en pantalla) y también con las flechas, los puntitos
   o deslizando el dedo en el celular. */
function iniciarCarrusel(idCarrusel) {
  const carrusel = document.getElementById(idCarrusel);
  if (!carrusel) return;

  const fotos = carrusel.querySelectorAll(".carrusel-slide");
  const contenedorPuntos = carrusel.querySelector(".carrusel-puntos");
  let actual = 0;
  let temporizador = null;
  let mouseEncima = false;
  let enPantalla = false;   // el carrusel solo avanza cuando se está viendo

  /* Un puntito por foto */
  for (let i = 0; i < fotos.length; i++) {
    const punto = document.createElement("button");
    punto.type = "button";
    punto.className = "carrusel-punto";
    punto.setAttribute("aria-label", "Ver foto " + (i + 1));
    punto.addEventListener("click", function () {
      mostrar(i);
      reiniciarTemporizador();
    });
    contenedorPuntos.appendChild(punto);
  }
  const puntos = contenedorPuntos.querySelectorAll(".carrusel-punto");

  function mostrar(numero) {
    /* Si se pasa del final vuelve a la primera, y al revés */
    if (numero >= fotos.length) numero = 0;
    if (numero < 0) numero = fotos.length - 1;

    fotos[actual].classList.remove("activo");
    puntos[actual].classList.remove("activo");
    actual = numero;
    fotos[actual].classList.add("activo");
    puntos[actual].classList.add("activo");
  }

  function siguiente() { mostrar(actual + 1); }
  function anterior() { mostrar(actual - 1); }

  /* Cambio automático (no se activa si el usuario pidió menos animaciones) */
  const sinAnimaciones = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function iniciarTemporizador() {
    clearInterval(temporizador);
    /* No avanza solo mientras el mouse está encima */
    if (!sinAnimaciones && !mouseEncima && enPantalla) temporizador = setInterval(siguiente, 5000);
  }
  function detenerTemporizador() { clearInterval(temporizador); }
  function reiniciarTemporizador() { detenerTemporizador(); iniciarTemporizador(); }

  carrusel.querySelector(".siguiente").addEventListener("click", function () {
    siguiente();
    reiniciarTemporizador();
  });
  carrusel.querySelector(".anterior").addEventListener("click", function () {
    anterior();
    reiniciarTemporizador();
  });

  /* Se pausa mientras el mouse está encima */
  carrusel.addEventListener("mouseenter", function () {
    mouseEncima = true;
    detenerTemporizador();
  });
  carrusel.addEventListener("mouseleave", function () {
    mouseEncima = false;
    iniciarTemporizador();
  });

  /* Deslizar con el dedo en el celular */
  let inicioX = 0;
  carrusel.addEventListener("touchstart", function (evento) {
    inicioX = evento.touches[0].clientX;
  }, { passive: true });
  carrusel.addEventListener("touchend", function (evento) {
    const diferencia = evento.changedTouches[0].clientX - inicioX;
    if (Math.abs(diferencia) > 40) {
      if (diferencia < 0) siguiente(); else anterior();
      reiniciarTemporizador();
    }
  });

  /* Arranca recién cuando la sección aparece en pantalla y se pausa al salir.
     La clase "en-marcha" activa el zoom suave de la foto (en el CSS). */
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(function (entradas) {
      enPantalla = entradas[0].isIntersecting;
      carrusel.classList.toggle("en-marcha", enPantalla);
      if (enPantalla) {
        iniciarTemporizador();
      } else {
        detenerTemporizador();
      }
    }, { threshold: 0.4 });
    observador.observe(carrusel);
  } else {
    enPantalla = true;              // navegadores muy viejos: funciona como antes
    carrusel.classList.add("en-marcha");
  }

  mostrar(0);
  iniciarTemporizador();
}

/* ---------- Videos (fondos de encabezado y "La casa") ----------
   Si el usuario pidió menos animaciones en su dispositivo, los videos quedan quietos
   mostrando su primera imagen. Los que no se ven (en celular se ocultan dos) se pausan. */
function controlarVideosDeFondo() {
  const videos = document.querySelectorAll("video[autoplay]");   // videos de fondo y el de "La casa"
  const sinAnimaciones = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (let i = 0; i < videos.length; i++) {
    const oculto = videos[i].offsetParent === null;
    if (sinAnimaciones || oculto) {
      videos[i].pause();
      videos[i].removeAttribute("autoplay");
    } else {
      videos[i].play().catch(function () { /* si el navegador lo bloquea, queda la imagen fija */ });
    }
  }
}

/* ---------- Animación de los números (banda "2 años · 1 barbero · 3 servicios · 5 días") ----------
   Cuando la banda aparece en pantalla, cada número muestra cifras al azar
   (como un tablero que gira) y después se frena en su valor real. Pasa una sola vez. */
function animarNumeros() {
  const banda = document.querySelector(".estadisticas");
  if (!banda) return;

  const numeros = banda.querySelectorAll("[data-numero]");
  const sinAnimaciones = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sinAnimaciones || !("IntersectionObserver" in window)) return;   // quedan los números fijos

  banda.classList.add("preparada");   // los oculta hasta que se vea la banda

  function girarNumero(elemento, demora) {
    const final = elemento.dataset.numero;
    const duracion = 900 + demora;      // cada número se frena un poco después que el anterior
    const inicio = Date.now();

    const intervalo = setInterval(function () {
      if (Date.now() - inicio >= duracion) {
        clearInterval(intervalo);
        elemento.textContent = final;
        elemento.classList.add("fijo");   // pequeño "golpe" al quedar fijo
      } else {
        elemento.textContent = Math.floor(Math.random() * 10);
      }
    }, 70);
  }

  const observador = new IntersectionObserver(function (entradas) {
    if (entradas[0].isIntersecting) {
      banda.classList.add("visible");
      for (let i = 0; i < numeros.length; i++) {
        girarNumero(numeros[i], i * 250);
      }
      observador.disconnect();   // solo la primera vez
    }
  }, { threshold: 0.5 });

  observador.observe(banda);
}

/* ---------- Menú que se ilumina al bajar ("scroll spy") ----------
   Cada sección tiene un atributo data-menu con el link del menú al que corresponde
   (por ejemplo data-menu="servicios.html"). Las secciones están ordenadas igual que
   el menú (La barbería, Servicios, Galería, Contacto, Reservar), así que al bajar el
   brillo avanza de izquierda a derecha sin volver atrás. Se toma la última sección que
   pasó una línea imaginaria al 40 % de la pantalla y se le agrega la clase "brillo"
   al link correspondiente. No hace falta unir las páginas: cada página
   ilumina los links de las secciones que tiene. */
function iluminarMenuAlBajar() {
  const secciones = document.querySelectorAll("[data-menu]");
  const menu = document.getElementById("menu");
  if (!menu || secciones.length < 2) return;   // en páginas con una sola sección no hace falta

  const links = menu.querySelectorAll("a");
  let pendiente = false;
  let destinoFijo = null;   // link elegido con un clic: queda encendido mientras la página se desplaza

  function encender(destino) {
    for (let j = 0; j < links.length; j++) {
      links[j].classList.toggle("brillo", links[j].getAttribute("href") === destino);
    }
    menu.classList.toggle("espiando", destino !== null);   // apaga el "activo" fijo mientras otro brilla
  }

  function actualizar() {
    pendiente = false;
    if (destinoFijo) return;   // durante el desplazamiento automático no se recalcula
    const linea = window.innerHeight * 0.4;
    let destino = null;

    // Se queda con la ÚLTIMA sección marcada cuya parte de arriba ya pasó la línea.
    // Así el brillo avanza en orden y, en las secciones sin link (como las reseñas),
    // sigue encendido el anterior en lugar de apagarse o volver atrás.
    for (let i = 0; i < secciones.length; i++) {
      if (secciones[i].getBoundingClientRect().top <= linea) {
        destino = secciones[i].dataset.menu;
      }
    }

    // Al llegar al final de la página se enciende la última sección, aunque sea corta
    const alFinal = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (alFinal) {
      destino = secciones[secciones.length - 1].dataset.menu;
    }

    encender(destino);
  }

  /* Desplazamiento automático al hacer clic en el menú.
     Si la sección del link está en esta misma página (por ejemplo, Servicios en el Inicio),
     en vez de cambiar de página se desliza suavemente hasta ella. El botón Reservar
     sigue llevando a la página de turnos. */
  const sinAnimaciones = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let temporizadorFin = null;

  function terminarDesplazamiento() {
    destinoFijo = null;
    clearTimeout(temporizadorFin);
    actualizar();
  }

  for (let k = 0; k < links.length; k++) {
    const link = links[k];
    if (link.classList.contains("boton")) continue;   // Reservar no se intercepta

    link.addEventListener("click", function (evento) {
      const href = link.getAttribute("href");
      const seccion = document.querySelector('[data-menu="' + href + '"]');   // la primera de ese link
      if (!seccion) return;            // la sección no está en esta página: navega normal

      evento.preventDefault();
      const alturaMenu = document.querySelector(".encabezado").offsetHeight;   // el menú fijo no debe taparla
      const destinoY = seccion.getBoundingClientRect().top + window.scrollY - alturaMenu;

      destinoFijo = href;
      encender(href);
      window.scrollTo({ top: destinoY, behavior: sinAnimaciones ? "auto" : "smooth" });

      // En celular, cerrar el menú desplegable después de elegir
      menu.classList.remove("abierto");
      const boton = document.getElementById("boton-menu");
      if (boton) boton.setAttribute("aria-expanded", "false");

      // Cuando termina el desplazamiento se vuelve al cálculo normal.
      // "scrollend" no existe en todos los navegadores, por eso también hay un tiempo máximo.
      clearTimeout(temporizadorFin);
      temporizadorFin = setTimeout(terminarDesplazamiento, 1500);
    });
  }

  window.addEventListener("scrollend", function () {
    if (destinoFijo) terminarDesplazamiento();
  });

  // requestAnimationFrame: calcula como mucho una vez por cuadro, así el scroll no se traba
  window.addEventListener("scroll", function () {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizar);
    }
  }, { passive: true });
  window.addEventListener("resize", actualizar);
  actualizar();
}

mostrarHorarios();
mostrarServicios("servicios-destacados", 3);
mostrarServicios("servicios-todos");
mostrarResenas();
iniciarCarrusel("carrusel-brian");
controlarVideosDeFondo();
animarNumeros();
iluminarMenuAlBajar();
