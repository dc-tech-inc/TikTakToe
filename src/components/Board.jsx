import React from 'react';
import { PixelPieceX, PixelPieceO } from './PixelAvatars.jsx';
import { sounds } from '../audio/soundEffects.js';

export function Board({
  board = Array(9).fill(null),
  onCellClick,
  winningLine = null,
  isMyTurn = false,
  mySymbol = null,
  disabled = false
}) {
  const handleCellClick = (index) => {
    if (disabled || board[index] !== null || !isMyTurn) {
      if (!isMyTurn && board[index] === null && !disabled) {
        sounds.playClick();
      }
      return;
    }
    sounds.playMove(mySymbol || 'X');
    onCellClick(index);
  };

  return (
    <div className="relative inline-block mx-auto p-3 bg-pixel-panel border-4 border-black shadow-pixel-lg">
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]">
        {board.map((cell, index) => {
          const isWinningCell = winningLine && winningLine.includes(index);
          const isOccupied = cell !== null;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleCellClick(index)}
              disabled={disabled || isOccupied || !isMyTurn}
              aria-label={`Casa ${index + 1}: ${cell || 'vazia'}`}
              className={`board-cell ${isOccupied ? 'occupied' : ''} ${
                isWinningCell ? 'winning-cell' : ''
              } ${
                !isOccupied && isMyTurn && !disabled
                  ? 'hover:border-pixel-yellow hover:scale-[1.03] cursor-pointer'
                  : ''
              }`}
            >
              {cell === 'X' && (
                <div className="animate-pop">
                  <PixelPieceX size={window.innerWidth < 640 ? 56 : 72} />
                </div>
              )}
              {cell === 'O' && (
                <div className="animate-pop">
                  <PixelPieceO size={window.innerWidth < 640 ? 56 : 72} />
                </div>
              )}
              {!cell && isMyTurn && !disabled && (
                <div className="opacity-0 hover:opacity-30 transition-opacity">
                  {mySymbol === 'X' ? (
                    <PixelPieceX size={36} />
                  ) : (
                    <PixelPieceO size={36} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
