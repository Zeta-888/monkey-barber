/* =========================================================
   panel.js — Panel privado de Brian (panel.html)
   Muestra el código del día para habilitar la ruleta.
   ========================================================= */
function mostrarCodigo() {
  const hoy = new Date();
  document.getElementById("panel-codigo").textContent = codigoDelDia(hoy);
  document.getElementById("panel-fecha").textContent =
    DIAS[hoy.getDay()] + " " + hoy.getDate() + " de " + MESES[hoy.getMonth()] + " de " + hoy.getFullYear();
}

mostrarCodigo();

/* Se actualiza cada minuto, por si el panel queda abierto después de la medianoche */
setInterval(mostrarCodigo, 60000);

/* ---------- Reiniciar la ruleta en este navegador (para pruebas) ---------- */
document.getElementById("boton-reiniciar").addEventListener("click", function () {
  try {
    localStorage.removeItem("ruletaMonkey");
    localStorage.removeItem("premioMonkey");
    document.getElementById("aviso-reinicio").textContent =
      "Listo: ya podés volver a girar la ruleta en este navegador.";
  } catch (error) {
    document.getElementById("aviso-reinicio").textContent =
      "Este navegador no permite borrar los datos guardados.";
  }
});
