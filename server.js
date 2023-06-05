const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;

let word = '';
let guesses = [];
let lives = 7;
let status = 'Jogando';



function initializeGame() {
  // Palavra aleatória
  const words = ['gato', 'cachorro', 'elefante', 'leao', 'tigre', 'girafa', 'gralha', 'harpia',  'jacu', 'javali',  'kiwi', 'linguado', 'lama', 'marreco',  'sofa', 'mesa', 'cadeira', 'geladeira', 'televisao', 'computador', 'abajur', 'espelho', 'lampada', 'ventilador', 'panela', 'escova', 'aspirador', 'abajur', 'vaso', 'máquina', 'telefone',  'tapete', 'escada', 'prato', 'copo',  'garrafa', 'colher', 'tigela', 'cabide', 'cinzeiro', 'enfeite', 'cadeado', 'faca', 'chave', 'caneta', 'estojo', 'prateleira',  'abajur', 'espelho', 'lampada'];
  word = words[Math.floor(Math.random() * words.length)];

  // Definir o número de vidas com base no tamanho da palavra
  lives = word.length;

  // Reinicialize as variáveis do jogo
  guesses = [];
}

function handleGuess(guess, socket) {
  // Verificar se a jogada é uma única letra
  if (!/^[a-zA-Z]$/.test(guess)) {
    socket.emit('invalidGuess', 'Jogada inválida. Informe apenas uma letra.');
    return;
  }

  if (guesses.includes(guess)) {
    // A letra já foi informada, exibe uma mensagem de aviso
    socket.emit('duplicateGuess', 'Esta letra já foi informada. Tente outra.');
    return;
  }

  guesses.push(guess);
  if (word.indexOf(guess) === -1) {
    lives--;
  }

  const gameData = {
    word: getWordWithGuesses(),
    guesses: guesses,
    lives: lives,
    isGameOver: lives === 0 || !getWordWithGuesses().includes('_'),
    
    status: status,
  };

  io.sockets.emit('gameData', gameData);

  if (gameData.isGameOver) {
    // Fim do jogo
    const result = lives === 0 ? 'Você perdeu!' : 'Você ganhou!';
    status = result;
    io.sockets.emit('gameOver', { result: result, word: word });
    setTimeout(initializeGame, 1000);
  }
}

function getWordWithGuesses() {
  return word
    .split('')
    .map((char) => (guesses.includes(char) ? char : '_'))
    .join(' ');
}

io.on('connection', (socket) => {
  console.log('Novo jogador conectado');

  initializeGame();

  socket.emit('gameData', {
    word: getWordWithGuesses(),
    guesses: guesses,
    lives: lives,    
    isGameOver: false,
    status: status,
  });

  socket.on('guess', (guess) => {
    handleGuess(guess, socket);
  });

  socket.on('disconnect', () => {
    console.log('Jogador desconectado');
  });

  socket.on('gameOver', (data) => {
    const result = data.result;
    const correctWord = data.word;
  
    console.log(result);
    console.log('Palavra correta:', correctWord);
    // Exiba a palavra correta de alguma forma na interface do jogo
  });

  socket.on('restartGame', () => {
    initializeGame();
    io.sockets.emit('gameData', {
      word: getWordWithGuesses(),
      guesses: guesses,
      lives: lives,
      
      isGameOver: false,
      status: status,
    });
  });
});

app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist'));
app.use(express.static(__dirname));

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
