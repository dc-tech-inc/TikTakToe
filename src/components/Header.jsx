import React, { useState } from 'react';
import { PixelAvatar } from './PixelAvatars.jsx';
import { sounds } from '../audio/soundEffects.js';
import { Volume2, VolumeX, User, LogOut, Gamepad2 } from 'lucide-react';

export function Header({ user, onEditUser, inRoom = false, onLeaveRoom }) {
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
    if (!next) {
      sounds.playClick();
    }
  };

  return (
    <header className="pixel-panel bg-pixel-panel border-b-4 border-black mb-6 px-4 py-3">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo / Título */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pixel-yellow border-2 border-black shadow-[2px_2px_0px_#000] rotate-[-3deg]">
            <Gamepad2 className="text-black" size={24} />
          </div>
          <div>
            <h1 className="font-pixel text-sm sm:text-base text-pixel-yellow drop-shadow-[2px_2px_0px_#000] tracking-wider">
              JOGO DA VELHA
            </h1>
            <p className="text-[10px] font-pixel text-pixel-mint">
              ★ EDIÇÃO MULTIPLAYER RETRÔ ★
            </p>
          </div>
        </div>

        {/* Controles da Direita */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Botão de Som */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={isMuted ? 'Ativar Efeitos Sonoros 8-bit' : 'Silenciar Sons'}
            className={`pixel-btn p-2 text-xs ${
              isMuted ? 'pixel-btn-red' : 'pixel-btn-yellow'
            }`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Cartão de Perfil do Usuário */}
          {user && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onEditUser();
              }}
              title="Clique para trocar apelido ou avatar"
              className="pixel-panel px-3 py-1.5 flex items-center gap-2 hover:bg-pixel-border/60 transition-all cursor-pointer"
            >
              <PixelAvatar id={user.avatar} mood="idle" size={28} />
              <div className="text-left">
                <span className="block font-pixel text-[10px] text-pixel-yellow max-w-[120px] truncate">
                  {user.name}
                </span>
                <span className="text-[9px] text-gray-300 flex items-center gap-1">
                  <User size={10} /> mudar
                </span>
              </div>
            </button>
          )}

          {/* Botão Sair da Sala */}
          {inRoom && onLeaveRoom && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onLeaveRoom();
              }}
              className="pixel-btn pixel-btn-red px-3 py-2 text-[10px] flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">SAIR</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
