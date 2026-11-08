import React, { useState } from 'react';
import { sounds } from '../audio/soundEffects.js';
import { Lock, X, KeyRound } from 'lucide-react';

export function PasswordPromptModal({ isOpen, roomName, onClose, onSubmit, errorMessage }) {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      sounds.playDraw();
      return;
    }
    sounds.playClick();
    onSubmit(password.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop">
      <div className="pixel-panel w-full max-w-sm bg-pixel-panel text-white p-6 relative">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex p-3 bg-pixel-red/20 border-2 border-pixel-red text-pixel-red mb-2">
            <Lock size={28} />
          </div>
          <h3 className="font-pixel text-sm text-pixel-yellow">
            SALA TRANCADA!
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            "{roomName}" exige uma senha para entrar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-pixel text-pixel-mint mb-1">
              DIGITE A SENHA / PIN:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha..."
              className="pixel-input w-full text-center tracking-widest text-base"
              autoFocus
            />
          </div>

          {errorMessage && (
            <p className="text-pixel-red text-xs text-center font-bold animate-pulse">
              ❌ {errorMessage}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="pixel-btn pixel-btn-red flex-1 py-2 text-xs"
            >
              VOLTAR
            </button>
            <button
              type="submit"
              className="pixel-btn pixel-btn-green flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <KeyRound size={14} />
              <span>ENTRAR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
