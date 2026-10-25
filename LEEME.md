# Monkey Barber: sitio web (TP Final Integrador, Diseño Web)

## Cómo abrirlo

Hacé doble clic en `index.html`. Se abre en el navegador y no necesita servidor. Las tipografías y el mapa se cargan desde internet.

## Estructura

```
index.html        Inicio: portada, horarios, cómo funciona, servicios destacados, mapa
servicios.html    Todos los servicios con precio y duración
turnos.html       Reserva de turnos en 3 pasos + confirmación por WhatsApp
nosotros.html     Historia, Brian y galería de cortes
contacto.html     Formulario, datos de contacto y mapa
local.html        Página del QR del local: precios, pago con Mercado Pago, ruleta y WiFi (no aparece en el menú)
cartel.html       Cartel A4 para imprimir con el QR de WiFi y el QR de la página del local
panel.html        Panel privado de Brian con el código del día (no está enlazado en ningún lado)
js/panel.js       Muestra el código del día en el panel
js/ruleta.js      Lógica de la página del local: precios con descuento, pagos, ruleta y WiFi
css/estilos.css   Hoja de estilos única
js/datos.js       Datos del negocio: servicios, precios, horarios, WhatsApp
js/main.js        Menú móvil, menú que se ilumina al bajar, horarios, tarjetas de servicios, reseñas, carrusel de Brian, animación de los números, videos y formulario de contacto
js/turnos.js      Lógica de la reserva de turnos
img/qr/           Códigos QR del cartel
img/logo/         Logo de Monkey Barber: el mono (PNG) y el texto dorado vectorizado (monkey-barber.svg, nítido en cualquier tamaño; monkey-barber-alta.png en alta resolución para redes o impresión)
img/servicios-fotos/  Fotos de las tarjetas de servicios (corte regular, niños y jubilados)
img/local/        Foto de la portada (`hero.jpg`) y fotos de Brian
img/cortes/       Fotos de la galería de cortes
video/            Videos de fondo de los encabezados (MP4 + WebM, sin sonido) y su imagen fija
```

## Qué cambiar

- **Precios, servicios u horarios:** se editan solo en `js/datos.js`.
- **Servicios:** Brian ofrece tres: **Corte regular** (incluye perfilado de cejas y barba), **Corte para niños** y **Corte para jubilados**. El precio del corte para jubilados ($18.000) es de ejemplo y hay que confirmarlo con él.
- **Fotos de los servicios:** cada servicio tiene el campo `imagen` en `datos.js`. Las fotos están en `img/servicios-fotos/`, recortadas a 800 × 500 px. Si un servicio no tiene `imagen`, la tarjeta se muestra solo con el ícono.
- **Íconos de servicios:** se eligen con el campo `icono` de cada servicio en `datos.js` (tijera, navaja, peine, estrella, nino, brocha, casa).
- **Fotos:** ya son las reales del local. Para cambiar una, reemplazá el archivo con el mismo nombre (`img/cortes/corte-1.jpg` a `corte-8.jpg`, `img/local/hero.jpg` y las fotos del carrusel de Brian: `brian.jpg`, `brian-2.jpg`, `brian-3.jpg` y `brian-4.jpg`). Conviene que sean JPG de unos 800 px de ancho (1440 px para la portada) para que la página cargue rápido.

## Menú que se ilumina al bajar

- En Inicio y en La barbería, a medida que bajás, se ilumina en el menú el link de la sección que estás viendo (texto con brillo cobre y una rayita debajo; en "Cómo reservar" se enciende el botón Reservar).
- Las secciones del Inicio están en el mismo orden que el menú: La barbería (la banda de videos "Más que un corte", la casa, los números, Brian y la frase), Servicios, Galería (4 fotos con link a la galería completa), Reseñas, Contacto y Cómo reservar. Así el brillo avanza de izquierda a derecha y nunca vuelve a un link anterior. En las reseñas, que no tienen link propio, sigue encendido Galería.
- Cada sección indica a qué link corresponde con el atributo `data-menu` (por ejemplo `<section ... data-menu="servicios.html">`). No hace falta unir las páginas: cada una ilumina los links de las secciones que tiene.
- **Clic en el menú:** si la sección del link está en la misma página (por ejemplo, Servicios estando en el Inicio), la página se desliza sola hasta esa sección en lugar de cambiar de página, y la deja justo debajo del menú fijo. Mientras se desliza, queda encendido el link elegido. En celular, el menú desplegable se cierra solo. El botón **Reservar** siempre lleva a la página de turnos, y desde las páginas que no tienen esa sección (Servicios, Turnos, Contacto) los links navegan normalmente.
- Lo calcula la función `iluminarMenuAlBajar()` de `main.js`: busca la sección que cruza una línea imaginaria al 40 % de la altura de la pantalla.

## Videos de fondo

- Los encabezados de Servicios, Turnos, La barbería y Contacto tienen 4 videos verticales de fondo (2 en celular), cada página en distinto orden. El Inicio repite la banda de La barbería ("Más que un corte") debajo de la cinta de información; ahí el título es un `h2` porque la página ya tiene su `h1` en la portada.
- Cada video está en dos formatos para que funcione en todos los navegadores: `.mp4` y `.webm`, más una imagen `.jpg` que se ve mientras carga.
- Son recortes de 4 a 8 segundos de los reels de Instagram, sin sonido y comprimidos (entre 120 y 240 KB cada uno).
- La sección "La casa" (inicio y La barbería) muestra el video del recorrido por el local (`video/la-casa.mp4` y `.webm`, 13 segundos) en lugar de una foto.
- Si el dispositivo tiene activada la opción "reducir movimiento", los videos quedan quietos.

## Turnos ocupados

Como el sitio no tiene servidor, los horarios ocupados que se ven son de ejemplo: los calcula la función `turnosDeEjemplo()`. Los turnos que reserva cada usuario se guardan en su propio navegador (`localStorage`). La confirmación real la hace Brian cuando responde el mensaje de WhatsApp.

## WiFi y ruleta

- **Datos del WiFi, premios y probabilidades:** se editan en `js/datos.js` (`WIFI` y `PREMIOS`). Las probabilidades tienen que sumar 100.
- **La ruleta se gira delante de Brian.** Para habilitar cada tirada, Brian escribe en el celular del cliente el **código del día**, que ve en `panel.html` (cambia solo a la medianoche). Sin ese código, la ruleta no gira, así que no sirve abrir el link desde la casa ni borrar el historial.
- **El premio vale solo ese día**, en el servicio de esa visita (`VALIDEZ_PREMIO_DIAS = 0`). En la pantalla quedan el premio, un código y la hora del giro.
- **Para probar la ruleta varias veces:** en `panel.html` está el botón "Borrar tirada de este navegador", que reinicia la ruleta solo en el navegador donde se toca.
- Para cambiar todos los códigos (por ejemplo, si alguien descubre el panel), se cambia el número `CLAVE_RULETA` en `datos.js`.
- **Los QR son de ejemplo:** el de WiFi tiene la red `MonkeyBarber_Clientes` y la clave `monkey2026`, y el de la página del local apunta a una dirección provisoria. Hay que generarlos de nuevo con los datos reales y con la dirección del sitio publicado (por ejemplo en GitHub Pages).
- **Para imprimir el cartel:** abrí `cartel.html`, tocá Ctrl+P, elegí A4 vertical y activá "Gráficos de fondo".
- **Limitación:** como no hay servidor, el código del día se calcula con una fórmula que está en el JavaScript. Alguien con conocimientos podría encontrarla leyendo el código, pero igual tendría que girar delante de Brian para que el premio valga. La solución completa (sorteo y registro en un servidor) queda como mejora futura.

## Mercado Pago

- Los datos de pago están en `js/datos.js`, en `PAGOS`. El alias es de ejemplo y hay que reemplazarlo por el de Brian.
- Si Brian crea un link de pago general, se pone en `PAGOS.linkGeneral` y el botón "Pagar con Mercado Pago" lo abre. Si queda vacío, el botón copia el alias y explica cómo transferir.
- Cada servicio puede tener su propio link de pago con precio fijo en su campo `linkPago`. Cuando tiene uno, aparece el botón "Pagar" al lado del precio.
- Si el cliente ganó un premio en la ruleta, los precios de la página ya muestran el descuento aplicado mientras el premio esté vigente.

## Reseñas de Google

- Las reseñas están en `js/datos.js`, en `RESENAS`: puntaje, cantidad, fecha de actualización y la lista que se muestra en el inicio. Se copiaron de Google Maps en octubre de 2026 y se actualizan a mano.
- Los botones "Ver todas en Google" y "Dejá tu reseña" llevan a la ficha real de Monkey BarberClub en Google Maps. La página del local también tiene el botón para dejar una reseña.
