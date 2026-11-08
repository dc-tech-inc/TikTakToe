import React from 'react';
import { PixelAvatar, PixelPieceX, PixelPieceO } from './PixelAvatars.jsx';

export function PlayerCard({
  player,
  symbol = 'X',
  isCurrentTurn = false,
  isWinner = false,
  isLoser = false,
  isYou = false,
  score = 0,
  recentReaction = null
}) {
  // Determina expressão facial do avatar
  let mood = 'idle';
  if (isWinner) {
    mood = 'celebrating';
  } else if (isLoser) {
    mood = 'surprised';
  } else if (isCurrentTurn) {
    mood = 'thinking';
  }

  if (!player) {
    return (
      <div className="pixel-panel p-4 bg-pixel-panel/60 border-dashed border-gray-600 flex flex-col items-center justify-center text-center w-full max-w-[200px] min-h-[170px]">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center text-gray-500 mb-2 font-pixel text-xs">
          ?
        </div>
        <p className="font-pixel text-[10px] text-gray-400">
          Aguardando
        </p>
        <p className="text-[10px] text-pixel-mint animate-pulse mt-1">
          Jogador {symbol}...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`pixel-panel p-3.5 sm:p-4 flex flex-col items-center text-center w-full max-w-[210px] relative transition-all ${
        isCurrentTurn
          ? 'border-pixel-yellow ring-2 ring-pixel-yellow bg-gradient-to-b from-[#3a4466] to-pixel-panel shadow-[0_0_15px_rgba(254,231,97,0.4)]'
          : 'bg-pixel-panel'
      }`}
    >
      {/* Balão flutuante de Reação Emoji */}
      {recentReaction && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 animate-pop">
          <div className="px-2 py-1 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_#000] text-xl select-none animate-bounce">
            {recentReaction.emoji}
          </div>
        </div>
      )}

      {/* Símbolo do Jogador (X ou O) no topo */}
      <div className="flex items-center justify-between w-full mb-1">
        <div className="flex items-center gap-1">
          {symbol === 'X' ? (
            <PixelPieceX size={18} />
          ) : (
            <PixelPieceO size={18} />
          )}
          <span className="font-pixel text-[9px] text-pixel-mint">
            JOGADOR {symbol}
          </span>
        </div>
        {isYou && (
          <span className="bg-pixel-yellow text-black font-pixel text-[8px] px-1.5 py-0.5 border border-black font-bold">
            VOCÊ
          </span>
        )}
      </div>

      {/* Avatar Pixel com Expressão */}
      <div className="my-2 relative">
        <PixelAvatar id={player.avatar || 'cat'} mood={mood} size={58} />
      </div>

      {/* Nome do Jogador */}
      <h3 className="font-pixel text-xs text-white truncate max-w-[170px]" title={player.name}>
        {player.name}
      </h3>

      {/* Indicador de Status / Vez */}
      <div className="mt-1.5 mb-2 h-5 flex items-center justify-center">
        {isWinner ? (
          <span className="text-[9px] font-pixel text-pixel-yellow animate-bounce">
            👑 VENCEU!
          </span>
        ) : isCurrentTurn ? (
          <span className="text-[9px] font-pixel text-pixel-lime animate-pulse">
            ▶ SUA VEZ!
          </span>
        ) : (
          <span className="text-[9px] text-gray-400">
            Aguardando...
          </span>
        )}
      </div>

      {/* Placar de Vitórias */}
      <div className="w-full pt-2 border-t-2 border-black/40 flex items-center justify-between text-[10px] font-pixel text-gray-300">
        <span>VITÓRIAS:</span>
        <span className="text-pixel-yellow text-xs font-bold">{score}</span>
      </div>
    </div>
  );
}
