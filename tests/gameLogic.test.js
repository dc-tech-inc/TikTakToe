import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  checkWinner,
  isBoardFull,
  makeMove,
  resetBoard,
  WINNING_COMBINATIONS
} from '../server/gameLogic.js';

describe('Lógica do Jogo da Velha (Tic-Tac-Toe)', () => {
  it('deve inicializar o jogo no estado correto', () => {
    const state = createInitialGameState('X');
    expect(state.board).toEqual(Array(9).fill(null));
    expect(state.currentTurn).toBe('X');
    expect(state.winner).toBeNull();
    expect(state.winningLine).toBeNull();
    expect(state.status).toBe('waiting');
  });

  it('deve detectar vitória em todas as 3 linhas', () => {
    // Linha 0 (0, 1, 2)
    const boardRow0 = ['X', 'X', 'X', null, null, null, null, null, null];
    const win0 = checkWinner(boardRow0);
    expect(win0).toEqual({ winner: 'X', line: [0, 1, 2] });

    // Linha 1 (3, 4, 5)
    const boardRow1 = [null, null, null, 'O', 'O', 'O', null, null, null];
    const win1 = checkWinner(boardRow1);
    expect(win1).toEqual({ winner: 'O', line: [3, 4, 5] });

    // Linha 2 (6, 7, 8)
    const boardRow2 = [null, null, null, null, null, null, 'X', 'X', 'X'];
    const win2 = checkWinner(boardRow2);
    expect(win2).toEqual({ winner: 'X', line: [6, 7, 8] });
  });

  it('deve detectar vitória em todas as 3 colunas', () => {
    // Coluna 0 (0, 3, 6)
    const boardCol0 = ['O', null, null, 'O', null, null, 'O', null, null];
    expect(checkWinner(boardCol0)).toEqual({ winner: 'O', line: [0, 3, 6] });

    // Coluna 1 (1, 4, 7)
    const boardCol1 = [null, 'X', null, null, 'X', null, null, 'X', null];
    expect(checkWinner(boardCol1)).toEqual({ winner: 'X', line: [1, 4, 7] });

    // Coluna 2 (2, 5, 8)
    const boardCol2 = [null, null, 'O', null, null, 'O', null, null, 'O'];
    expect(checkWinner(boardCol2)).toEqual({ winner: 'O', line: [2, 5, 8] });
  });

  it('deve detectar vitória em ambas as diagonais', () => {
    // Diagonal principal (0, 4, 8)
    const diag1 = ['X', null, null, null, 'X', null, null, null, 'X'];
    expect(checkWinner(diag1)).toEqual({ winner: 'X', line: [0, 4, 8] });

    // Diagonal secundária (2, 4, 6)
    const diag2 = [null, null, 'O', null, 'O', null, 'O', null, null];
    expect(checkWinner(diag2)).toEqual({ winner: 'O', line: [2, 4, 6] });
  });

  it('deve identificar tabuleiro cheio e empate', () => {
    const fullBoardNoWin = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X'
    ];
    expect(isBoardFull(fullBoardNoWin)).toBe(true);
    expect(checkWinner(fullBoardNoWin)).toBeNull();
  });

  it('deve alternar turnos e registrar jogada com sucesso', () => {
    let state = createInitialGameState('X');
    state.status = 'playing';

    const res1 = makeMove(state, 0, 'X');
    expect(res1.success).toBe(true);
    expect(res1.gameState.board[0]).toBe('X');
    expect(res1.gameState.currentTurn).toBe('O');

    const res2 = makeMove(res1.gameState, 4, 'O');
    expect(res2.success).toBe(true);
    expect(res2.gameState.board[4]).toBe('O');
    expect(res2.gameState.currentTurn).toBe('X');
  });

  it('deve rejeitar jogada fora de vez', () => {
    let state = createInitialGameState('X');
    state.status = 'playing';

    const res = makeMove(state, 0, 'O');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Não é a sua vez de jogar');
  });

  it('deve rejeitar jogada em casa já ocupada', () => {
    let state = createInitialGameState('X');
    state.status = 'playing';
    state.board[0] = 'X';

    const res = makeMove(state, 0, 'X');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Esta casa já está ocupada');
  });

  it('deve rejeitar jogada quando a partida não está em andamento', () => {
    let state = createInitialGameState('X');
    state.status = 'waiting';

    const res = makeMove(state, 0, 'X');
    expect(res.success).toBe(false);
    expect(res.error).toBe('A partida não está em andamento');
  });

  it('deve finalizar o jogo com vitória e destacar a linha vencedora', () => {
    let state = {
      board: ['X', 'X', null, 'O', 'O', null, null, null, null],
      currentTurn: 'X',
      winner: null,
      winningLine: null,
      status: 'playing',
      startingTurn: 'X'
    };

    const res = makeMove(state, 2, 'X');
    expect(res.success).toBe(true);
    expect(res.gameState.winner).toBe('X');
    expect(res.gameState.winningLine).toEqual([0, 1, 2]);
    expect(res.gameState.status).toBe('finished');
  });

  it('deve finalizar o jogo com empate quando preenchido sem vencedor', () => {
    let state = {
      board: [
        'X', 'O', 'X',
        'X', 'O', 'O',
        'O', 'X', null
      ],
      currentTurn: 'X',
      winner: null,
      winningLine: null,
      status: 'playing',
      startingTurn: 'X'
    };

    const res = makeMove(state, 8, 'X');
    expect(res.success).toBe(true);
    expect(res.gameState.winner).toBe('draw');
    expect(res.gameState.winningLine).toBeNull();
    expect(res.gameState.status).toBe('finished');
  });

  it('deve reiniciar o tabuleiro alternando o jogador inicial', () => {
    const finishedState = {
      board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
      currentTurn: 'O',
      winner: 'X',
      winningLine: [0, 1, 2],
      status: 'finished',
      startingTurn: 'X'
    };

    const resetState = resetBoard(finishedState, true);
    expect(resetState.board).toEqual(Array(9).fill(null));
    expect(resetState.currentTurn).toBe('O'); // Alternou de X para O
    expect(resetState.startingTurn).toBe('O');
    expect(resetState.winner).toBeNull();
    expect(resetState.status).toBe('playing');
  });
});
