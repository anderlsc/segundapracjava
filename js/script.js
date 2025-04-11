document.addEventListener("DOMContentLoaded", function() {
  // Dimensiones del campo
  var fieldWidth = window.innerWidth;
  var fieldHeight = window.innerHeight;

  // Referencias al DOM
  var player1 = document.getElementById("player1");
  var player2 = document.getElementById("player2");
  var ball = document.getElementById("ball");
  var scoreDisplay = document.getElementById("score");
  var goal1 = document.getElementById("goal1");
  var goal2 = document.getElementById("goal2");

  // Constantes de configuración
  var playerSize = 50;    // Tamaño del jugador (px)
  var ballSize = 30;      // Tamaño del balón (px)
  var moveSpeed = 5;      // Velocidad de movimiento de los jugadores
  var ballSpeed = 2;      // Velocidad inicial del balón al impactar
  var frictionFactor = 0.99; // Factor de fricción
  var WINNING_SCORE = 3;     // Gana el primero en anotar 3 goles

  // Variables del juego
  var timer;
  var timeRemaining = 90;
  var gameEnded = false;

  // Función para calcular posiciones iniciales según el tamaño de la ventana
  var computeInitialPositions = function() {
    return {
      player1: {
        top: (fieldHeight - playerSize) / 2,
        left: fieldWidth * 0.05
      },
      player2: {
        top: (fieldHeight - playerSize) / 2,
        left: fieldWidth * 0.95 - playerSize
      },
      ball: {
        top: (fieldHeight - ballSize) / 2,
        left: (fieldWidth - ballSize) / 2
      }
    };
  };

  var initialPositions = computeInitialPositions();
  var player1Position = { top: initialPositions.player1.top, left: initialPositions.player1.left };
  var player2Position = { top: initialPositions.player2.top, left: initialPositions.player2.left };
  var ballPosition = { top: initialPositions.ball.top, left: initialPositions.ball.left };
  var ballVelocity = { x: 0, y: 0 };

  var keysPressed = {};    // Almacena las teclas presionadas
  var scores = { player1: 0, player2: 0 };

  // Manejo de eventos de teclado
  document.addEventListener("keydown", function(event) {
    keysPressed[event.key] = true;
  });
  document.addEventListener("keyup", function(event) {
    keysPressed[event.key] = false;
  });

  // Actualizar dimensiones al redimensionar
  window.addEventListener("resize", function() {
    fieldWidth = window.innerWidth;
    fieldHeight = window.innerHeight;
    initialPositions = computeInitialPositions();
    limitPlayerPosition(player1Position, player1);
    limitPlayerPosition(player2Position, player2);
  });

  // Función para actualizar el marcador (concatenación de cadenas)
  var updateDisplay = function() {
    scoreDisplay.textContent =
      "Tiempo: " +
      timeRemaining +
      "s | Jugador 1: " +
      scores.player1 +
      " | Jugador 2: " +
      scores.player2;
  };

  // Limitar el movimiento de los jugadores dentro del campo
  var limitPlayerPosition = function(position, player) {
    position.top = Math.max(0, Math.min(fieldHeight - playerSize, position.top));
    position.left = Math.max(0, Math.min(fieldWidth - playerSize, position.left));
    // Evitar acercarse demasiado al borde (para acomodar el balón)
    if (position.left <= ballSize) {
      position.left = ballSize;
    }
    if (position.left >= fieldWidth - ballSize - playerSize) {
      position.left = fieldWidth - ballSize - playerSize;
    }
    player.style.top = position.top + "px";
    player.style.left = position.left + "px";
  };

  // Detección básica de colisiones entre dos elementos usando sus bounding boxes
  var isCollision = function(elem1, elem2) {
    var rect1 = elem1.getBoundingClientRect();
    var rect2 = elem2.getBoundingClientRect();
    return (
      rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top
    );
  };

  // Función que verifica si el balón colisiona con alguna portería y, si es así,
  // suma el gol, revisa la condición de ganar y reinicia las posiciones.
  var checkForGoal = function() {
    if (isCollision(ball, goal1)) {
      scores.player2++;
      updateDisplay();
      if (scores.player2 >= WINNING_SCORE) {
        endGame("¡Jugador 2 gana al anotar 3 goles!");
        return true;
      }
      resetPositions();
      return true;
    }
    if (isCollision(ball, goal2)) {
      scores.player1++;
      updateDisplay();
      if (scores.player1 >= WINNING_SCORE) {
        endGame("¡Jugador 1 gana al anotar 3 goles!");
        return true;
      }
      resetPositions();
      return true;
    }
    return false;
  };

  // Función para mover el balón y detectar goles
  var moveBall = function() {
    ballPosition.left += ballVelocity.x;
    ballPosition.top += ballVelocity.y;
    ball.style.left = ballPosition.left + "px";
    ball.style.top = ballPosition.top + "px";

    if (checkForGoal()) {
      return;
    }

    // Rebote en bordes superior e inferior
    if (ballPosition.top <= 0 || ballPosition.top + ballSize >= fieldHeight) {
      ballVelocity.y *= -1;
    }
    // Rebote en bordes laterales si no se anota gol
    if (ballPosition.left <= 0 || ballPosition.left + ballSize >= fieldWidth) {
      ballVelocity.x *= -1;
    }

    // Aplicar fricción para simular desaceleración
    ballVelocity.x *= frictionFactor;
    ballVelocity.y *= frictionFactor;

    // Limitar la velocidad máxima del balón
    var maxBallSpeed = 10;
    if (Math.abs(ballVelocity.x) > maxBallSpeed) {
      ballVelocity.x = maxBallSpeed * (ballVelocity.x < 0 ? -1 : 1);
    }
    if (Math.abs(ballVelocity.y) > maxBallSpeed) {
      ballVelocity.y = maxBallSpeed * (ballVelocity.y < 0 ? -1 : 1);
    }
  };

  // Detección de colisiones entre jugador y balón para "patear" el balón
  var checkCollisionBetweenPlayerAndBall = function(playerPos, ballPos) {
    var centerPlayerX = playerPos.left + playerSize / 2;
    var centerPlayerY = playerPos.top + playerSize / 2;
    var centerBallX = ballPos.left + ballSize / 2;
    var centerBallY = ballPos.top + ballSize / 2;
    var dx = centerPlayerX - centerBallX;
    var dy = centerPlayerY - centerBallY;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (playerSize / 2 + ballSize / 2)) {
      var normX = dx / distance;
      var normY = dy / distance;
      ballVelocity.x = normX * ballSpeed;
      ballVelocity.y = normY * ballSpeed;
      ball.classList.add("hit");
      setTimeout(function() {
        ball.classList.remove("hit");
      }, 300);
    }
  };

  // Movimiento continuo de jugadores y actualización del balón
  var movePlayers = function() {
    if (gameEnded) return;

    // Controles Jugador 1 (W, A, S, D)
    if (keysPressed["w"]) {
      player1Position.top -= moveSpeed;
    }
    if (keysPressed["s"]) {
      player1Position.top += moveSpeed;
    }
    if (keysPressed["a"]) {
      player1Position.left -= moveSpeed;
    }
    if (keysPressed["d"]) {
      player1Position.left += moveSpeed;
    }

    // Controles Jugador 2 (Flechas)
    if (keysPressed["ArrowUp"]) {
      player2Position.top -= moveSpeed;
    }
    if (keysPressed["ArrowDown"]) {
      player2Position.top += moveSpeed;
    }
    if (keysPressed["ArrowLeft"]) {
      player2Position.left -= moveSpeed;
    }
    if (keysPressed["ArrowRight"]) {
      player2Position.left += moveSpeed;
    }

    limitPlayerPosition(player1Position, player1);
    limitPlayerPosition(player2Position, player2);

    checkCollisionBetweenPlayerAndBall(player1Position, ballPosition);
    checkCollisionBetweenPlayerAndBall(player2Position, ballPosition);

    moveBall();

    requestAnimationFrame(movePlayers);
  };

  // Cronómetro del partido
  var startTimer = function() {
    timer = setInterval(function() {
      timeRemaining--;
      updateDisplay();
      if (timeRemaining <= 0 && !gameEnded) {
        clearInterval(timer);
        if (scores.player1 > scores.player2) {
          endGame("¡Tiempo agotado! Jugador 1 gana.");
        } else if (scores.player2 > scores.player1) {
          endGame("¡Tiempo agotado! Jugador 2 gana.");
        } else {
          endGame("¡Tiempo agotado! Es un empate.");
        }
      }
    }, 1000);
  };

  // Reiniciar posiciones a los valores iniciales
  var resetPositions = function() {
    player1.style.transition = "none";
    player2.style.transition = "none";
    ball.style.transition = "none";

    player1Position = { top: initialPositions.player1.top, left: initialPositions.player1.left };
    player2Position = { top: initialPositions.player2.top, left: initialPositions.player2.left };
    ballPosition = { top: initialPositions.ball.top, left: initialPositions.ball.left };
    ballVelocity = { x: 0, y: 0 };

    limitPlayerPosition(player1Position, player1);
    limitPlayerPosition(player2Position, player2);

    ball.style.left = ballPosition.left + "px";
    ball.style.top = ballPosition.top + "px";

    // Forzar reflow para aplicar inmediatamente los cambios
    void ball.offsetWidth;

    player1.style.transition = "top 0.1s linear, left 0.1s linear";
    player2.style.transition = "top 0.1s linear, left 0.1s linear";
    ball.style.transition = "top 0.1s linear, left 0.1s linear";
  };

  // Finaliza el juego, detiene el cronómetro y redirige a "menu.html"
  var endGame = function(message) {
    gameEnded = true;
    clearInterval(timer);
    alert(message);
    resetPositions();
    window.location.href = "index.html";
  };

  // Inicialización del juego
  resetPositions();
  updateDisplay();
  startTimer();
  requestAnimationFrame(movePlayers);
});