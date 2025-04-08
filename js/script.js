// Referencias a los elementos del juego
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
const ball = document.getElementById("ball");
const goal1 = document.getElementById("goal1");
const goal2 = document.getElementById("goal2");
const scoreDisplay = document.getElementById("score");

// Variables para posiciones y marcador
const initialPositions = {
    player1: { top: 125, left: 25 },
    player2: { top: 125, left: 545 },
    ball: { top: 140, left: 290 }
};
let player1Position = { ...initialPositions.player1 };
let player2Position = { ...initialPositions.player2 };
let ballPosition = { ...initialPositions.ball };
let score = { player1: 0, player2: 0 };

// Dimensiones del campo y elementos
const fieldWidth = 600;
const fieldHeight = 300;
const playerSize = 30;
const ballSize = 20;

// Propiedades del movimiento del balón
let ballSpeedX = 0; // Velocidad en el eje X
let ballSpeedY = 0; // Velocidad en el eje Y

// Fuerza del empuje y disparo
const pushForce = 0.8; // Empuje reducido
const shotForce = 8; // Fuerza del disparo

// Función para mover jugadores
document.addEventListener("keydown", function (event) {
    // Jugador 1 controla con WASD
    if (event.key === "w") player1Position.top -= 10;
    if (event.key === "s") player1Position.top += 10;
    if (event.key === "a") player1Position.left -= 10;
    if (event.key === "d") player1Position.left += 10;

    // Jugador 2 controla con flechas
    if (event.key === "ArrowUp") player2Position.top -= 10;
    if (event.key === "ArrowDown") player2Position.top += 10;
    if (event.key === "ArrowLeft") player2Position.left -= 10;
    if (event.key === "ArrowRight") player2Position.left += 10;

    // Limitar movimientos dentro del campo
    player1Position.top = Math.max(0, Math.min(fieldHeight - playerSize, player1Position.top));
    player1Position.left = Math.max(0, Math.min(fieldWidth - playerSize, player1Position.left));
    player2Position.top = Math.max(0, Math.min(fieldHeight - playerSize, player2Position.top));
    player2Position.left = Math.max(0, Math.min(fieldWidth - playerSize, player2Position.left));

    // Actualizar posiciones de los jugadores
    player1.style.top = player1Position.top + "px";
    player1.style.left = player1Position.left + "px";
    player2.style.top = player2Position.top + "px";
    player2.style.left = player2Position.left + "px";

    // Interacción automática: Empuje del balón
    pushBall();
});

// Función para empujar el balón
function pushBall() {
    const player1Rect = player1.getBoundingClientRect();
    const player2Rect = player2.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();

    // Jugador 1 empuja el balón
    if (
        ballRect.left < player1Rect.right &&
        ballRect.right > player1Rect.left &&
        ballRect.top < player1Rect.bottom &&
        ballRect.bottom > player1Rect.top
    ) {
        ballSpeedX = pushForce;
        ballSpeedY = (Math.random() - 0.5) * pushForce;
    }

    // Jugador 2 empuja el balón
    if (
        ballRect.left < player2Rect.right &&
        ballRect.right > player2Rect.left &&
        ballRect.top < player2Rect.bottom &&
        ballRect.bottom > player2Rect.top
    ) {
        ballSpeedX = -pushForce;
        ballSpeedY = (Math.random() - 0.5) * pushForce;
    }
}

// Función para disparar el balón
document.addEventListener("keydown", function (event) {
    const player1Rect = player1.getBoundingClientRect();
    const player2Rect = player2.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();

    if (event.code === "Space" || event.code === "Enter") {
        // Jugador 1 dispara el balón
        if (
            ballRect.left < player1Rect.right &&
            ballRect.right > player1Rect.left &&
            ballRect.top < player1Rect.bottom &&
            ballRect.bottom > player1Rect.top
        ) {
            ballSpeedX = shotForce;
            ballSpeedY = (Math.random() - 0.5) * shotForce;
        }

        // Jugador 2 dispara el balón
        if (
            ballRect.left < player2Rect.right &&
            ballRect.right > player2Rect.left &&
            ballRect.top < player2Rect.bottom &&
            ballRect.bottom > player2Rect.top
        ) {
            ballSpeedX = -shotForce;
            ballSpeedY = (Math.random() - 0.5) * shotForce;
        }
    }
});

// Actualizar posición del balón
function updateBallPosition() {
    ballPosition.left += ballSpeedX;
    ballPosition.top += ballSpeedY;

    // Rebote en los bordes del campo
    if (ballPosition.left <= 0 || ballPosition.left >= fieldWidth - ballSize) {
        ballSpeedX *= -0.5; // Rebote reducido en X
    }
    if (ballPosition.top <= 0 || ballPosition.top >= fieldHeight - ballSize) {
        ballSpeedY *= -0.5; // Rebote reducido en Y
    }

    // Reducir la velocidad gradualmente (simulación de fricción)
    ballSpeedX *= 0.95;
    ballSpeedY *= 0.95;

    // Detener el balón si la velocidad es muy baja
    if (Math.abs(ballSpeedX) < 0.1) ballSpeedX = 0;
    if (Math.abs(ballSpeedY) < 0.1) ballSpeedY = 0;

    ball.style.left = ballPosition.left + "px";
    ball.style.top = ballPosition.top + "px";

    checkGoal();
    requestAnimationFrame(updateBallPosition);
}

// Verificar goles
function checkGoal() {
    const ballRect = ball.getBoundingClientRect();
    const goal1Rect = goal1.getBoundingClientRect();
    const goal2Rect = goal2.getBoundingClientRect();

    // Gol en portería 1
    if (
        ballRect.left <= goal1Rect.right &&
        ballRect.top >= goal1Rect.top &&
        ballRect.bottom <= goal1Rect.bottom
    ) {
        score.player2++;
        resetPositions();
    }

    // Gol en portería 2
    if (
        ballRect.left + ballSize >= goal2Rect.left &&
        ballRect.top >= goal2Rect.top &&
        ballRect.bottom <= goal2Rect.bottom
    ) {
        score.player1++;
        resetPositions();
    }

    // Actualizar marcador
    scoreDisplay.textContent = `Jugador 1: ${score.player1} | Jugador 2: ${score.player2}`;
}

// Reiniciar posiciones tras un gol
function resetPositions() {
    player1Position = { ...initialPositions.player1 };
    player2Position = { ...initialPositions.player2 };
    ballPosition = { ...initialPositions.ball };

    player1.style.top = player1Position.top + "px";
    player1.style.left = player1Position.left + "px";
    player2.style.top = player2Position.top + "px";
    player2.style.left = player2Position.left + "px";
    ball.style.top = ballPosition.top + "px";
    ball.style.left = ballPosition.left + "px";

    ballSpeedX = 0; // Detener el balón
    ballSpeedY = 0;
}

// Iniciar el juego
updateBallPosition();

