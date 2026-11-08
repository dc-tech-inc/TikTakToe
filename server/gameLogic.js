/**
 * Regras e Lógica de Jogo do Jogo da Velha (Tic-Tac-Toe)
 */

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Linha 1
  [3, 4, 5], // Linha 2
  [6, 7, 8], // Linha 3
  [0, 3, 6], // Coluna 1
  [1, 4, 7], // Coluna 2
  [2, 5, 8], // Coluna 3
  [0, 4, 8], // Diagonal principal
  [2, 4, 6]  // Diagonal secundária
];

/**
 * Cria um novo estado de jogo
 * @param {'X' | 'O'} startingTurn 
 * @returns {object}
 */
export function createInitialGameState(startingTurn = 'X') {
  return {
    board: Array(9).fill(null),
    currentTurn: startingTurn,
    winner: null, // 'X' | 'O' | 'draw' | null
    winningLine: null, // [number, number, number] | null
    status: 'waiting', // 'waiting' | 'playing' | 'finished'
    startingTurn
  };
}

/**
 * Verifica se há um vencedor no tabuleiro
 * @param {Array<string|null>} board 
 * @returns {{ winner: 'X'|'O', line: number[] } | null}
 */
export function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return null;
}

/**
 * Verifica se o tabuleiro está totalmente preenchido
 * @param {Array<string|null>} board 
 * @returns {boolean}
 */
export function isBoardFull(board) {
  return board.every(cell => cell !== null);
}

/**
 * Executa uma jogada no tabuleiro
 * @param {object} gameState 
 * @param {number} cellIndex 
 * @param {'X' | 'O'} playerSymbol 
 * @returns {{ success: boolean, gameState?: object, error?: string }}
 */
export function makeMove(gameState, cellIndex, playerSymbol) {
  if (!gameState) {
    return { success: false, error: 'Jogo inválido' };
  }

  if (gameState.status !== 'playing') {
    return { success: false, error: 'A partida não está em andamento' };
  }

  if (cellIndex < 0 || cellIndex > 8) {
    return { success: false, error: 'Posição do tabuleiro fora dos limites' };
  }

  if (gameState.board[cellIndex] !== null) {
    return { success: false, error: 'Esta casa já está ocupada' };
  }

  if (gameState.currentTurn !== playerSymbol) {
    return { success: false, error: 'Não é a sua vez de jogar' };
  }

  // Cria cópia do tabuleiro para imutabilidade
  const newBoard = [...gameState.board];
  newBoard[cellIndex] = playerSymbol;

  // Verifica vitória
  const winResult = checkWinner(newBoard);
  if (winResult) {
    return {
      success: true,
      gameState: {
        ...gameState,
        board: newBoard,
        winner: winResult.winner,
        winningLine: winResult.line,
        status: 'finished'
      }
    };
  }

  // Verifica empate
  if (isBoardFull(newBoard)) {
    return {
      success: true,
      gameState: {
        ...gameState,
        board: newBoard,
        winner: 'draw',
        winningLine: null,
        status: 'finished'
      }
    };
  }

  // Alterna o turno
  const nextTurn = playerSymbol === 'X' ? 'O' : 'X';
  return {
    success: true,
    gameState: {
      ...gameState,
      board: newBoard,
      currentTurn: nextTurn
    }
  };
}

/**
 * Reinicia o tabuleiro para uma nova rodada mantendo ou alternando quem inicia
 * @param {object} gameState 
 * @param {boolean} alternateStartingTurn 
 * @returns {object}
 */
export function resetBoard(gameState, alternateStartingTurn = true) {
  const nextStartingTurn = alternateStartingTurn
    ? (gameState.startingTurn === 'X' ? 'O' : 'X')
    : gameState.startingTurn;

  return {
    board: Array(9).fill(null),
    currentTurn: nextStartingTurn,
    winner: null,
    winningLine: null,
    status: 'playing',
    startingTurn: nextStartingTurn
  };
}
