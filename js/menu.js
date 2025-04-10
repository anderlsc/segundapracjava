// Referencia a los botones
const cpuModeButton = document.getElementById("cpuMode");
const twoPlayersModeButton = document.getElementById("twoPlayersMode");

// Función para manejar clics
cpuModeButton.addEventListener("click", () => {
    window.location.href = "index.html"; // Redirigir al juego con lógica de CPU
});

twoPlayersModeButton.addEventListener("click", () => {
    window.location.href = "index.html"; // Redirigir al juego en modo de 2 jugadores
});
