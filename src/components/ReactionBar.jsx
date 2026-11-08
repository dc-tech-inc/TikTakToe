import React from 'react';
import { sounds } from '../audio/soundEffects.js';
import { MessageSquare, Smile } from 'lucide-react';

const EMOJI_REACTIONS = ['❤️', '😂', '🔥', '😮', '🏆', '👏', '😴', '✨'];

const QUICK_PHRASES = [
  'Boa jogada! 👏',
  'Quase lá! 😮',
  'Agora vai! 🔥',
  'Revanche logo! ⚔️',
  'Partida incrível! ⭐',
  'Boa sorte! 🍀'
];

export function ReactionBar({ onSendReaction, onSendChatMessage }) {
  const handleEmojiClick = (emoji) => {
    sounds.playReaction();
    onSendReaction(emoji);
  };

  const handlePhraseClick = (text) => {
    sounds.playClick();
    onSendChatMessage(text);
  };

  return (
    <div className="pixel-panel p-3 bg-pixel-panel space-y-2">
      {/* Linha de Emojis Rápidos */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        <div className="flex items-center gap-1 text-[10px] font-pixel text-pixel-mint mr-1 select-none">
          <Smile size={14} />
          <span className="hidden sm:inline">REAGIR:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              title={`Enviar reação ${emoji}`}
              className="w-8 h-8 rounded bg-pixel-dark/60 border border-black hover:bg-pixel-dark hover:scale-115 active:scale-95 transition-transform flex items-center justify-center text-lg shadow-[1px_1px_0px_#000]"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Frases Rápidas Infantis e Divertidas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-black/30">
        <div className="text-[10px] font-pixel text-pixel-yellow mr-1 select-none flex items-center gap-1">
          <MessageSquare size={12} />
          <span className="hidden sm:inline">CHAT:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-nowrap">
          {QUICK_PHRASES.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => handlePhraseClick(phrase)}
              className="px-2 py-1 bg-pixel-dark/50 hover:bg-pixel-dark border border-black text-[11px] whitespace-nowrap text-gray-200 hover:text-white rounded transition-colors active:translate-y-0.5"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
