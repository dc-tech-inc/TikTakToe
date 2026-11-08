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
      <div className="grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]">
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
              className={`board-cell w-full h-full aspect-square min-w-0 min-h-0 flex items-center justify-center overflow-hidden ${
                isOccupied ? 'occupied' : ''
              } ${
                isWinningCell ? 'winning-cell' : ''
              } ${
                !isOccupied && isMyTurn && !disabled
                  ? 'hover:border-pixel-yellow hover:scale-[1.03] cursor-pointer'
                  : ''
              }`}
            >
              {cell === 'X' && (
                <div className="animate-pop w-full h-full flex items-center justify-center p-2.5 sm:p-3 pointer-events-none select-none">
                  <PixelPieceX size={window.innerWidth < 640 ? 56 : 70} className="max-w-full max-h-full" />
                </div>
              )}
              {cell === 'O' && (
                <div className="animate-pop w-full h-full flex items-center justify-center p-2.5 sm:p-3 pointer-events-none select-none">
                  <PixelPieceO size={window.innerWidth < 640 ? 56 : 70} className="max-w-full max-h-full" />
                </div>
              )}
              {!cell && isMyTurn && !disabled && (
                <div className="w-full h-full flex items-center justify-center p-2 opacity-0 hover:opacity-30 transition-opacity pointer-events-none select-none">
                  {mySymbol === 'X' ? (
                    <PixelPieceX size={36} className="max-w-full max-h-full" />
                  ) : (
                    <PixelPieceO size={36} className="max-w-full max-h-full" />
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
