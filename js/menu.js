// Referencia al botón "Iniciar Juego"
const startGameButton = document.getElementById("startGame");

// Al hacer clic, redirige a "juego.html", donde se ejecuta el juego
startGameButton.addEventListener("click", () => {
  // Aquí podrías reproducir un efecto sonoro si lo deseas
  window.location.href = "juego.html";
});