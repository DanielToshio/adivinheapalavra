const socket = io();

const guessInput = document.getElementById('guess');
const guessButton = document.getElementById('guess-button');
const wordDisplay = document.getElementById('word-display');
const guessesDisplay = document.getElementById('guesses-display');
const livesDisplay = document.getElementById('lives-display');
const gameStatus = document.getElementById('game-status');
const notification = document.getElementById('notification');
const restartButton = document.getElementById('restart-button');

guessInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    guessButton.click();
  }
});

guessButton.addEventListener('click', () => {
  const guess = guessInput.value.trim().toLowerCase();
  if (guess && isValidGuess(guess)) {
    socket.emit('guess', guess);
    guessInput.value = '';
  }
});

restartButton.addEventListener('click', () => {
  socket.emit('restartGame');
  guessInput.disabled = false;
  guessButton.disabled = false;
  guessInput.value = '';
  guessInput.focus();
});

socket.on('gameData', (gameData) => {
  wordDisplay.textContent = gameData.word;
  guessesDisplay.textContent = gameData.guesses.join(', ');
  livesDisplay.textContent = gameData.lives;
  if (gameData.isGameOver) {
    gameStatus.textContent = gameData.status;
  } else {
    gameStatus.textContent = '';
  }
  notification.textContent = '';
});

socket.on('gameOver', (data) => {
  const result = data.result;
  const correctWord = data.word;

  gameStatus.textContent = result;
  guessInput.disabled = true;
  guessButton.disabled = true;

  const message = result === 'Você Errou!' ? `A palavra correta era ${correctWord}.` : '';
  notification.textContent = message;
});

socket.on('invalidGuess', (message) => {
  notification.textContent = message;
});

socket.on('duplicateGuess', (message) => {
  notification.textContent = message;
});

function isValidGuess(guess) {
  if (!/^[a-zA-Z]$/.test(guess)) {
    notification.textContent = 'Jogada inválida. Informe apenas uma letra.';
    guessInput.value = '';
    return false;
  }

  if (guess.length > 1) {
    notification.textContent = 'Jogada inválida. Informe apenas uma letra.';
    guessInput.value = '';
    return false;
  }

  return true;
}
