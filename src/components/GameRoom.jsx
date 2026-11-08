import React, { useState, useEffect } from 'react';
import { Board } from './Board.jsx';
import { PlayerCard } from './PlayerCard.jsx';
import { ReactionBar } from './ReactionBar.jsx';
import { PixelConfetti } from './PixelConfetti.jsx';
import { sounds } from '../audio/soundEffects.js';
import {
  Copy,
  Check,
  RotateCcw,
  Eye,
  Lock,
  Globe,
  Link2,
  Edit2,
  Share2,
  AlertCircle
} from 'lucide-react';

export function GameRoom({
  room,
  user,
  role,
  onMakeMove,
  onRematch,
  onRenameRoom,
  onSendReaction,
  onSendChatMessage,
  lastReaction
}) {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameText, setEditNameText] = useState(room.name);
  const [showConfetti, setShowConfetti] = useState(false);

  const gameState = room.gameState;
  const isPlaying = gameState.status === 'playing';
  const isFinished = gameState.status === 'finished';
  const isWaiting = gameState.status === 'waiting';

  const isHost = room.hostSocketId === user.socketId || role === 'X';
  const isMyTurn = isPlaying && gameState.currentTurn === role;
  const isSpectator = role === 'spectator';

  // Gatilho de vitória e confetes
  useEffect(() => {
    if (gameState.winner && gameState.winner !== 'draw') {
      setShowConfetti(true);
      if (gameState.winner === role) {
        sounds.playWin();
      } else {
        sounds.playDraw();
      }
    } else if (gameState.winner === 'draw') {
      sounds.playDraw();
      setShowConfetti(false);
    } else {
      setShowConfetti(false);
    }
  }, [gameState.winner, role]);

  const handleCopyLink = () => {
    sounds.playClick();
    const url = `${window.location.origin}/?sala=${room.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    if (!editNameText.trim()) return;
    sounds.playClick();
    onRenameRoom(editNameText.trim());
    setIsEditingName(false);
  };

  // Frases de status bem humoradas e em português natural
  let statusMessage = '';
  if (isWaiting) {
    statusMessage = 'Aguardando o segundo jogador entrar na sala... Convide um amigo!';
  } else if (isPlaying) {
    if (isMyTurn) {
      statusMessage = '★ É A SUA VEZ! Escolha uma casa no tabuleiro! ★';
    } else {
      const opponentName = role === 'X' ? room.players.O?.name : room.players.X?.name;
      statusMessage = `Vez de ${opponentName || 'seu adversário'}. Pensando na melhor jogada...`;
    }
  } else if (isFinished) {
    if (gameState.winner === 'draw') {
      statusMessage = '😅 DEU VELHA! Foi um empate disputadíssimo!';
    } else if (gameState.winner === role) {
      statusMessage = '🎉 VITÓRIA! Você jogou muito bem!';
    } else {
      const winnerName = gameState.winner === 'X' ? room.players.X?.name : room.players.O?.name;
      statusMessage = `👑 ${winnerName || 'O adversário'} venceu esta partida!`;
    }
  }

  const hasVotedRematch = room.rematchVotes && room.rematchVotes.includes(user.socketId);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Confetes na Vitória */}
      <PixelConfetti active={showConfetti} />

      {/* Barra Superior da Sala: Nome, Tipo e Link de Compartilhamento */}
      <div className="pixel-panel p-3 bg-pixel-panel flex flex-wrap items-center justify-between gap-3">
        {/* Nome da Sala com Edição */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
              <input
                type="text"
                value={editNameText}
                onChange={(e) => setEditNameText(e.target.value)}
                maxLength={30}
                className="pixel-input text-xs py-1"
                autoFocus
              />
              <button
                type="submit"
                className="pixel-btn pixel-btn-green px-2 py-1 text-[10px]"
              >
                SALVAR
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="pixel-btn pixel-btn-red px-2 py-1 text-[10px]"
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-pixel text-xs sm:text-sm text-pixel-yellow flex items-center gap-1.5">
                {room.name}
              </h2>
              {isHost && (
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  title="Alterar nome da sala"
                  className="text-gray-400 hover:text-pixel-yellow"
                >
                  <Edit2 size={13} />
                </button>
              )}
            </div>
          )}

          {/* Tag de Tipo da Sala */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-pixel border border-black bg-pixel-dark/80 text-gray-200">
            {room.type === 'public' && <Globe size={10} className="text-pixel-mint" />}
            {room.type === 'private' && <Link2 size={10} className="text-pixel-orange" />}
            {room.type === 'password' && <Lock size={10} className="text-pixel-red" />}
            {room.type === 'public' ? 'PÚBLICA' : room.type === 'private' ? 'PRIVADA' : 'COM SENHA'}
          </span>
        </div>

        {/* Botão Copiar Link da Sala com feedback */}
        <div className="flex items-center gap-2">
          {room.spectators && room.spectators.length > 0 && (
            <div className="text-[10px] font-pixel text-pixel-mint flex items-center gap-1 mr-1">
              <Eye size={12} />
              <span>{room.spectators.length} assistindo</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className={`pixel-btn px-3 py-1.5 text-[10px] flex items-center gap-1.5 ${
              copied ? 'pixel-btn-green' : 'pixel-btn-yellow'
            }`}
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            <span>{copied ? 'LINK COPIADO!' : 'COPIAR LINK DA SALA'}</span>
          </button>
        </div>
      </div>

      {/* Alerta de Link Copiado */}
      {copied && (
        <div className="pixel-panel p-2 bg-pixel-green text-black font-pixel text-center text-[10px] animate-pop border-2 border-black">
          ✓ Link copiado para sua área de transferência! Envie para seus amigos entrarem direto!
        </div>
      )}

      {/* Aviso caso seja espectador */}
      {isSpectator && (
        <div className="pixel-panel p-2 bg-pixel-blue/40 border-2 border-pixel-blue flex items-center justify-center gap-2 text-xs font-pixel text-pixel-mint">
          <Eye size={16} />
          <span>Você está no modo Espectador assistindo à partida!</span>
        </div>
      )}

      {/* Placar Retrô Central */}
      <div className="pixel-panel p-2.5 bg-pixel-dark/80 flex items-center justify-around text-center border-2 border-black">
        <div className="flex-1">
          <span className="block text-[9px] font-pixel text-pixel-pink">
            {room.players.X?.name || 'JOGADOR X'}
          </span>
          <span className="font-pixel text-base text-pixel-yellow">
            {room.scores?.X || 0}
          </span>
        </div>

        <div className="px-4 border-x-2 border-black/50 text-center">
          <span className="block text-[8px] font-pixel text-gray-400">
            EMPATES ({room.scores?.draws || 0})
          </span>
          <span className="text-[10px] font-pixel text-pixel-mint">
            PARTIDAS: {room.scores?.total || 0}
          </span>
        </div>

        <div className="flex-1">
          <span className="block text-[9px] font-pixel text-pixel-cyan">
            {room.players.O?.name || 'JOGADOR O'}
          </span>
          <span className="font-pixel text-base text-pixel-yellow">
            {room.scores?.O || 0}
          </span>
        </div>
      </div>

      {/* Banner de Status da Partida */}
      <div
        className={`pixel-panel p-2.5 text-center font-pixel text-xs border-2 transition-all ${
          isMyTurn
            ? 'bg-pixel-yellow text-black border-black animate-bounce-gentle font-bold'
            : isFinished
            ? 'bg-pixel-purple text-pixel-yellow border-black'
            : 'bg-pixel-panel text-gray-200 border-black'
        }`}
      >
        {statusMessage}
      </div>

      {/* Área Central: Player X vs Tabuleiro vs Player O */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6">
        {/* Cartão Jogador X */}
        <div className="w-full md:w-auto flex justify-center">
          <PlayerCard
            player={room.players.X}
            symbol="X"
            isCurrentTurn={isPlaying && gameState.currentTurn === 'X'}
            isWinner={gameState.winner === 'X'}
            isLoser={gameState.winner === 'O'}
            isYou={role === 'X'}
            score={room.scores?.X || 0}
            recentReaction={lastReaction?.targetRole === 'X' ? lastReaction : null}
          />
        </div>

        {/* Tabuleiro 3x3 */}
        <div className="flex flex-col items-center">
          <Board
            board={gameState.board}
            onCellClick={onMakeMove}
            winningLine={gameState.winningLine}
            isMyTurn={isMyTurn}
            mySymbol={role}
            disabled={!isPlaying || isSpectator}
          />

          {/* Botão de Revanche / Jogar Novamente (se a partida terminou) */}
          {isFinished && !isSpectator && (
            <div className="mt-4 animate-pop">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onRematch();
                }}
                disabled={hasVotedRematch}
                className={`pixel-btn px-6 py-3 text-xs flex items-center gap-2 ${
                  hasVotedRematch ? 'pixel-btn-yellow opacity-80' : 'pixel-btn-green'
                }`}
              >
                <RotateCcw size={16} />
                <span>
                  {hasVotedRematch
                    ? 'AGUARDANDO ADVERSÁRIO ACEITAR...'
                    : 'JOGAR NOVAMENTE / REVANCHE'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Cartão Jogador O */}
        <div className="w-full md:w-auto flex justify-center">
          <PlayerCard
            player={room.players.O}
            symbol="O"
            isCurrentTurn={isPlaying && gameState.currentTurn === 'O'}
            isWinner={gameState.winner === 'O'}
            isLoser={gameState.winner === 'X'}
            isYou={role === 'O'}
            score={room.scores?.O || 0}
            recentReaction={lastReaction?.targetRole === 'O' ? lastReaction : null}
          />
        </div>
      </div>

      {/* Barra de Reações e Mensagens Rápidas */}
      <ReactionBar
        onSendReaction={(emoji) => onSendReaction(emoji, role)}
        onSendChatMessage={onSendChatMessage}
      />

      {/* Histórico do Chat da Sala */}
      {room.chatMessages && room.chatMessages.length > 0 && (
        <div className="pixel-panel p-3 bg-pixel-panel/80 space-y-1.5 max-h-36 overflow-y-auto border-2 border-black">
          <div className="text-[10px] font-pixel text-pixel-mint mb-1">
            MENSAGENS NA SALA:
          </div>
          {room.chatMessages.map((msg) => (
            <div key={msg.id} className="text-xs flex items-center gap-2">
              <span className="font-pixel text-[10px] text-pixel-yellow">
                {msg.userName}:
              </span>
              <span className="text-white">{msg.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
