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
    gameStatus.textContent = '';
  } else {
    
  }
  notification.textContent = '';
});

socket.on('gameOver', (result) => {
  gameStatus.textContent = result;
  guessInput.disabled = true;
  guessButton.disabled = true;
});

socket.on('duplicateGuess', (message) => {
  notification.textContent = message;
});

function isValidGuess(guess) {
  if (!/^[a-zA-Z]$/.test(guess)) {
    notification.textContent = 'Jogada inválida. Informe apenas uma letra.';
    return false;
  }
  return true;
}
