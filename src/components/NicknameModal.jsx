import React, { useState } from 'react';
import { PixelAvatar, AVATAR_LIST } from './PixelAvatars.jsx';
import { sounds } from '../audio/soundEffects.js';
import { Sparkles, Check } from 'lucide-react';

const FUN_NAMES = [
  'Gato Cósmico', 'Pato Ninja', 'Sapo Saltitante', 'Robô 3000',
  'Pipoca Veloz', 'Mestre do X', 'Rei da Velha', 'Estrela Pixel',
  'Coelho Turbo', 'Urso Fofo', 'Tigre Retrô', 'Mega Jogador'
];

export function NicknameModal({ isOpen, initialUser, onSave, onClose, mandatory = false }) {
  const [nickname, setNickname] = useState(initialUser?.name || '');
  const [avatar, setAvatar] = useState(initialUser?.avatar || 'cat');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRandomName = () => {
    sounds.playClick();
    const random = FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)];
    setNickname(random);
    setError('');
  };

  const handleSave = (e) => {
    e?.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      sounds.playDraw();
      setError('Por favor, digite um apelido para começar!');
      return;
    }
    if (trimmed.length < 2) {
      sounds.playDraw();
      setError('O apelido deve ter pelo menos 2 caracteres.');
      return;
    }
    if (trimmed.length > 18) {
      sounds.playDraw();
      setError('O apelido pode ter no máximo 18 caracteres.');
      return;
    }

    sounds.playJoinAlert();
    onSave({ name: trimmed, avatar });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop">
      <div className="pixel-panel w-full max-w-md p-6 bg-pixel-panel text-white">
        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <PixelAvatar id={avatar} mood="celebrating" size={72} />
          </div>
          <h2 className="font-pixel text-lg text-pixel-yellow">
            {mandatory ? 'BEM-VINDO AO JOGO!' : 'EDITAR MEU PERFIL'}
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Escolha seu apelido e seu avatar pixelado favorito:
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Campo de Apelido */}
          <div>
            <label className="block text-xs font-pixel text-pixel-mint mb-2">
              SEU APELIDO:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                maxLength={18}
                placeholder="Ex: MestrePixel"
                className="pixel-input flex-1 text-base text-yellow-300 font-bold"
                autoFocus
              />
              <button
                type="button"
                onClick={handleRandomName}
                title="Gerar nome divertido aleatório"
                className="pixel-btn pixel-btn-purple px-3 py-2 text-xs"
              >
                <Sparkles size={16} />
              </button>
            </div>
            {error && (
              <p className="text-pixel-red text-xs mt-1.5 font-bold animate-pulse">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Seleção de Avatares */}
          <div>
            <label className="block text-xs font-pixel text-pixel-mint mb-2">
              ESCOLHA SEU AVATAR:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVATAR_LIST.map((av) => {
                const isSelected = avatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setAvatar(av.id);
                    }}
                    className={`p-2 border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-pixel-yellow bg-pixel-border/80 shadow-[2px_2px_0px_#000] scale-105'
                        : 'border-transparent bg-pixel-dark/40 hover:bg-pixel-dark/70'
                    }`}
                  >
                    <PixelAvatar id={av.id} mood={isSelected ? 'celebrating' : 'idle'} size={40} />
                    <span className="text-[10px] font-pixel text-gray-200">
                      {av.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 flex gap-3">
            {!mandatory && onClose && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                className="pixel-btn pixel-btn-red flex-1 py-3 text-xs"
              >
                CANCELAR
              </button>
            )}
            <button
              type="submit"
              className="pixel-btn pixel-btn-green flex-1 py-3 text-xs flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span>{mandatory ? 'VAMOS JOGAR!' : 'SALVAR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
