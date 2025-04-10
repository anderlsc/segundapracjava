// Variables y configuración inicial
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
const ball = document.getElementById("ball");
const scoreDisplay = document.getElementById("score");
const fieldWidth = window.innerWidth;
const fieldHeight = window.innerHeight;
const playerSize = 50;
const ballSize = 30;
const moveSpeed = 5;
const ballSpeed = 2;
let timer; // Cronómetro
let timeRemaining = 90; // Duración inicial del partido en segundos
const extraTime = 30; // Tiempo extra en caso de empate
let gameEnded = false; // Indica si el juego ha terminado

const initialPositions = {
    player1: { top: fieldHeight * 0.4, left: fieldWidth * 0.1 },
    player2: { top: fieldHeight * 0.4, left: fieldWidth * 0.8 },
    ball: { top: fieldHeight * 0.5, left: fieldWidth * 0.5 }
};

let player1Position = { ...initialPositions.player1 };
let player2Position = { ...initialPositions.player2 };
let ballPosition = { ...initialPositions.ball };
let ballVelocity = { x: 0, y: 0 };
let keysPressed = {}; // Almacena las teclas presionadas
let scores = { player1: 0, player2: 0 };

// Configuración de eventos de teclado
document.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false;
});

// Movimiento continuo
function movePlayers() {
    if (gameEnded) return;

    // Jugador 1 (WASD)
    if (keysPressed["w"]) player1Position.top -= moveSpeed;
    if (keysPressed["s"]) player1Position.top += moveSpeed;
    if (keysPressed["a"]) player1Position.left -= moveSpeed;
    if (keysPressed["d"]) player1Position.left += moveSpeed;

    // Jugador 2 (Flechas)
    if (keysPressed["ArrowUp"]) player2Position.top -= moveSpeed;
    if (keysPressed["ArrowDown"]) player2Position.top += moveSpeed;
    if (keysPressed["ArrowLeft"]) player2Position.left -= moveSpeed;
    if (keysPressed["ArrowRight"]) player2Position.left += moveSpeed;

    // Limitar movimiento dentro del campo
    limitPlayerPosition(player1Position, player1);
    limitPlayerPosition(player2Position, player2);

    // Verificar colisiones con el balón
    checkCollision(player1Position, ballPosition, "player1");
    checkCollision(player2Position, ballPosition, "player2");

    // Mover el balón
    moveBall();

    // Repetir el ciclo
    requestAnimationFrame(movePlayers);
}
// Limitar posición de los jugadores al campo
function limitPlayerPosition(position, player) {
    // Restricciones generales en el campo
    position.top = Math.max(0, Math.min(fieldHeight - playerSize, position.top));
    position.left = Math.max(0, Math.min(fieldWidth - playerSize, position.left));
    
    // Restricciones para evitar que entren en las porterías
    const goalHeight = 150; // Altura de las porterías
    const goalWidth = 80; // Ancho de las porterías

    // Restricción para ambas porterías (jugador 1 y jugador 2)
    if (position.left <= goalWidth) {
        // No pueden entrar en la portería izquierda
        position.left = goalWidth;
    }
    if (position.left >= fieldWidth - goalWidth - playerSize) {
        // No pueden entrar en la portería derecha
        position.left = fieldWidth - goalWidth - playerSize;
    }

    player.style.top = position.top + "px";
    player.style.left = position.left + "px";
}


// Verificar colisión entre jugador y balón
function checkCollision(playerPos, ballPos, player) {
    const distanceX = playerPos.left + playerSize / 2 - (ballPos.left + ballSize / 2);
    const distanceY = playerPos.top + playerSize / 2 - (ballPos.top + ballSize / 2);
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    if (distance < playerSize / 2 + ballSize / 2) {
        // Calcular dirección del rebote
        ballVelocity.x = (distanceX / distance) * ballSpeed;
        ballVelocity.y = (distanceY / distance) * ballSpeed;
    }
}

// Mover el balón
function moveBall() {
    ballPosition.left += ballVelocity.x;
    ballPosition.top += ballVelocity.y;

    // Rebotes en los bordes
    if (ballPosition.left <= 0 || ballPosition.left >= fieldWidth - ballSize) {
        ballVelocity.x *= -1;
    }
    if (ballPosition.top <= 0 || ballPosition.top >= fieldHeight - ballSize) {
        ballVelocity.y *= -1;
    }

    // Reducir velocidad del balón (fricción)
    ballVelocity.x *= 0.99;
    ballVelocity.y *= 0.99;

    // Actualizar posición del balón
    ball.style.left = ballPosition.left + "px";
    ball.style.top = ballPosition.top + "px";

    // Verificar goles
    checkGoal();
}

// Verificar si hay goles
function checkGoal() {
    if (ballPosition.left <= 10) {
        // Gol para el Jugador 2
        scores.player2++;
        updateScore();
        resetPositions();
        checkWinCondition();
    } else if (ballPosition.left + ballSize >= fieldWidth - 10) {
        // Gol para el Jugador 1
        scores.player1++;
        updateScore();
        resetPositions();
        checkWinCondition();
    }
}

// Condiciones para ganar
function checkWinCondition() {
    if (scores.player1 >= 3) {
        endGame("Jugador 1 gana por anotar 3 goles.");
    } else if (scores.player2 >= 3) {
        endGame("Jugador 2 gana por anotar 3 goles.");
    }
}

// Actualizar marcador
function updateScore() {
    scoreDisplay.textContent = `Tiempo: ${timeRemaining}s | Jugador 1: ${scores.player1} | Jugador 2: ${scores.player2}`;
}

// Cronómetro del partido
function startTimer() {
    timer = setInterval(() => {
        timeRemaining--;

        if (timeRemaining <= 0 && !gameEnded) {
            clearInterval(timer);
            checkFinalScore();
        }

        updateScore();
    }, 1000);
}

// Verificar el puntaje final
function checkFinalScore() {
    if (scores.player1 > scores.player2) {
        endGame("Jugador 1 gana por puntaje al finalizar el tiempo.");
    } else if (scores.player2 > scores.player1) {
        endGame("Jugador 2 gana por puntaje al finalizar el tiempo.");
    } else {
        timeRemaining = extraTime; // Tiempo extra
        startTimer();
    }
}

// Terminar el juego
function endGame(message) {
    gameEnded = true;
    alert(message);
    resetPositions();
}

// Reiniciar posiciones y marcador
function resetPositions() {
    player1Position = { ...initialPositions.player1 };
    player2Position = { ...initialPositions.player2 };
    ballPosition = { ...initialPositions.ball };
    ballVelocity = { x: 0, y: 0 };

    limitPlayerPosition(player1Position, player1);
    limitPlayerPosition(player2Position, player2);
    ball.style.left = ballPosition.left + "px";
    ball.style.top = ballPosition.top + "px";
}

// Inicializar el juego
resetPositions();
startTimer();
movePlayers();
